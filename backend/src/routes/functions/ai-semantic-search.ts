import type { Request } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { searchBySemantics } from "../../services/embeddings.js";

const schema = z.object({
  query: z.string().min(1),
  threshold: z.number().default(0.65),
  count: z.coerce.number().int().min(1).max(50).default(20),
});

export async function aiSemanticSearch(req: Request) {
  const { query, threshold, count } = schema.parse(req.body);
  const matches = await searchBySemantics(query, threshold, count);
  if (matches.length === 0) return { matches: [], documents: [] };

  const docs = await prisma.document.findMany({
    where: { id: { in: matches.map((m) => m.id) } },
    include: { category: true, documentTypeRel: true },
  });

  const bySim = new Map(matches.map((m) => [m.id, m.similarity]));
  const sorted = docs
    .map((d) => ({ ...d, similarity: bySim.get(d.id) ?? 0 }))
    .sort((a, b) => b.similarity - a.similarity);

  return { matches, documents: sorted };
}
