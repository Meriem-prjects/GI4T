import type { Request } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { chatCompletion } from "../../services/openai.js";

const schema = z.object({
  documentId: z.string().uuid(),
  targetLang: z.enum(["fr", "ar"]),
});

function chunk(text: string, size = 3000): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += size) chunks.push(text.slice(i, i + size));
  return chunks;
}

export async function asyncFullTranslation(req: Request) {
  const { documentId, targetLang } = schema.parse(req.body);
  const doc = await prisma.document.findUnique({ where: { id: documentId } });
  if (!doc) throw new Error("Document not found");

  const sourceLang = targetLang === "fr" ? "Arabic" : "French";
  const targetName = targetLang === "fr" ? "French" : "Arabic";

  const parts = chunk(doc.content);
  const translated: string[] = [];
  for (const part of parts) {
    const t = await chatCompletion({
      model: "gpt-4o-mini",
      system: `Translate the following ${sourceLang} legal text to ${targetName}. Preserve formatting. Respond only with the translation.`,
      prompt: part,
      temperature: 0.1,
    });
    translated.push(t);
  }

  const fullTranslation = translated.join("\n");
  await prisma.document.update({
    where: { id: documentId },
    data: { translatedContent: fullTranslation },
  });
  return { ok: true, length: fullTranslation.length };
}
