import type { Request } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { ocrImage } from "../../services/google-vision.js";
import { publishJobProgress } from "../../realtime/progress.js";

const schema = z.object({
  jobId: z.string().uuid(),
  pages: z.array(z.object({ pageNumber: z.number().int(), imageBase64: z.string() })),
  languageHints: z.array(z.string()).default(["fr", "ar"]),
});

export async function pdfOcrBatch(req: Request) {
  const { jobId, pages, languageHints } = schema.parse(req.body);
  const results: Array<{ pageNumber: number; content: string; confidence: number }> = [];

  await prisma.processingJob.update({
    where: { id: jobId },
    data: {
      status: "processing",
      totalPages: pages.length,
      processedPages: 0,
      progress: 0,
    },
  });

  for (const page of pages) {
    const buffer = Buffer.from(page.imageBase64, "base64");
    const ocr = await ocrImage(buffer, languageHints);
    results.push({ pageNumber: page.pageNumber, content: ocr.text, confidence: ocr.confidence });

    const processed = results.length;
    const progress = Math.round((processed / pages.length) * 100);
    await prisma.processingJob.update({
      where: { id: jobId },
      data: {
        processedPages: processed,
        progress,
        currentStep: `ocr_page_${page.pageNumber}`,
      },
    });
    publishJobProgress({
      jobId,
      status: "processing",
      progress,
      currentStep: `ocr_page_${page.pageNumber}`,
      totalPages: pages.length,
      processedPages: processed,
    });
  }

  await prisma.processingJob.update({
    where: { id: jobId },
    data: {
      status: "completed",
      progress: 100,
      resultData: { pages: results },
    },
  });
  publishJobProgress({
    jobId,
    status: "completed",
    progress: 100,
    totalPages: pages.length,
    processedPages: pages.length,
    resultData: { pages: results },
  });

  return { pages: results };
}
