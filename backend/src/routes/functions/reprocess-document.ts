import type { Request } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { documentAnalysis } from "./document-analysis.js";
import { generateAndStoreEmbedding } from "../../services/embeddings.js";

const schema = z.object({
  documentId: z.string().uuid(),
  regenerateEmbedding: z.boolean().default(true),
});

export async function reprocessDocument(req: Request) {
  const { documentId, regenerateEmbedding } = schema.parse(req.body);
  const analysisReq = { ...req, body: { documentId } } as Request;
  const updated = await documentAnalysis(analysisReq);
  if (regenerateEmbedding) {
    const doc = await prisma.document.findUnique({ where: { id: documentId } });
    if (doc && doc.content) {
      await generateAndStoreEmbedding(documentId, doc.content);
    }
  }
  return updated;
}
