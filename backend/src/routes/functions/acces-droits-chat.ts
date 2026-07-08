import type { Request } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { getOpenAI } from "../../services/openai.js";

// Semantic-fiche retrieval configuration. Threshold is 0.35 because the
// corpus is mostly Arabic and citizens ask in French — cross-lingual
// cosine similarity from text-embedding-3-small on well-matched fiches
// hovers around 0.40–0.50 in practice, so 0.50 was empirically too
// strict (rejected the top-relevant match at 0.435 for "licenciement
// abusif"). At 0.35 the noise floor is low enough that only fiches
// legitimately overlapping with the question survive.
const FICHE_MIN_SIMILARITY = 0.35;
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
    const openai = getOpenAI();
    const embedRes = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: question,
    });
    const embedding = embedRes.data?.[0]?.embedding;
    if (!embedding || embedding.length !== 1536) return [];
    const vectorLiteral = `[${embedding.join(",")}]`;
    const rows = await prisma.$queryRawUnsafe<
      Array<{
        id: string;
        title: string;
        title_ar: string | null;
        summary: string | null;
        summary_ar: string | null;
        category_name: string | null;
        category_name_ar: string | null;
        similarity: number;
      }>
    >(
      `SELECT d.id,
              d.title,
              d.title_ar,
              d.summary,
              d.summary_ar,
              c.name AS category_name,
              c.name_ar AS category_name_ar,
              1 - (d.embedding <=> $1::vector) AS similarity
         FROM documents d
         LEFT JOIN document_categories dc ON dc.document_id = d.id
         LEFT JOIN categories c ON c.id = dc.category_id
        WHERE d.published = true
          AND d.embedding IS NOT NULL
          AND 1 - (d.embedding <=> $1::vector) >= $2
        ORDER BY d.embedding <=> $1::vector
        LIMIT $3`,
      vectorLiteral,
      FICHE_MIN_SIMILARITY,
      FICHE_MAX_RESULTS,
    );
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      titleAr: r.title_ar,
      summary: r.summary,
      summaryAr: r.summary_ar,
      categoryName: r.category_name,
      categoryNameAr: r.category_name_ar,
      similarity: Number(r.similarity),
    }));
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
