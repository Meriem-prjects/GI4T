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

const ANALYSIS_SYSTEM_PROMPT = `You are a legal document analyzer for Tunisian law.
Extract structured metadata from the document and return STRICT JSON only (no markdown, no explanation).
Schema:
{
  "title": "...",
  "title_ar": "...",
  "subtitle": "...",
  "subtitle_ar": "...",
  "summary": "...",
  "summary_ar": "...",
  "author": "...",
  "author_ar": "...",
  "keywords": ["..."],
  "keywords_ar": ["..."],
  "legalDomains": ["..."],
  "mainTopics": ["..."],
  "court": "...",
  "court_ar": "...",
  "caseNumber": "...",
  "year": 2024,
  "plaintiff": "...",
  "defendant": "...",
  "jurisdiction": "...",
  "legalReferences": ["..."],
  "entities": ["..."],
  "dates": ["..."]
}
If a field is unknown, use null or [].`;

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

    // Step 2 — AI metadata extraction
    await setProgress(50, "ai_analysis");
    let analysis: Record<string, unknown> = {};
    try {
      const raw = await chatCompletion({
        model: "gpt-4o-mini",
        system: ANALYSIS_SYSTEM_PROMPT,
        prompt: extraction.text.slice(0, 12000),
        temperature: 0.2,
      });
      try {
        analysis = JSON.parse(raw);
      } catch {
        const m = raw.match(/\{[\s\S]*\}/);
        if (m) analysis = JSON.parse(m[0]);
      }

      await prisma.document.update({
        where: { id: documentId },
        data: {
          title: (analysis.title as string) || undefined,
          titleAr: (analysis.title_ar as string) || undefined,
          subtitle: (analysis.subtitle as string) || undefined,
          subtitleAr: (analysis.subtitle_ar as string) || undefined,
          summary: (analysis.summary as string) || undefined,
          summaryAr: (analysis.summary_ar as string) || undefined,
          author: (analysis.author as string) || undefined,
          authorAr: (analysis.author_ar as string) || undefined,
          keywords: Array.isArray(analysis.keywords) ? (analysis.keywords as string[]) : undefined,
          keywordsAr: Array.isArray(analysis.keywords_ar) ? (analysis.keywords_ar as string[]) : undefined,
          legalDomains: Array.isArray(analysis.legalDomains) ? (analysis.legalDomains as string[]) : undefined,
          mainTopics: Array.isArray(analysis.mainTopics) ? (analysis.mainTopics as string[]) : undefined,
          court: (analysis.court as string) || undefined,
          courtAr: (analysis.court_ar as string) || undefined,
          caseNumber: (analysis.caseNumber as string) || undefined,
          year: typeof analysis.year === "number" ? analysis.year : undefined,
          plaintiff: (analysis.plaintiff as string) || undefined,
          defendant: (analysis.defendant as string) || undefined,
          jurisdiction: (analysis.jurisdiction as string) || undefined,
          legalReferences: Array.isArray(analysis.legalReferences)
            ? (analysis.legalReferences as string[])
            : undefined,
          entities: Array.isArray(analysis.entities) ? (analysis.entities as string[]) : undefined,
          dates: Array.isArray(analysis.dates) ? (analysis.dates as string[]) : undefined,
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
    filename = reqWithFile.file.originalname;
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
