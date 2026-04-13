import type { Request } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { generateAndStoreEmbedding } from "../../services/embeddings.js";

const schema = z.object({
  documentId: z.string().uuid(),
});

export async function generateDocumentEmbeddings(req: Request) {
  const { documentId } = schema.parse(req.body);
  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    select: { id: true, title: true, content: true, summary: true },
  });
  if (!doc) throw new Error("Document not found");

  const text = [doc.title, doc.summary, doc.content].filter(Boolean).join("\n\n");
  await generateAndStoreEmbedding(documentId, text);
  return { ok: true, documentId };
}
