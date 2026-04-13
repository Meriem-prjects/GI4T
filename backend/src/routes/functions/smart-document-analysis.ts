import type { Request } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { chatCompletion } from "../../services/openai.js";

const schema = z.object({
  documentId: z.string().uuid(),
  analysisType: z.enum(["full", "metadata", "summary", "keywords"]).default("full"),
});

const PROMPTS = {
  full: `Analyze this legal document and extract: title, summary, keywords (max 10), legal domains, main topics, entities, dates. Return JSON.`,
  metadata: `Extract legal metadata: court, case number, year, plaintiff, defendant, jurisdiction. Return JSON.`,
  summary: `Provide a concise 200-word summary of this legal document in French and Arabic. Return JSON with {summary, summary_ar}.`,
  keywords: `Extract 10 most relevant legal keywords in French and Arabic. Return JSON with {keywords, keywords_ar}.`,
};

export async function smartDocumentAnalysis(req: Request) {
  const { documentId, analysisType } = schema.parse(req.body);
  const doc = await prisma.document.findUnique({ where: { id: documentId } });
  if (!doc) throw new Error("Document not found");

  const raw = await chatCompletion({
    model: "gpt-4o-mini",
    system: "You are a Tunisian legal document analyzer. Respond only with valid JSON.",
    prompt: `${PROMPTS[analysisType]}\n\nDocument:\n${doc.content.slice(0, 10000)}`,
    temperature: 0.2,
  });

  let parsed: Record<string, unknown> = {};
  try {
    parsed = JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) parsed = JSON.parse(match[0]);
  }

  return { analysisType, result: parsed };
}
