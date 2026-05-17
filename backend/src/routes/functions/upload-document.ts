import type { Request } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { saveFile } from "../../lib/storage.js";
import { extractTextFromFile } from "../../services/text-extraction.js";
import { chatCompletion } from "../../services/openai.js";
import { generateAndStoreEmbedding } from "../../services/embeddings.js";
import { publishJobProgress } from "../../realtime/progress.js";
import { htmlFromText } from "../../services/html-from-text.js";

const schema = z.object({
  filename: z.string(),
  fileBase64: z.string(),
  title: z.string().optional(),
  titleAr: z.string().optional(),
  language: z.string().default("fr"),
  categoryId: z.string().uuid().optional().nullable(),
  documentTypeId: z.string().uuid().optional().nullable(),
  // Optional: skip auto-processing for very large files
  skipProcessing: z.boolean().optional(),
});

export type DocKind = "jurisprudence" | "commentaire" | "blog" | "analyse" | "generic";

export function classifyDocType(documentTypeName: string | null | undefined): DocKind {
  const t = (documentTypeName ?? "").toLowerCase();
  if (t.includes("jurisprudence") || t.includes("جذاذة") || t.includes("فقه")) return "jurisprudence";
  if (t.includes("commentaire") || t.includes("تعليق")) return "commentaire";
  if (t.includes("blog") || t.includes("تدوين") || t.includes("مدونة")) return "blog";
  if (t.includes("analyse") || t.includes("opinion") || t.includes("تحليل")) return "analyse";
  return "generic";
}

/**
 * Build the metadata-only prompt for a given document type.
 *  - We NEVER ask the AI to rewrite the body. The body is the HTML
 *    produced by htmlFromText() and stays as the source of truth.
 *  - The AI emits short scalar fields only (title, author, summary,
 *    keywords, plus type-specific metadata like court / case_number).
 *  - All output is in the SOURCE language. Translation runs later on
 *    user click via /api/fn/translate-fields.
 */
function buildMetadataPrompt(
  documentTypeName: string | null | undefined,
  sourceLang: "fr" | "ar" | "auto",
): string {
  const kind = classifyDocType(documentTypeName);
  const lang = sourceLang === "auto" ? "ar" : sourceLang;
  const suf = lang === "ar" ? "_ar" : "";
  const langName = lang === "ar" ? "ARABE" : "FRANÇAIS";

  const commonRules = `RÈGLES STRICTES :
1. Réponds UNIQUEMENT avec un JSON strict (mode response_format=json_object).
2. Tu travailles dans la langue source du document : ${langName}. NE TRADUIS PAS.
3. Si un champ est introuvable, mets null (ou [] pour un tableau).
4. keywords${suf} : 8 à 15 chaînes, jamais des nombres.
5. summary${suf} : 60 à 120 mots maximum, pas plus.
6. year : entier (pas une chaîne).
7. Tu ne renvoies AUCUN champ "content", "introduction", "conclusion",
   "sections", etc. — le corps du document est conservé tel quel.`;

  const baseMetadata = `  "title${suf}": "...",
  "subtitle${suf}": "...",
  "author${suf}": "...",
  "summary${suf}": "...",
  "keywords${suf}": ["..."],
  "legalDomains${suf}": ["..."],
  "mainTopics${suf}": ["..."],
  "legalReferences${suf}": ["..."],
  "entities${suf}": ["..."],
  "dates${suf}": ["..."]`;

  switch (kind) {
    case "jurisprudence":
      return `Tu es un analyseur expert de décisions de justice tunisiennes en ${langName}.
${commonRules}

Schéma JSON attendu :
{
${baseMetadata},
  "court${suf}": "...",
  "court_level${suf}": "...",
  "court_category${suf}": "...",
  "case_number": "...",
  "year": 2024,
  "plaintiff${suf}": "...",
  "defendant${suf}": "...",
  "jurisdiction${suf}": "..."
}`;

    case "commentaire":
      return `Tu es un analyseur expert de commentaires de jurisprudence tunisiens en ${langName}.
${commonRules}

Schéma JSON attendu :
{
${baseMetadata},
  "court${suf}": "...",
  "case_number": "...",
  "year": 2024
}`;

    case "blog":
    case "analyse":
    default:
      return `Tu es un analyseur expert de documents juridiques tunisiens en ${langName}.
${commonRules}

Schéma JSON attendu :
{
${baseMetadata}
}`;
  }
}

/**
 * Run the full document processing pipeline asynchronously.
 * Updates a processing_jobs row + emits progress over socket.io.
 */
async function runProcessingPipeline(args: {
  jobId: string;
  documentId: string;
  buffer: Buffer;
  filename: string;
  mimeType?: string;
  language: "fr" | "ar" | "auto";
}): Promise<void> {
  const { jobId, documentId, buffer, filename, mimeType, language } = args;
  const setProgress = async (progress: number, step: string) => {
    await prisma.processingJob.update({
      where: { id: jobId },
      data: { progress, currentStep: step, status: "processing" },
    });
    publishJobProgress({ jobId, status: "processing", progress, currentStep: step });
  };

  try {
    // Step 1 — Text extraction
    await setProgress(10, "extracting_text");
    console.log(`[upload-document] start docId=${documentId} file=${filename} ${buffer.length}B lang=${language}`);
    const extraction = await extractTextFromFile(buffer, filename, mimeType, language);
    console.log(`[upload-document] extraction method=${extraction.method} pages=${extraction.pageCount} text=${extraction.text.length}c needsOcr=${extraction.needsOcr ?? false}${extraction.errorMessage ? ` err="${extraction.errorMessage}"` : ""}`);

    // Step 2 — Convert raw text → HTML body (with H1/H2 headings inferred).
    // This is the SINGLE source of truth for the document body. The editor
    // will let the user fix any mis-detected heading via the toolbar.
    const bodyHtml = htmlFromText(extraction.text);
    const pageContents = extraction.pages.map((p) => ({
      pageNumber: p.pageNumber,
      content: p.content,
      confidence: p.confidence ?? 0.95,
    }));
    await prisma.document.update({
      where: { id: documentId },
      data: {
        content: bodyHtml,
        pageContents: pageContents as never,
        pageCount: extraction.pageCount,
        totalPages: extraction.pageCount,
        processedPages: extraction.pageCount,
      },
    });

    // Skip the rest if there's no usable text (probably a scanned PDF
    // or empty file).
    if (!extraction.text || extraction.text.length < 50) {
      const reason = extraction.errorMessage
        ? `OCR a échoué : ${extraction.errorMessage}`
        : extraction.needsOcr
        ? "PDF scanné — OCR n'a extrait aucun texte."
        : "Texte trop court ou vide.";
      console.warn(`[upload-document] no_text docId=${documentId} reason="${reason}"`);
      await prisma.processingJob.update({
        where: { id: jobId },
        data: {
          status: "failed",
          progress: 100,
          currentStep: "no_text_extracted",
          errorMessage: reason,
        },
      });
      await prisma.document.update({
        where: { id: documentId },
        data: { status: "extraction_failed" },
      });
      publishJobProgress({ jobId, status: "failed", progress: 100, errorMessage: reason });
      return;
    }

    // Step 3 — Extract METADATA only (title, author, summary, keywords,
    // + type-specific scalars like court / case_number). Never touches
    // the body.
    await setProgress(60, "ai_metadata");
    let analysis: Record<string, unknown> = {};
    try {
      const docWithType = await prisma.document.findUnique({
        where: { id: documentId },
        include: { documentTypeRel: true },
      });
      const docTypeName = docWithType?.documentTypeRel?.name ?? null;
      const kind = classifyDocType(docTypeName);
      const sourceLang: "fr" | "ar" | "auto" = language;
      console.log(`[upload-document] AI metadata kind=${kind} docType="${docTypeName ?? "unknown"}" lang=${sourceLang}`);

      const systemPrompt = buildMetadataPrompt(docTypeName, sourceLang);
      const raw = await chatCompletion({
        model: "gpt-4o-mini",
        system: systemPrompt,
        prompt: extraction.text.slice(0, 12000),
        temperature: 0.1,
        maxTokens: 1500,
        json: true,
      });
      try {
        analysis = JSON.parse(raw);
      } catch {
        const m = raw.match(/\{[\s\S]*\}/);
        if (m) {
          try {
            analysis = JSON.parse(m[0]);
          } catch (err) {
            console.warn(`[upload-document] JSON parse failed: ${(err as Error).message}`);
          }
        }
      }

      const str = (v: unknown) => (typeof v === "string" && v.trim() ? v : undefined);
      const arr = (v: unknown) =>
        Array.isArray(v)
          ? v.map((x) => (x == null ? "" : String(x))).filter((x) => x.trim().length > 0)
          : undefined;
      const num = (v: unknown) => {
        if (typeof v === "number" && Number.isFinite(v)) return Math.trunc(v);
        if (typeof v === "string") {
          const n = parseInt(v, 10);
          if (Number.isFinite(n)) return n;
        }
        return undefined;
      };
      const pick = (...keys: string[]) => {
        for (const k of keys) {
          const v = (analysis as Record<string, unknown>)[k];
          if (v != null) return v;
        }
        return undefined;
      };

      const data: Record<string, unknown> = {
        title: str(pick("title")) ?? str(pick("title_ar")),
        titleAr: str(pick("title_ar", "title_AR")),
        subtitle: str(pick("subtitle")),
        subtitleAr: str(pick("subtitle_ar")),
        summary: str(pick("summary")),
        summaryAr: str(pick("summary_ar")),
        author: str(pick("author")),
        authorAr: str(pick("author_ar")),
        keywords: arr(pick("keywords")),
        keywordsAr: arr(pick("keywords_ar")),
        legalDomains: arr(pick("legalDomains", "legal_domains", "legalDomains_ar", "legal_domains_ar")),
        mainTopics: arr(pick("mainTopics", "main_topics", "mainTopics_ar", "main_topics_ar")),
        legalReferences: arr(pick("legalReferences", "legal_references")),
        legalReferencesAr: arr(pick("legalReferencesAr", "legal_references_ar")),
        entities: arr(pick("entities", "entities_ar")),
        dates: arr(pick("dates", "dates_ar")),
        court: str(pick("court")),
        courtAr: str(pick("court_ar")),
        courtLevel: str(pick("court_level", "courtLevel")),
        courtLevelAr: str(pick("court_level_ar", "courtLevelAr")),
        courtCategory: str(pick("court_category", "courtCategory")),
        courtCategoryAr: str(pick("court_category_ar", "courtCategoryAr")),
        caseNumber: str(pick("case_number", "caseNumber")),
        year: num(pick("year")),
        plaintiff: str(pick("plaintiff")),
        plaintiffAr: str(pick("plaintiff_ar")),
        defendant: str(pick("defendant")),
        defendantAr: str(pick("defendant_ar")),
        jurisdiction: str(pick("jurisdiction")),
      };

      await prisma.document.update({ where: { id: documentId }, data: data as never });
      console.log(`[upload-document] AI metadata persisted: ${Object.entries(data).filter(([, v]) => v != null).map(([k]) => k).join(",")}`);
    } catch (err) {
      console.warn(`[upload-document] AI metadata failed for ${documentId}:`, (err as Error).message);
    }

    // Step 4 — Embedding
    await setProgress(85, "generating_embedding");
    try {
      const embedText = [
        analysis.title ?? "",
        analysis.summary ?? "",
        extraction.text,
      ].filter(Boolean).join("\n\n");
      await generateAndStoreEmbedding(documentId, embedText);
    } catch (err) {
      console.warn(`[upload-document] embedding failed for ${documentId}:`, (err as Error).message);
    }

    // Mark document as ready
    await prisma.document.update({
      where: { id: documentId },
      data: { status: "pending_validation" },
    });

    await prisma.processingJob.update({
      where: { id: jobId },
      data: { status: "completed", progress: 100, currentStep: "done" },
    });
    publishJobProgress({ jobId, status: "completed", progress: 100, currentStep: "done" });
  } catch (err) {
    console.error(`[upload-document] pipeline failed for ${documentId}:`, err);
    await prisma.processingJob.update({
      where: { id: jobId },
      data: {
        status: "failed",
        errorMessage: (err as Error).message?.slice(0, 500) ?? "unknown error",
      },
    });
    publishJobProgress({
      jobId,
      status: "failed",
      progress: 0,
      errorMessage: (err as Error).message?.slice(0, 500),
    });
  }
}

export async function uploadDocument(req: Request) {
  // Support both multipart upload (FormData with `file` field) and
  // legacy JSON body with fileBase64.
  let filename: string;
  let buffer: Buffer;
  let title: string | undefined;
  let titleAr: string | undefined;
  let language = "fr";
  let categoryId: string | null | undefined;
  let documentTypeId: string | null | undefined;
  let skipProcessing: boolean | undefined;

  const reqWithFile = req as Request & { file?: { buffer: Buffer; originalname: string; mimetype: string } };
  if (reqWithFile.file) {
    // Multer decodes multipart filenames as Latin-1 by default. Re-decode
    // as UTF-8 so Arabic / accented filenames are preserved correctly.
    filename = Buffer.from(reqWithFile.file.originalname, "latin1").toString("utf8");
    buffer = reqWithFile.file.buffer;
    const body = req.body as Record<string, string | undefined>;
    title = body.title;
    titleAr = body.titleAr;
    language = body.language ?? "fr";
    categoryId = body.categoryId || null;
    documentTypeId = body.documentTypeId || null;
    skipProcessing = body.skipProcessing === "true";
  } else {
    const args = schema.parse(req.body);
    filename = args.filename;
    buffer = Buffer.from(args.fileBase64, "base64");
    title = args.title;
    titleAr = args.titleAr;
    language = args.language;
    categoryId = args.categoryId;
    documentTypeId = args.documentTypeId;
    skipProcessing = args.skipProcessing;
  }
  const userId = req.user!.userId;

  // 1. Save the file
  const saved = await saveFile("documents", userId, filename, buffer);

  // 2. Create document row (initially with empty content)
  const doc = await prisma.document.create({
    data: {
      userId,
      title: title ?? filename,
      titleAr,
      content: "",
      originalFilename: filename,
      fileUrl: saved.url,
      pdfUrl: saved.url,
      fileSize: saved.size,
      language,
      categoryId: categoryId ?? undefined,
      documentTypeId: documentTypeId ?? undefined,
      status: "processing",
      published: false,
    },
  });

  // 3. Create a processing_job row
  const job = await prisma.processingJob.create({
    data: {
      fileName: filename,
      fileSize: saved.size,
      status: "pending",
      progress: 0,
      currentStep: "queued",
    },
  });
  await prisma.document.update({
    where: { id: doc.id },
    data: { processingJobId: job.id },
  });

  // 4. Fire-and-forget the processing pipeline (don't block response)
  if (!skipProcessing) {
    void runProcessingPipeline({
      jobId: job.id,
      documentId: doc.id,
      buffer,
      filename,
      mimeType: undefined,
      language: language === "ar" || language === "fr" ? language : "auto",
    });
  }

  // 5. Return document + jobId immediately
  return {
    success: true,
    document: doc,
    jobId: job.id,
  };
}
