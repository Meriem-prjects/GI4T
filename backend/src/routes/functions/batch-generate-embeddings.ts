import type { Request } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { generateAndStoreEmbedding } from "../../services/embeddings.js";

const schema = z.object({
  limit: z.coerce.number().int().min(1).max(500).default(50),
  onlyMissing: z.boolean().default(true),
});

export async function batchGenerateEmbeddings(req: Request) {
  const { limit, onlyMissing } = schema.parse(req.body);

  // Pull bilingual titles + summaries so the embedding weight-boosts the
  // title (see backend/src/services/embeddings.ts). This is essential for
  // fiches whose title is the citizen's search anchor.
  const rows = onlyMissing
    ? await prisma.$queryRawUnsafe<
        Array<{
          id: string;
          title: string;
          title_ar: string | null;
          summary: string | null;
          summary_ar: string | null;
          content: string;
        }>
      >(
        `SELECT id, title, title_ar, summary, summary_ar, content
         FROM documents
         WHERE embedding IS NULL
         LIMIT $1`,
        limit,
      )
    : (await prisma.document.findMany({
        take: limit,
        select: {
          id: true,
          title: true,
          titleAr: true,
          summary: true,
          summaryAr: true,
          content: true,
        },
      })).map((d) => ({
        id: d.id,
        title: d.title,
        title_ar: d.titleAr,
        summary: d.summary,
        summary_ar: d.summaryAr,
        content: d.content,
      }));

  let processed = 0;
  let failed = 0;
  for (const doc of rows) {
    try {
      await generateAndStoreEmbedding(doc.id, {
        title: doc.title,
        titleAr: doc.title_ar,
        summary: doc.summary,
        summaryAr: doc.summary_ar,
        content: doc.content,
      });
      processed++;
    } catch (err) {
      console.error("Embedding failed for", doc.id, err);
      failed++;
    }
  }
  return { processed, failed, total: rows.length };
}
