import { prisma } from "../lib/prisma.js";
import { generateEmbedding } from "./openai.js";

function toVectorLiteral(embedding: number[]): string {
  // Force decimal representation (pgvector can't parse scientific notation).
  return `[${embedding.map((n) => n.toFixed(8)).join(",")}]`;
}

export interface EmbeddingSource {
  title?: string | null;
  titleAr?: string | null;
  summary?: string | null;
  summaryAr?: string | null;
  content?: string | null;
}

// Build the string passed to the embedding model. Titles are repeated
// three times so their semantic signal dominates the resulting vector —
// citizens search by "the title of the fiche" much more than by content.
// Bilingual titles are included together so a query in either language
// finds the same document.
export function buildEmbeddingText(doc: EmbeddingSource): string {
  const t = (doc.title ?? "").trim();
  const tAr = (doc.titleAr ?? "").trim();
  const s = (doc.summary ?? "").trim();
  const sAr = (doc.summaryAr ?? "").trim();
  const c = (doc.content ?? "").trim();
  const parts: string[] = [];
  // Boost titles: 3× each language.
  if (t) parts.push(t, t, t);
  if (tAr) parts.push(tAr, tAr, tAr);
  // Summaries once each.
  if (s) parts.push(s);
  if (sAr) parts.push(sAr);
  // Content last — carries most of the length budget.
  if (c) parts.push(c);
  return parts.join("\n\n");
}

// Accept either a raw string (legacy signature) or the doc object so
// existing callers keep working while new code passes the full fields.
export async function generateAndStoreEmbedding(
  documentId: string,
  input: string | EmbeddingSource,
): Promise<void> {
  const text = typeof input === "string" ? input : buildEmbeddingText(input);
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
  // Defensive: reject degenerate embeddings before they poison the SQL
  // literal. `.toFixed(8)` on NaN produces the string "NaN", which
  // Postgres would reject with a parse error, blanking downstream calls.
  if (!embedding?.length || embedding.some((n) => !Number.isFinite(n))) {
    throw new Error("Invalid embedding vector (empty or NaN)");
  }
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
