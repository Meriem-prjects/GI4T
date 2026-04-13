import type { Request } from "express";
import { z } from "zod";
import { chatCompletion } from "../../services/openai.js";

const schema = z.object({
  text: z.string().min(1),
  fromLang: z.enum(["fr", "ar"]),
  toLang: z.enum(["fr", "ar"]),
});

export async function translatePage(req: Request) {
  const { text, fromLang, toLang } = schema.parse(req.body);
  if (fromLang === toLang) return { translated: text };

  const langName = (code: string) => (code === "fr" ? "French" : "Arabic");
  const translated = await chatCompletion({
    model: "gpt-4o-mini",
    system: `You are a professional legal translator. Translate from ${langName(fromLang)} to ${langName(toLang)}. Preserve legal terminology and formatting. Respond ONLY with the translation, no explanations.`,
    prompt: text,
    temperature: 0.1,
    maxTokens: 4000,
  });
  return { translated };
}
