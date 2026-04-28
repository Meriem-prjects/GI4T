import { prisma } from "../lib/prisma.js";
import { generateEmbedding } from "./openai.js";

function toVectorLiteral(embedding: number[]): string {
  // Force decimal representation (pgvector can't parse scientific notation).
  return `[${embedding.map((n) => n.toFixed(8)).join(",")}]`;
}

export async function generateAndStoreEmbedding(documentId: string, text: string): Promise<void> {
  // text-embedding-3-small has a hard limit of 8192 tokens. We keep
  // a conservative 4 000 character slice (≈ 1 000–4 000 tokens
  // depending on the language) to never hit the limit.
  const embedding = await generateEmbedding(text.slice(0, 4000));
  const vectorLiteral = toVectorLiteral(embedding);
  // Inline the vector literal — Prisma's $executeRawUnsafe sometimes
  // fails to cast large numeric strings to ::vector when passed as
  // a parameter.
  await prisma.$executeRawUnsafe(
    `UPDATE documents SET embedding = '${vectorLiteral}'::vector WHERE id = '${documentId}'::uuid`,
  );
}

export async function searchBySemantics(
  queryText: string,
  threshold = 0.7,
  count = 10,
): Promise<Array<{ id: string; similarity: number }>> {
  const embedding = await generateEmbedding(queryText);
  const vectorLiteral = toVectorLiteral(embedding);
  // Inline the vector literal directly into the query.
  return prisma.$queryRawUnsafe<Array<{ id: string; similarity: number }>>(
    `SELECT id, (1 - (embedding <=> '${vectorLiteral}'::vector))::float AS similarity
     FROM documents
     WHERE published = true AND embedding IS NOT NULL
       AND (1 - (embedding <=> '${vectorLiteral}'::vector)) >= ${threshold}
     ORDER BY embedding <=> '${vectorLiteral}'::vector
     LIMIT ${count}`,
  );
}
