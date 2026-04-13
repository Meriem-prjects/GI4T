import { prisma } from "../lib/prisma.js";
import { generateEmbedding } from "./openai.js";

export async function generateAndStoreEmbedding(documentId: string, text: string): Promise<void> {
  const embedding = await generateEmbedding(text.slice(0, 8000));
  const vectorLiteral = `[${embedding.join(",")}]`;
  await prisma.$executeRawUnsafe(
    `UPDATE documents SET embedding = $1::vector WHERE id = $2::uuid`,
    vectorLiteral,
    documentId,
  );
}

export async function searchBySemantics(
  queryText: string,
  threshold = 0.7,
  count = 10,
): Promise<Array<{ id: string; similarity: number }>> {
  const embedding = await generateEmbedding(queryText);
  const vectorLiteral = `[${embedding.join(",")}]`;
  return prisma.$queryRawUnsafe<Array<{ id: string; similarity: number }>>(
    `SELECT id, 1 - (embedding <=> $1::vector) AS similarity
     FROM documents
     WHERE published = true AND embedding IS NOT NULL
       AND 1 - (embedding <=> $1::vector) >= $2
     ORDER BY embedding <=> $1::vector
     LIMIT $3`,
    vectorLiteral,
    threshold,
    count,
  );
}
