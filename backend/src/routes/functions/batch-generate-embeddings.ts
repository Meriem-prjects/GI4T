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

  const rows = onlyMissing
    ? await prisma.$queryRawUnsafe<Array<{ id: string; title: string; content: string; summary: string | null }>>(
        `SELECT id, title, content, summary FROM documents WHERE embedding IS NULL LIMIT $1`,
        limit,
      )
    : await prisma.document.findMany({
        take: limit,
        select: { id: true, title: true, content: true, summary: true },
      });

  let processed = 0;
  let failed = 0;
  for (const doc of rows) {
    try {
      const text = [doc.title, doc.summary ?? "", doc.content].join("\n\n");
      await generateAndStoreEmbedding(doc.id, text);
      processed++;
    } catch (err) {
      console.error("Embedding failed for", doc.id, err);
      failed++;
    }
  }
  return { processed, failed, total: rows.length };
}
