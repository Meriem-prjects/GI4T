import type { Request } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { chatCompletion } from "../../services/openai.js";

const schema = z.object({
  message: z.string().min(1),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .default([]),
  language: z.enum(["fr", "ar"]).default("fr"),
});

export async function accesDroitsChat(req: Request) {
  const { message, history, language } = schema.parse(req.body);

  const config = await prisma.chatbotConfig.findFirst();
  const trainingDocs = await prisma.chatbotTrainingDocument.findMany({
    where: { isActive: true },
    select: { title: true, content: true },
  });

  const context = trainingDocs
    .slice(0, 10)
    .map((d) => `### ${d.title}\n${d.content.slice(0, 2000)}`)
    .join("\n\n");

  const systemPrompt = `${config?.systemPrompt ?? "You are a helpful legal information assistant for Tunisia."}

Language: respond in ${language === "ar" ? "Arabic" : "French"}.

Knowledge base (use this as context, do not invent facts):
${context}`;

  const messages = history.slice(-10).map((m) => `${m.role}: ${m.content}`).join("\n");
  const prompt = `${messages}\n\nuser: ${message}\n\nassistant:`;

  const answer = await chatCompletion({
    model: "gpt-4o-mini",
    system: systemPrompt,
    prompt,
    temperature: 0.4,
    maxTokens: 800,
  });

  return { answer, language };
}
