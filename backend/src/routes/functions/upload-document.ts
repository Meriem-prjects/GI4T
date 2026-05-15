import type { Request } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { saveFile } from "../../lib/storage.js";
import { extractTextFromFile } from "../../services/text-extraction.js";
import { chatCompletion } from "../../services/openai.js";
import { generateAndStoreEmbedding } from "../../services/embeddings.js";
import { publishJobProgress } from "../../realtime/progress.js";

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

function buildAnalysisPrompt(documentTypeName: string | null | undefined): string {
  const t = (documentTypeName ?? "").toLowerCase();
  const isJurisprudence = t.includes("jurisprudence") || t.includes("جذاذة") || t.includes("فقه");
  const isBlogOrComment = t.includes("blog") || t.includes("commentaire") || t.includes("تدوين");
  const isAnalysis = t.includes("analyse") || t.includes("opinion") || t.includes("تحليل");

  const baseFields = `  "title": "...",                  // titre exact (langue source)
  "title_ar": "...",                // titre en arabe
  "subtitle": "...",                // sous-titre si présent, sinon null
  "subtitle_ar": "...",
  "summary": "...",                 // 150-300 mots en langue source
  "summary_ar": "...",              // 150-300 mots en arabe
  "author": "...",                  // auteur principal (langue source)
  "author_ar": "...",
  "keywords": ["..."],              // 8-15 mots-clés (langue source)
  "keywords_ar": ["..."],           // 8-15 mots-clés en arabe
  "legalDomains": ["..."],          // domaines juridiques touchés
  "mainTopics": ["..."],            // thématiques principales
  "legalReferences": ["..."],       // textes/articles cités (langue source)
  "legalReferencesAr": ["..."],     // textes/articles cités en arabe
  "entities": ["..."],              // personnes/institutions/lois citées
  "dates": ["..."],                 // dates importantes (format JJ/MM/AAAA si possible)
  "textualMetadata": "..."          // 1-3 phrases : qui/quand/quoi du document`;

  const jurisprudenceFields = `  "court": "...",                   // nom du tribunal (langue source)
  "court_ar": "...",
  "courtLevel": "...",              // niveau (Cassation, Appel, Première instance, ...)
  "courtLevelAr": "...",
  "courtCategory": "...",           // ordre judiciaire/administratif/constitutionnel
  "courtCategoryAr": "...",
  "caseNumber": "...",              // numéro de la décision/arrêt
  "year": 2024,                     // année de la décision (entier)
  "plaintiff": "...",               // demandeur (langue source)
  "plaintiff_ar": "...",
  "defendant": "...",               // défendeur (langue source)
  "defendant_ar": "...",
  "jurisdiction": "...",            // ressort géographique`;

  const bibliographyFields = `  "bibliography": "...",            // références bibliographiques rédigées (langue source)
  "bibliography_ar": "..."`;

  let typeHint = "";
  let extra = "";
  if (isJurisprudence) {
    typeHint = `Le document est une FICHE DE JURISPRUDENCE / décision judiciaire. Cherche AGRESSIVEMENT le numéro de décision, la juridiction, l'année, les parties (demandeur/défendeur), le niveau juridictionnel.`;
    extra = ",\n" + jurisprudenceFields + ",\n" + bibliographyFields;
  } else if (isBlogOrComment) {
    typeHint = `Le document est un BILLET DE BLOG ou un COMMENTAIRE de décision. Identifie clairement l'auteur, sa qualité (universitaire, avocat...), et le sujet juridique principal.`;
    extra = ",\n" + bibliographyFields;
  } else if (isAnalysis) {
    typeHint = `Le document est une ANALYSE / NOTE DOCTRINALE. Identifie l'auteur, sa qualité, les domaines de droit traités et la thèse défendue.`;
    extra = ",\n" + bibliographyFields;
  } else {
    typeHint = `Document juridique générique. Remplis tous les champs détectables.`;
    extra = ",\n" + jurisprudenceFields + ",\n" + bibliographyFields;
  }

  return `Tu es un analyseur expert de documents juridiques tunisiens (français/arabe).
${typeHint}

Réponds UNIQUEMENT avec un JSON valide (pas de markdown, pas de commentaire, pas de \`\`\`).
Schéma attendu :
{
${baseFields}${extra}
}

Règles :
- Si un champ est introuvable, mets null (ou [] pour un tableau).
- Préserve la casse et la ponctuation arabes (؟ ؛ .).
- Pour les arrays bilingues, l'ordre français et arabe doit correspondre item par item.
- Pour year, retourne un entier (pas une chaîne).
- Pour "dates", "entities", "legalReferences*", "keywords*", "legalDomains", "mainTopics" : tableaux de CHAÎNES uniquement (jamais d'entiers — "2014" et non 2014).
- Si le document est en arabe, remplis prioritairement les *_ar et fais un titre/résumé français de courtoisie.`;
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
    const pageContents = extraction.pages.map((p) => ({
      pageNumber: p.pageNumber,
      content: p.content,
      confidence: p.confidence ?? 0.95,
    }));
    await prisma.document.update({
      where: { id: documentId },
      data: {
        content: extraction.text,
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

    // Step 2 — AI metadata extraction (prompt tailored to document type)
    await setProgress(50, "ai_analysis");
    let analysis: Record<string, unknown> = {};
    try {
      const docWithType = await prisma.document.findUnique({
        where: { id: documentId },
        include: { documentTypeRel: true },
      });
      const docTypeName = docWithType?.documentTypeRel?.name ?? null;
      const systemPrompt = buildAnalysisPrompt(docTypeName);
      console.log(`[upload-document] AI analysis docType="${docTypeName ?? "unknown"}"`);

      const raw = await chatCompletion({
        model: "gpt-4o-mini",
        system: systemPrompt,
        prompt: extraction.text.slice(0, 12000),
        temperature: 0.2,
        maxTokens: 4000,
      });
      try {
        analysis = JSON.parse(raw);
      } catch {
        const m = raw.match(/\{[\s\S]*\}/);
        if (m) analysis = JSON.parse(m[0]);
      }

      const str = (v: unknown) => (typeof v === "string" && v.trim() ? v : undefined);
      // Coerce array items to strings — gpt-4o-mini sometimes returns
      // years/numbers as integers even when the schema says String[].
      const arr = (v: unknown) =>
        Array.isArray(v)
          ? v
              .map((x) => (x == null ? "" : String(x)))
              .filter((x) => x.trim().length > 0)
          : undefined;
      const num = (v: unknown) => {
        if (typeof v === "number" && Number.isFinite(v)) return Math.trunc(v);
        if (typeof v === "string") {
          const n = parseInt(v, 10);
          if (Number.isFinite(n)) return n;
        }
        return undefined;
      };

      await prisma.document.update({
        where: { id: documentId },
        data: {
          title: str(analysis.title),
          titleAr: str(analysis.title_ar),
          subtitle: str(analysis.subtitle),
          subtitleAr: str(analysis.subtitle_ar),
          summary: str(analysis.summary),
          summaryAr: str(analysis.summary_ar),
          author: str(analysis.author),
          authorAr: str(analysis.author_ar),
          keywords: arr(analysis.keywords),
          keywordsAr: arr(analysis.keywords_ar),
          legalDomains: arr(analysis.legalDomains),
          mainTopics: arr(analysis.mainTopics),
          court: str(analysis.court),
          courtAr: str(analysis.court_ar),
          courtLevel: str(analysis.courtLevel),
          courtLevelAr: str(analysis.courtLevelAr),
          courtCategory: str(analysis.courtCategory),
          courtCategoryAr: str(analysis.courtCategoryAr),
          caseNumber: str(analysis.caseNumber),
          year: num(analysis.year),
          plaintiff: str(analysis.plaintiff),
          plaintiffAr: str(analysis.plaintiff_ar),
          defendant: str(analysis.defendant),
          defendantAr: str(analysis.defendant_ar),
          jurisdiction: str(analysis.jurisdiction),
          legalReferences: arr(analysis.legalReferences),
          legalReferencesAr: arr(analysis.legalReferencesAr ?? analysis.legal_references_ar),
          bibliography: str(analysis.bibliography),
          bibliographyAr: str(analysis.bibliography_ar),
          entities: arr(analysis.entities),
          dates: arr(analysis.dates),
          textualMetadata: str(analysis.textualMetadata),
        },
      });
    } catch (err) {
      console.warn(`[upload-document] AI analysis failed for ${documentId}:`, (err as Error).message);
    }

    // Step 3 — Embedding
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
