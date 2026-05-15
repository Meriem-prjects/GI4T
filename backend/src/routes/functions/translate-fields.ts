import type { Request } from "express";
import { z } from "zod";
import { chatCompletion } from "../../services/openai.js";

// Translate a batch of named fields (title, summary, legal_problem, sections[0].content, ...)
// in a single OpenAI call. Returns the same keys with their translated values.
// Accepts the legacy {document_id, page_number, content, source_language, target_language}
// shape too — the old per-page translate flow used this signature.
const batchSchema = z.object({
  fields: z.record(z.string(), z.string()),
  sourceLang: z.enum(["fr", "ar"]).optional(),
  targetLang: z.enum(["fr", "ar"]).optional(),
  // Legacy per-page params (treated as a single-field batch)
  document_id: z.string().uuid().optional(),
  page_number: z.number().int().optional(),
  content: z.string().optional(),
  source_language: z.enum(["fr", "ar"]).optional(),
  target_language: z.enum(["fr", "ar"]).optional(),
});

function safeParseJson(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw);
  } catch {
    const m = raw.match(/\{[\s\S]*\}/);
    if (m) {
      try {
        return JSON.parse(m[0]);
      } catch {
        return {};
      }
    }
    return {};
  }
}

export async function translateFields(req: Request) {
  const args = batchSchema.parse(req.body);

  // Resolve fields + langs from either shape
  let fields = args.fields;
  let sourceLang = args.sourceLang ?? args.source_language;
  let targetLang = args.targetLang ?? args.target_language;
  if (!fields && args.content) {
    fields = { translated_content: args.content };
  }
  if (!fields) {
    return { translations: {} };
  }
  if (!sourceLang || !targetLang) {
    return { translations: {}, error: "sourceLang and targetLang are required" };
  }

  if (sourceLang === targetLang) {
    // Echo back unchanged
    return { translations: fields, translated_content: args.content ?? "" };
  }

  // Drop empty fields up front
  const filteredEntries = Object.entries(fields).filter(
    ([, v]) => typeof v === "string" && v.trim().length > 0,
  );
  if (filteredEntries.length === 0) {
    return { translations: {}, translated_content: "" };
  }
  const filtered = Object.fromEntries(filteredEntries);

  const langName = (c: string) => (c === "fr" ? "French" : "Arabic");
  const system = `You are a professional legal translator working on Tunisian law documents.
Translate every value in the JSON object below from ${langName(sourceLang)} to ${langName(targetLang)}.
Preserve legal terminology, proper names, dates, numbers, HTML tags, and the existing paragraph structure.
Return STRICT JSON ONLY with the SAME KEYS, each value replaced by its translation. No markdown, no commentary.`;

  const userPrompt = `JSON à traduire :\n${JSON.stringify(filtered, null, 2)}`;

  const raw = await chatCompletion({
    model: "gpt-4o-mini",
    system,
    prompt: userPrompt,
    temperature: 0.1,
    maxTokens: 8000,
  });

  const parsed = safeParseJson(raw);
  const translations: Record<string, string> = {};
  for (const k of Object.keys(filtered)) {
    const v = parsed[k];
    translations[k] = typeof v === "string" ? v : "";
  }

  // Legacy shape compat: if the caller used {content}, also expose translated_content
  const translated_content = translations.translated_content ?? translations.content ?? "";

  return { translations, translated_content };
}
