import type { Request } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { generateAndStoreEmbedding } from "../../services/embeddings.js";

const schema = z.object({
  limit: z.coerce.number().int().min(1).max(500).default(50),
  onlyMissing: z.boolean().default(true),
  // Documents précis (ex. ceux que l'import ODF vient de créer ou de modifier)
  ids: z.array(z.string().uuid()).max(200).optional(),
});

const SELECT = {
  id: true,
  title: true,
  titleAr: true,
  subtitle: true,
  subtitleAr: true,
  summary: true,
  summaryAr: true,
  content: true,
  translatedContent: true,
} as const;

export async function batchGenerateEmbeddings(req: Request) {
  const { limit, onlyMissing, ids } = schema.parse(req.body);

  // Pull bilingual titles + summaries so the embedding weight-boosts the
  // title (see backend/src/services/embeddings.ts). This is essential for
  // fiches whose title is the citizen's search anchor.
  let rows;
  if (ids?.length) {
    rows = await prisma.document.findMany({ where: { id: { in: ids } }, select: SELECT });
  } else if (onlyMissing) {
    const missing = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
      `SELECT id FROM documents WHERE embedding IS NULL LIMIT $1`,
      limit,
    );
    rows = await prisma.document.findMany({
      where: { id: { in: missing.map((m) => m.id) } },
      select: SELECT,
    });
  } else {
    rows = await prisma.document.findMany({ take: limit, select: SELECT });
  }

  let processed = 0;
  let failed = 0;
  for (const doc of rows) {
    try {
      await generateAndStoreEmbedding(doc.id, doc);
      processed++;
    } catch (err) {
      console.error("Embedding failed for", doc.id, err);
      failed++;
    }
  }
  return { processed, failed, total: rows.length };
}
