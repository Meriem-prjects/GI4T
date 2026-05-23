// Re-run the full extraction pipeline on an already-stored document.
//
// Different from `reprocess-document`: that one only re-runs the AI
// metadata analysis on the EXISTING text. This one re-reads the PDF
// from storage and re-runs the entire pipeline (OCR → noise filters →
// Markdown→HTML structure rebuild → metadata extraction). Used when a
// document was uploaded before a pipeline upgrade and the stored
// `content` reflects the old (lower-quality) extraction.

import type { Request } from "express";
import fs from "node:fs/promises";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { buildStoragePath } from "../../lib/storage.js";
import { runProcessingPipeline } from "./upload-document.js";

const schema = z.object({
  documentId: z.string().uuid(),
});

function extractStorageKey(fileUrl: string | null | undefined): string | null {
  if (!fileUrl) return null;
  // Match `/api/storage/documents/<key>` (the key can contain slashes
  // because user-owned subfolders are valid).
  const m = fileUrl.match(/\/api\/storage\/documents\/(.+)$/);
  return m ? decodeURIComponent(m[1]) : null;
}

export async function reExtractDocument(req: Request) {
  const { documentId } = schema.parse(req.body);

  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    select: {
      id: true,
      fileUrl: true,
      pdfUrl: true,
      originalFilename: true,
      language: true,
    },
  });
  if (!doc) {
    return { success: false, error: "Document not found" };
  }

  const sourceUrl = doc.pdfUrl ?? doc.fileUrl;
  const key = extractStorageKey(sourceUrl);
  if (!key) {
    return { success: false, error: "Document has no associated PDF file" };
  }

  const absPath = buildStoragePath("documents", key);
  let buffer: Buffer;
  try {
    buffer = await fs.readFile(absPath);
  } catch {
    return { success: false, error: `PDF file not found on disk: ${key}` };
  }

  // Fresh job row so the frontend's existing progress-polling logic
  // works unchanged.
  const job = await prisma.processingJob.create({
    data: {
      fileName: doc.originalFilename,
      fileSize: buffer.length,
      status: "pending",
      progress: 0,
      currentStep: "queued",
    },
  });
  await prisma.document.update({
    where: { id: documentId },
    data: { processingJobId: job.id, status: "processing" },
  });

  const language = doc.language === "ar" || doc.language === "fr" ? doc.language : "auto";

  // Fire-and-forget — same pattern as the initial upload. The pipeline
  // updates the document row in-place when it finishes.
  void runProcessingPipeline({
    jobId: job.id,
    documentId,
    buffer,
    filename: doc.originalFilename,
    mimeType: "application/pdf",
    language,
    processingMode: "ai",
  });

  return { success: true, jobId: job.id, documentId };
}
