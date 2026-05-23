import type { Request } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { getOpenAI } from "../../services/openai.js";

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

export async function accesDroitsChat(req: Request) {
  const { message, history, language } = schema.parse(req.body);

  const config = await prisma.chatbotConfig.findFirst();
  const trainingDocs = await prisma.chatbotTrainingDocument.findMany({
    where: { isActive: true },
    select: { title: true, titleAr: true, content: true },
  });

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

  const systemPrompt = `${config?.systemPrompt ?? "Tu es un assistant juridique tunisien spécialisé dans l'accès aux droits."}

Language: respond in ${language === "ar" ? "Arabic" : "French"}.

PRIORITÉ DE RÉPONSE :
1. Si la question de l'utilisateur correspond à une Q/R de la base de connaissances ci-dessous, réponds avec la R: associée — c'est la position officielle de l'ODF.
2. Sinon, réponds avec tes connaissances générales sur le droit tunisien.
3. Ne jamais inventer un article de loi, une date, un numéro de loi ou de fascicule officiel.

Base de connaissances ODF (Q/R curées) :
${context}`;

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

  return { answer, language, matchedTopics: selected.map((s) => s.doc.title) };
}
