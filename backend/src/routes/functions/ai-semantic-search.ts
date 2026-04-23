import type { Request } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { searchBySemantics } from "../../services/embeddings.js";

const schema = z.object({
  query: z.string().min(1),
  threshold: z.number().default(0.5),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  filters: z
    .object({
      courtType: z.string().optional(),
      yearFrom: z.string().optional(),
      yearTo: z.string().optional(),
      jurisdictionLevel: z.string().optional(),
      documentType: z.string().optional(),
    })
    .optional(),
});

/**
 * Shape a Prisma document row into the frontend-expected flat format.
 */
function shapeDocument(doc: Record<string, unknown>, similarity?: number) {
  return {
    ...doc,
    similarity,
    primaryCategory: (doc as { category?: unknown }).category ?? null,
    categories: (doc as { category?: unknown }).category ? [(doc as { category: unknown }).category] : [],
  };
}

/**
 * Fallback: plain LIKE search on title / title_ar / summary / content.
 */
async function classicSearch(query: string, limit: number, filters?: Record<string, string | undefined>) {
  const where: Record<string, unknown> = {
    published: true,
    OR: [
      { title: { contains: query, mode: "insensitive" } },
      { titleAr: { contains: query, mode: "insensitive" } },
      { summary: { contains: query, mode: "insensitive" } },
      { summaryAr: { contains: query, mode: "insensitive" } },
      { content: { contains: query, mode: "insensitive" } },
    ],
  };

  if (filters?.yearFrom) where.year = { ...(where.year as object ?? {}), gte: Number(filters.yearFrom) };
  if (filters?.yearTo) where.year = { ...(where.year as object ?? {}), lte: Number(filters.yearTo) };
  if (filters?.documentType && filters.documentType !== "all") {
    where.documentTypeId = filters.documentType;
  }

  const [total, docs] = await Promise.all([
    prisma.document.count({ where }),
    prisma.document.findMany({
      where,
      include: { category: true, documentTypeRel: true, documentCategories: { include: { category: true } } },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
  ]);

  return {
    results: docs.map((d) => shapeDocument(d as Record<string, unknown>)),
    total,
    noResults: total === 0,
    aiPowered: false,
  };
}

export async function aiSemanticSearch(req: Request) {
  const { query, threshold, limit, filters } = schema.parse(req.body);

  // Try AI semantic search first (requires embeddings + OPENAI_API_KEY).
  try {
    const matches = await searchBySemantics(query, threshold, limit);
    if (matches.length > 0) {
      const docs = await prisma.document.findMany({
        where: { id: { in: matches.map((m) => m.id) } },
        include: { category: true, documentTypeRel: true, documentCategories: { include: { category: true } } },
      });
      const bySim = new Map(matches.map((m) => [m.id, m.similarity]));
      const sorted = docs
        .map((d) => shapeDocument(d as Record<string, unknown>, bySim.get(d.id)))
        .sort((a, b) => (b.similarity ?? 0) - (a.similarity ?? 0));
      return {
        results: sorted,
        total: sorted.length,
        noResults: false,
        aiPowered: true,
      };
    }
  } catch (err) {
    console.warn("[ai-semantic-search] fallback to classic:", (err as Error).message);
  }

  // Fallback to classic text search.
  const classic = await classicSearch(query, limit, filters);
  return classic;
}
