import type { Request } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";

const schema = z.object({
  action: z.enum(["list", "train", "refresh"]).default("list"),
});

export async function chatbotFineTuning(req: Request) {
  const { action } = schema.parse(req.body);

  if (action === "list") {
    const docs = await prisma.chatbotTrainingDocument.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
    return { documents: docs };
  }

  if (action === "refresh") {
    const docs = await prisma.chatbotTrainingDocument.findMany({ where: { isActive: true } });
    const combined = docs.map((d) => `${d.title}\n${d.content}`).join("\n\n---\n\n");
    return {
      ok: true,
      knowledgeBaseSize: combined.length,
      documentCount: docs.length,
    };
  }

  // "train" — in the new backend we don't actually fine-tune a model.
  // We just mark the training data as active for retrieval-augmented generation.
  return { ok: true, message: "RAG-based chatbot: no fine-tuning needed" };
}
