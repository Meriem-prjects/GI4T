import type { Request } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { chatCompletion } from "../../services/openai.js";

const schema = z.object({
  documentId: z.string().uuid(),
});

const ANALYSIS_SYSTEM_PROMPT = `You are a legal document analyzer for Tunisian law.
Extract structured metadata from the document.
Return a JSON object with: title, subtitle, summary, author, keywords (array), legalDomains (array), mainTopics (array), court, caseNumber, year, plaintiff, defendant, jurisdiction, legalReferences (array), entities (array), dates (array).
Provide both French (key) and Arabic (key_ar) versions when applicable.
Respond ONLY with valid JSON, no markdown fences.`;

export async function documentAnalysis(req: Request) {
  const { documentId } = schema.parse(req.body);
  const doc = await prisma.document.findUnique({ where: { id: documentId } });
  if (!doc) throw new Error("Document not found");

  const raw = await chatCompletion({
    model: "gpt-4o-mini",
    system: ANALYSIS_SYSTEM_PROMPT,
    prompt: doc.content.slice(0, 12000),
    temperature: 0.2,
  });

  let parsed: Record<string, unknown> = {};
  try {
    parsed = JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) parsed = JSON.parse(match[0]);
  }

  const updated = await prisma.document.update({
    where: { id: documentId },
    data: {
      title: (parsed.title as string) || doc.title,
      titleAr: (parsed.title_ar as string) || doc.titleAr,
      subtitle: (parsed.subtitle as string) || doc.subtitle,
      subtitleAr: (parsed.subtitle_ar as string) || doc.subtitleAr,
      summary: (parsed.summary as string) || doc.summary,
      summaryAr: (parsed.summary_ar as string) || doc.summaryAr,
      author: (parsed.author as string) || doc.author,
      authorAr: (parsed.author_ar as string) || doc.authorAr,
      keywords: Array.isArray(parsed.keywords) ? (parsed.keywords as string[]) : doc.keywords,
      keywordsAr: Array.isArray(parsed.keywords_ar) ? (parsed.keywords_ar as string[]) : doc.keywordsAr,
      legalDomains: Array.isArray(parsed.legalDomains) ? (parsed.legalDomains as string[]) : doc.legalDomains,
      mainTopics: Array.isArray(parsed.mainTopics) ? (parsed.mainTopics as string[]) : doc.mainTopics,
      court: (parsed.court as string) || doc.court,
      caseNumber: (parsed.caseNumber as string) || doc.caseNumber,
      year: (parsed.year as number) || doc.year,
      plaintiff: (parsed.plaintiff as string) || doc.plaintiff,
      defendant: (parsed.defendant as string) || doc.defendant,
      jurisdiction: (parsed.jurisdiction as string) || doc.jurisdiction,
      legalReferences: Array.isArray(parsed.legalReferences)
        ? (parsed.legalReferences as string[])
        : doc.legalReferences,
      entities: Array.isArray(parsed.entities) ? (parsed.entities as string[]) : doc.entities,
      dates: Array.isArray(parsed.dates) ? (parsed.dates as string[]) : doc.dates,
      status: "processed",
    },
  });
  return updated;
}
