import type { Request } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { getOpenAI } from "../../services/openai.js";
import { searchBySemantics } from "../../services/embeddings.js";

// Semantic-fiche retrieval configuration. Threshold 0.25 — same as
// /api/fn/ai-semantic-search — because raw cosine similarity from
// text-embedding-3-small on a French question against an
// Arabic-language corpus lands at 0.28–0.34 for the actually-relevant
// fiches (higher values you may see in ai-semantic-search results
// include the title-match boost). At 0.25 the top-3 results are the
// legitimate matches without noise creeping in.
const FICHE_MIN_SIMILARITY = 0.25;
const FICHE_MAX_RESULTS = 3;
const FICHE_MAX_SUMMARY_CHARS = 600;

const schema = z.object({
  message: z.string().min(1),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .default([]),
  language: z.enum(["fr", "ar"]).default("fr"),
});

// Strip Arabic diacritics, fold alef variants, lowercase Latin — used
// for keyword scoring between the user message and each topic title.
function normaliseForScoring(s: string): string {
  return s
    .replace(/[ً-ٰٟـ]/g, "")
    .replace(/[آأإ]/g, "ا")
    .replace(/[ى]/g, "ي")
    .toLowerCase()
    .trim();
}

// Score a training doc against the user message. Counts the user's
// 3+-letter tokens that appear in (title + titleAr + full content).
// Title matches are weighted ×3 so a topic named after the user's
// keyword wins over a generic topic that happens to mention it once
// deep in the content. Cheap, deterministic, no embedding call.
function scoreDoc(
  msg: string,
  doc: { title: string; titleAr: string | null; content: string },
): number {
  const titleHay = normaliseForScoring(`${doc.title} ${doc.titleAr ?? ""}`);
  const contentHay = normaliseForScoring(doc.content);
  const needle = normaliseForScoring(msg);
  const tokens = needle.split(/\s+/).filter((t) => t.length >= 3);
  if (tokens.length === 0) return 0;
  let score = 0;
  for (const t of tokens) {
    if (titleHay.includes(t)) score += 3;
    else if (contentHay.includes(t)) score += 1;
  }
  return score;
}

// Per-doc content cap. Generous (15 kchars) because the corpus is
// curated Q/R pairs we WANT the LLM to see verbatim. The total prompt
// stays well under gpt-4o-mini's 128k input limit even with ~10
// matched topics.
const MAX_CONTENT_PER_DOC = 15_000;
// Always include this many top-scoring docs in the prompt (even when
// the user query doesn't match any keyword strongly — gives the LLM
// some general context to fall back on).
const ALWAYS_INCLUDE = 3;
// Hard cap to keep the prompt fast even on a wide-ranging query.
const MAX_DOCS_IN_PROMPT = 12;

// Retrieval-augmented step over the observatoire corpus. Uses pgvector on
// the `documents.embedding` column to find the fiches most similar to the
// user question, then returns id/title/category/similarity so the client
// can render clickable cards. Failure is non-fatal — the chat still works
// without RAG if embedding or vector search errors out.
async function retrieveRelevantFiches(question: string): Promise<
  Array<{
    id: string;
    title: string;
    titleAr: string | null;
    summary: string | null;
    summaryAr: string | null;
    categoryName: string | null;
    categoryNameAr: string | null;
    similarity: number;
  }>
> {
  try {
    // Reuse the same pgvector helper as /api/fn/ai-semantic-search — it
    // inlines the vector literal in the SQL, which is what pgvector needs
    // (parameter binding via `$1::vector` doesn't round-trip through
    // Prisma's raw query). Then hydrate ids with metadata Prisma can join.
    const matches = await searchBySemantics(question, FICHE_MIN_SIMILARITY, FICHE_MAX_RESULTS);
    if (matches.length === 0) return [];
    const docs = await prisma.document.findMany({
      where: { id: { in: matches.map((m) => m.id) } },
      select: {
        id: true,
        title: true,
        titleAr: true,
        summary: true,
        summaryAr: true,
        documentCategories: {
          include: { category: { select: { name: true, nameAr: true } } },
        },
      },
    });
    const bySim = new Map(matches.map((m) => [m.id, m.similarity]));
    return docs
      .map((d) => {
        const cat = d.documentCategories?.[0]?.category;
        return {
          id: d.id,
          title: d.title,
          titleAr: d.titleAr,
          summary: d.summary,
          summaryAr: d.summaryAr,
          categoryName: cat?.name ?? null,
          categoryNameAr: cat?.nameAr ?? null,
          similarity: bySim.get(d.id) ?? 0,
        };
      })
      .sort((a, b) => b.similarity - a.similarity);
  } catch (err) {
    console.warn("[acces-droits-chat] fiche retrieval failed:", (err as Error).message);
    return [];
  }
}

export async function accesDroitsChat(req: Request) {
  const { message, history, language } = schema.parse(req.body);

  const [config, trainingDocs, fiches] = await Promise.all([
    prisma.chatbotConfig.findFirst(),
    prisma.chatbotTrainingDocument.findMany({
      where: { isActive: true },
      select: { title: true, titleAr: true, content: true },
    }),
    retrieveRelevantFiches(message),
  ]);

  // Rank docs by keyword overlap with the user's question. Topics that
  // match keep their full content (up to MAX_CONTENT_PER_DOC); the rest
  // are dropped from this turn's prompt.
  const ranked = trainingDocs
    .map((d) => ({ doc: d, score: scoreDoc(message, d) }))
    .sort((a, b) => b.score - a.score);

  const selected =
    ranked.filter((r) => r.score > 0).length > 0
      ? ranked.slice(0, MAX_DOCS_IN_PROMPT).filter((r, i) => r.score > 0 || i < ALWAYS_INCLUDE)
      : ranked.slice(0, ALWAYS_INCLUDE);

  const context = selected
    .map(
      ({ doc }) =>
        `### ${doc.title}${doc.titleAr ? ` — ${doc.titleAr}` : ""}\n${doc.content.slice(0, MAX_CONTENT_PER_DOC)}`,
    )
    .join("\n\n");

  // Retrieval-augmented context from the observatoire fiche corpus.
  // Only titles + short summaries — the full body would blow the prompt
  // for zero win over the summary the AI pipeline already curated.
  const fichesContext = fiches
    .map((f, i) => {
      const t = language === "ar" && f.titleAr ? f.titleAr : f.title;
      const s = language === "ar" && f.summaryAr ? f.summaryAr : f.summary;
      return `[FICHE ${i + 1}] ${t}${s ? `\n${s.slice(0, FICHE_MAX_SUMMARY_CHARS)}` : ""}`;
    })
    .join("\n\n");

  const systemPrompt = `${config?.systemPrompt ?? "Tu es un assistant juridique tunisien spécialisé dans l'accès aux droits."}

Language: respond in ${language === "ar" ? "Arabic" : "French"}.

PRIORITÉ DE RÉPONSE :
1. Si la question de l'utilisateur correspond à une Q/R de la base de connaissances ci-dessous, réponds avec la R: associée — c'est la position officielle de l'ODF.
2. Sinon, utilise les FICHES DE L'OBSERVATOIRE ci-dessous et cite-les naturellement quand elles sont pertinentes ("d'après la fiche X…", "voir la fiche Y…").
3. Sinon encore, réponds avec tes connaissances générales sur le droit tunisien.
4. Ne jamais inventer un article de loi, une date, un numéro de loi ou de fascicule officiel.

Base de connaissances ODF (Q/R curées) :
${context}

${fiches.length > 0 ? `Fiches de l'observatoire pertinentes :\n${fichesContext}` : ""}`;

  // Call OpenAI directly (the official SDK uses Node's `https` module
  // which respects `--use-system-ca` — Mistral's SDK uses `fetch`
  // which doesn't, and fails behind the corporate SSL proxy).
  const openai = getOpenAI();
  const chatMessages = [
    { role: "system" as const, content: systemPrompt },
    ...history.slice(-10).map((m) => ({ role: m.role, content: m.content })),
    { role: "user" as const, content: message },
  ];
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: chatMessages,
    temperature: 0.4,
    max_tokens: 800,
  });
  const answer = res.choices?.[0]?.message?.content ?? "";

  return {
    answer,
    language,
    matchedTopics: selected.map((s) => s.doc.title),
    sources: fiches.map((f) => ({
      id: f.id,
      title: f.title,
      titleAr: f.titleAr,
      categoryName: f.categoryName,
      categoryNameAr: f.categoryNameAr,
      similarity: f.similarity,
    })),
  };
}
