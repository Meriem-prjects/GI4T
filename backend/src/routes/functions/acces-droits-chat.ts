import type { Request } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { getOpenAI } from "../../services/openai.js";
import { searchBySemantics } from "../../services/embeddings.js";

// Semantic-fiche retrieval configuration. Threshold 0.15 — measured on
// this corpus. Full-sentence conversational French questions ("quels
// sont mes droits en cas de licenciement abusif ?") land at raw cosine
// similarity 0.20–0.30 against Arabic-language fiches. Empirical noise
// floor: "bonjour" @ 0.15 returns 0 matches; real questions return 3
// topically relevant fiches. Boost applied client-side (see scoreVisual)
// isn't relevant here since we display the raw score.
const FICHE_MIN_SIMILARITY = 0.15;
const FICHE_MAX_RESULTS = 3;
const FICHE_MAX_SUMMARY_CHARS = 600;
// Keyword-scored Accès-aux-droits content (guides, actualités, resources,
// useful links). Cheaper than embeddings and fine since each row is short
// and has clean editorial titles. We surface up to this many alongside
// the fiche results so the chat can point to native ADD content too.
const ACCES_MIN_SCORE = 2;
const ACCES_MAX_RESULTS = 3;

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
    // Normalise the question before embedding: strip trailing punctuation
    // (measured: an ending "?" drops cosine similarity from ~0.33 to <0.15
    // on the exact same substantive content — the embedder treats it as a
    // generic-question signal). Collapse whitespace too.
    const cleanQuestion = question
      .trim()
      .replace(/[?!;.,]+$/g, "")
      .replace(/\s+/g, " ")
      .trim();
    // Reuse the same pgvector helper as /api/fn/ai-semantic-search — it
    // inlines the vector literal in the SQL, which is what pgvector needs
    // (parameter binding via `$1::vector` doesn't round-trip through
    // Prisma's raw query). Then hydrate ids with metadata Prisma can join.
    const matches = await searchBySemantics(cleanQuestion, FICHE_MIN_SIMILARITY, FICHE_MAX_RESULTS);
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

// Retrieval over the native Accès-aux-droits content — practical guides,
// news articles, practical resources, useful links. These rows are short
// and editorial, so keyword scoring is enough (no embedding call). Each
// hit carries the type so the frontend can pick an icon and destination
// URL. Failure is non-fatal.
type AccesDroitsHit = {
  id: string;
  type: "guide" | "news" | "resource" | "link";
  title: string;
  titleAr: string | null;
  summary: string | null;
  summaryAr: string | null;
  category: string | null;
  categoryAr: string | null;
  href: string;
  score: number;
};

async function retrieveAccesDroitsContent(question: string): Promise<AccesDroitsHit[]> {
  try {
    const [guides, news, resources, links] = await Promise.all([
      prisma.practicalGuide.findMany({
        where: { isPublished: true },
        select: {
          id: true,
          title: true,
          titleAr: true,
          description: true,
          descriptionAr: true,
          content: true,
          category: true,
          categoryAr: true,
        },
      }),
      prisma.news.findMany({
        where: { isPublished: true },
        select: {
          id: true,
          title: true,
          titleAr: true,
          excerpt: true,
          excerptAr: true,
          content: true,
          contentAr: true,
          category: true,
        },
      }),
      prisma.practicalResource.findMany({
        where: { isPublished: true },
        select: {
          id: true,
          title: true,
          titleAr: true,
          description: true,
          descriptionAr: true,
          category: true,
          categoryAr: true,
          fileUrl: true,
        },
      }),
      prisma.usefulLink.findMany({
        where: { isPublished: true },
        select: {
          id: true,
          title: true,
          titleAr: true,
          description: true,
          descriptionAr: true,
          category: true,
          categoryAr: true,
          url: true,
        },
      }),
    ]);

    const hits: AccesDroitsHit[] = [];

    for (const g of guides) {
      const score = scoreDoc(question, {
        title: g.title,
        titleAr: g.titleAr,
        content: `${g.description ?? ""} ${g.descriptionAr ?? ""} ${g.content ?? ""}`,
      });
      if (score >= ACCES_MIN_SCORE) {
        hits.push({
          id: g.id,
          type: "guide",
          title: g.title,
          titleAr: g.titleAr,
          summary: g.description,
          summaryAr: g.descriptionAr,
          category: g.category,
          categoryAr: g.categoryAr,
          href: `/acces-aux-droits/guides-pratiques#${g.id}`,
          score,
        });
      }
    }

    for (const n of news) {
      const score = scoreDoc(question, {
        title: n.title,
        titleAr: n.titleAr,
        content: `${n.excerpt ?? ""} ${n.excerptAr ?? ""} ${n.content ?? ""} ${n.contentAr ?? ""}`,
      });
      if (score >= ACCES_MIN_SCORE) {
        hits.push({
          id: n.id,
          type: "news",
          title: n.title,
          titleAr: n.titleAr,
          summary: n.excerpt,
          summaryAr: n.excerptAr,
          category: n.category,
          categoryAr: null,
          href: `/acces-aux-droits/actualites#${n.id}`,
          score,
        });
      }
    }

    for (const r of resources) {
      const score = scoreDoc(question, {
        title: r.title,
        titleAr: r.titleAr,
        content: `${r.description ?? ""} ${r.descriptionAr ?? ""}`,
      });
      if (score >= ACCES_MIN_SCORE) {
        hits.push({
          id: r.id,
          type: "resource",
          title: r.title,
          titleAr: r.titleAr,
          summary: r.description,
          summaryAr: r.descriptionAr,
          category: r.category,
          categoryAr: r.categoryAr,
          href: r.fileUrl ?? `/acces-aux-droits/ressources-pratiques#${r.id}`,
          score,
        });
      }
    }

    for (const l of links) {
      const score = scoreDoc(question, {
        title: l.title,
        titleAr: l.titleAr,
        content: `${l.description ?? ""} ${l.descriptionAr ?? ""}`,
      });
      if (score >= ACCES_MIN_SCORE) {
        hits.push({
          id: l.id,
          type: "link",
          title: l.title,
          titleAr: l.titleAr,
          summary: l.description,
          summaryAr: l.descriptionAr,
          category: l.category,
          categoryAr: l.categoryAr,
          href: l.url,
          score,
        });
      }
    }

    return hits.sort((a, b) => b.score - a.score).slice(0, ACCES_MAX_RESULTS);
  } catch (err) {
    console.warn("[acces-droits-chat] AAD content retrieval failed:", (err as Error).message);
    return [];
  }
}

export async function accesDroitsChat(req: Request) {
  const { message, history, language } = schema.parse(req.body);

  const [config, trainingDocs, fiches, accesDroitsHits] = await Promise.all([
    prisma.chatbotConfig.findFirst(),
    prisma.chatbotTrainingDocument.findMany({
      where: { isActive: true },
      select: { title: true, titleAr: true, content: true },
    }),
    retrieveRelevantFiches(message),
    retrieveAccesDroitsContent(message),
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

  // Same-shape context block for the Accès-aux-droits content the LLM
  // should also cite when it fits the question.
  const accesContext = accesDroitsHits
    .map((h, i) => {
      const t = language === "ar" && h.titleAr ? h.titleAr : h.title;
      const s = language === "ar" && h.summaryAr ? h.summaryAr : h.summary;
      const kind =
        h.type === "guide"
          ? "GUIDE PRATIQUE"
          : h.type === "news"
            ? "ACTUALITÉ"
            : h.type === "resource"
              ? "RESSOURCE"
              : "LIEN UTILE";
      return `[${kind} ${i + 1}] ${t}${s ? `\n${s.slice(0, FICHE_MAX_SUMMARY_CHARS)}` : ""}`;
    })
    .join("\n\n");

  const systemPrompt = `${config?.systemPrompt ?? "Tu es un assistant juridique tunisien spécialisé dans l'accès aux droits."}

Language: respond in ${language === "ar" ? "Arabic" : "French"}.

PRIORITÉ DE RÉPONSE :
1. Si la question de l'utilisateur correspond à une Q/R de la base de connaissances ci-dessous, réponds avec la R: associée — c'est la position officielle de l'ODF.
2. Sinon, utilise les FICHES DE L'OBSERVATOIRE et les CONTENUS ACCÈS-AUX-DROITS ci-dessous et cite-les naturellement quand ils sont pertinents ("d'après la fiche X…", "voir le guide Y…", "l'actualité Z traite de ce sujet…").
3. Sinon encore, réponds avec tes connaissances générales sur le droit tunisien.
4. Ne jamais inventer un article de loi, une date, un numéro de loi ou de fascicule officiel.

Base de connaissances ODF (Q/R curées) :
${context}

${fiches.length > 0 ? `Fiches de l'observatoire pertinentes :\n${fichesContext}\n` : ""}${accesDroitsHits.length > 0 ? `Contenus Accès-aux-droits pertinents :\n${accesContext}` : ""}`;

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

  // Emit fiche + Accès-aux-droits hits in one array with a `type` field.
  // For Accès-aux-droits rows we don't have a cosine similarity — map the
  // keyword score onto a comparable 0.15–0.5 band so the UI badges look
  // sensible next to fiche scores.
  const accesSources = accesDroitsHits.map((h) => ({
    id: h.id,
    type: h.type,
    title: h.title,
    titleAr: h.titleAr,
    categoryName: h.category,
    categoryNameAr: h.categoryAr,
    href: h.href,
    similarity: Math.min(0.5, 0.15 + h.score * 0.06),
  }));

  const ficheSources = fiches.map((f) => ({
    id: f.id,
    type: "fiche" as const,
    title: f.title,
    titleAr: f.titleAr,
    categoryName: f.categoryName,
    categoryNameAr: f.categoryNameAr,
    href: null as string | null,
    similarity: f.similarity,
  }));

  return {
    answer,
    language,
    matchedTopics: selected.map((s) => s.doc.title),
    sources: [...ficheSources, ...accesSources].sort(
      (a, b) => b.similarity - a.similarity,
    ),
  };
}
