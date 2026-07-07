import type { Request } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { searchBySemantics } from "../../services/embeddings.js";

const schema = z.object({
  query: z.string().min(1),
  // 0.35 not 0.5 — users type conversational queries ("je cherche…",
  // "quels documents parlent de…"). The prefix words dilute the query
  // embedding, so similarity against legal-doc summaries lands in the
  // 0.35-0.45 range even for a strong topical match. 0.5 was silently
  // rejecting most real questions.
  threshold: z.number().default(0.35),
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

/** Shape a Prisma document row into the frontend-expected flat format. */
function shapeDocument(doc: Record<string, unknown>, similarity?: number) {
  // Prefer the multi-category join (document_categories) over the legacy
  // single primary category, so search results carry the same full
  // category set that classic Supabase queries return.
  const rawJoin = (doc as { documentCategories?: Array<{ category?: unknown }> }).documentCategories;
  const primary = (doc as { category?: unknown }).category ?? null;
  const joined = Array.isArray(rawJoin)
    ? rawJoin.map((dc) => dc?.category).filter(Boolean)
    : [];
  const categories = joined.length > 0 ? joined : primary ? [primary] : [];
  return {
    ...doc,
    similarity,
    primaryCategory: primary ?? categories[0] ?? null,
    categories,
  };
}

// Detect Arabic characters in a string — used to know whether the user
// typed in Arabic (search AR title first) or French (search FR title first).
const AR_RE = /[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/;
function isArabic(s: string): boolean {
  return AR_RE.test(s);
}

// Normalize text for token-based matching: lowercase (unicode-aware),
// drop diacritics, keep Arabic base letters, strip punctuation.
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip Latin diacritics
    .replace(/[^\p{L}\p{N}\s]/gu, " ") // strip punctuation
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(s: string): string[] {
  return normalize(s)
    .split(" ")
    .filter((t) => t.length >= 2);
}

/**
 * Boost each result's similarity when the query terms appear literally in
 * its bilingual title. This surfaces the exact fiche a citizen searches
 * for — a query like "droit de la défense" ranks the fiche whose title is
 * "Droit à la défense" above longer documents that only mention it in
 * passing. Works in FR and AR simultaneously.
 */
function boostByTitleMatch<T extends { title?: string | null; titleAr?: string | null; similarity?: number }>(
  results: T[],
  query: string,
): T[] {
  const qTokens = tokens(query);
  if (qTokens.length === 0) return results;
  const arabicQuery = isArabic(query);
  return results
    .map((r) => {
      const titleTokens = tokens(r.title ?? "");
      const titleArTokens = tokens(r.titleAr ?? "");
      // Count how many query tokens hit each language.
      const hitsFr = qTokens.filter((q) => titleTokens.some((t) => t.includes(q) || q.includes(t))).length;
      const hitsAr = qTokens.filter((q) => titleArTokens.some((t) => t.includes(q) || q.includes(t))).length;
      // Weight matches in the query's own language slightly higher.
      const weightedHits = arabicQuery
        ? hitsAr * 1.2 + hitsFr
        : hitsFr * 1.2 + hitsAr;
      // Boost factor between 1.0 and ~1.25 — enough to promote perfect
      // title matches above near-misses without swamping the vector score.
      const boostFactor = 1 + Math.min(0.25, (weightedHits / qTokens.length) * 0.25);
      return { ...r, similarity: (r.similarity ?? 0) * boostFactor };
    })
    .sort((a, b) => (b.similarity ?? 0) - (a.similarity ?? 0));
}

/** Fallback: plain LIKE search on title / title_ar / summary / content. */
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

  if (filters?.yearFrom) where.year = { ...((where.year as object) ?? {}), gte: Number(filters.yearFrom) };
  if (filters?.yearTo) where.year = { ...((where.year as object) ?? {}), lte: Number(filters.yearTo) };
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

  // Even on classic search, boost fiches whose title matches — this is
  // the contextual ranking the user asked for.
  const shaped = docs.map((d) => shapeDocument(d as Record<string, unknown>, 0.5));
  const ranked = boostByTitleMatch(shaped as Array<{ title?: string; titleAr?: string; similarity?: number }>, query);

  return {
    results: ranked,
    total,
    noResults: total === 0,
    aiPowered: false,
  };
}

export async function aiSemanticSearch(req: Request) {
  const { query, threshold, limit, filters } = schema.parse(req.body);
  console.log(`[ai-semantic-search] query="${query}" threshold=${threshold} limit=${limit}`);

  // Try AI semantic search first (requires embeddings + OPENAI_API_KEY).
  try {
    const matches = await searchBySemantics(query, threshold, limit);
    console.log(`[ai-semantic-search] semantic matches: ${matches.length}`);
    if (matches.length > 0) {
      const docs = await prisma.document.findMany({
        where: { id: { in: matches.map((m) => m.id) } },
        include: { category: true, documentTypeRel: true, documentCategories: { include: { category: true } } },
      });
      const bySim = new Map(matches.map((m) => [m.id, m.similarity]));
      const shaped = docs.map((d) => shapeDocument(d as Record<string, unknown>, bySim.get(d.id)));
      // Contextual re-rank: boost fiches whose title (FR or AR) matches
      // the query terms. Vector similarity finds semantically related
      // documents; the title boost promotes the ones the citizen is
      // actually looking for.
      const ranked = boostByTitleMatch(shaped as Array<{ title?: string; titleAr?: string; similarity?: number }>, query);
      return {
        results: ranked,
        total: ranked.length,
        noResults: false,
        aiPowered: true,
      };
    }
  } catch (err) {
    console.warn("[ai-semantic-search] embed/search failed:", (err as Error).message);
  }

  // Fallback to classic text search.
  console.log(`[ai-semantic-search] falling back to classic for "${query}"`);
  const classic = await classicSearch(query, limit, filters);
  console.log(`[ai-semantic-search] classic returned: ${classic.total}`);
  return classic;
}
