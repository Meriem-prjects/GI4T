// Helpers to (re)embed rows in the Accès-aux-droits content tables and
// to search them semantically. Shared between the batch script and the
// chat function so the on-save hook and the retrieval path stay
// consistent.
//
// The strategy is the same for every table: concatenate the
// language-agnostic bag of {title, titleAr?, description/content/etc.},
// hash it, embed it, upsert into `embedding` + `embedding_hash`. On the
// next write we bump the hash by clearing it (or comparing content),
// and a background pass re-embeds any row whose hash is stale.

import { createHash } from "crypto";
import { prisma } from "../lib/prisma.js";
import { generateEmbedding } from "./openai.js";

// The five surfaces the chat should be able to cite. Keep this list in
// sync with the tables that got the embedding column in the migration.
export type AadTable =
  | "chatbot_training_documents"
  | "practical_guides"
  | "news"
  | "practical_resources"
  | "useful_links";

// Per-table configuration: which SQL columns feed the embedding, which
// column governs "should we surface this row", and the frontend-facing
// type name emitted to the chat client.
interface AadTableSpec {
  table: AadTable;
  clientType: "training" | "guide" | "news" | "resource" | "link";
  publishedColumn: string;
  titleColumn: string;
  titleArColumn: string | null;
  extraTextColumns: string[];
}

export const AAD_TABLES: AadTableSpec[] = [
  {
    table: "chatbot_training_documents",
    clientType: "training",
    publishedColumn: "is_active",
    titleColumn: "title",
    titleArColumn: "title_ar",
    extraTextColumns: ["content"],
  },
  {
    table: "practical_guides",
    clientType: "guide",
    publishedColumn: "is_published",
    titleColumn: "title",
    titleArColumn: "title_ar",
    extraTextColumns: ["description", "description_ar", "content", "content_ar"],
  },
  {
    table: "news",
    clientType: "news",
    publishedColumn: "is_published",
    titleColumn: "title",
    titleArColumn: "title_ar",
    extraTextColumns: ["excerpt", "excerpt_ar", "content", "content_ar"],
  },
  {
    table: "practical_resources",
    clientType: "resource",
    publishedColumn: "is_published",
    titleColumn: "title",
    titleArColumn: "title_ar",
    extraTextColumns: ["description", "description_ar"],
  },
  {
    table: "useful_links",
    clientType: "link",
    publishedColumn: "is_published",
    titleColumn: "title",
    titleArColumn: "title_ar",
    extraTextColumns: ["description", "description_ar"],
  },
];

function hash(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

/**
 * Immediately (re)embed one row that just got written via the admin
 * CRUD. Called from the makeCrudRouter `afterWrite` hook — never blocks
 * the client response so a slow embedding call can't wedge the admin UI.
 * Safe to call with any row shape; if we don't know the table we
 * silently skip.
 */
export async function embedOneAadRow(
  table: AadTable,
  row: Record<string, unknown>,
): Promise<void> {
  const spec = AAD_TABLES.find((s) => s.table === table);
  if (!spec) return;
  // Prisma returns camelCase — normalise to the snake_case shape the
  // rest of this module speaks so `textFromRow` and the UPDATE agree.
  const camelToSnake = (k: string) => k.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
  const snakeRow: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) snakeRow[camelToSnake(k)] = v;
  const text = textFromRow(snakeRow, spec);
  if (!text) return;
  const id = snakeRow.id ?? row.id;
  if (typeof id !== "string") return;
  try {
    const currentHash = hash(text);
    const embedding = await generateEmbedding(text);
    if (!embedding?.length || embedding.some((n) => !Number.isFinite(n))) return;
    const vectorLiteral = toVectorLiteral(embedding);
    await prisma.$executeRawUnsafe(
      `UPDATE ${spec.table}
         SET embedding = '${vectorLiteral}'::vector,
             embedding_hash = $1
       WHERE id = $2::uuid`,
      currentHash,
      id,
    );
  } catch (err) {
    console.warn(`[aad-embed] eager embed failed for ${spec.table}.${id}:`, (err as Error).message);
  }
}

function textFromRow(row: Record<string, unknown>, spec: AadTableSpec): string {
  const parts: string[] = [];
  const title = row[spec.titleColumn];
  if (typeof title === "string" && title.trim()) parts.push(title.trim());
  if (spec.titleArColumn) {
    const titleAr = row[spec.titleArColumn];
    if (typeof titleAr === "string" && titleAr.trim()) parts.push(titleAr.trim());
  }
  for (const col of spec.extraTextColumns) {
    const v = row[col];
    if (typeof v === "string" && v.trim()) parts.push(v.trim());
  }
  return parts.join("\n\n");
}

function toVectorLiteral(vec: number[]): string {
  return `[${vec.map((n) => n.toFixed(8)).join(",")}]`;
}

/**
 * Re-embed rows whose (title + body) hash differs from what we last
 * embedded. Runs one row at a time to keep the concurrent embed calls
 * bounded — the corpus is small (< a few hundred rows) so wall-clock
 * cost is a rounding error compared to a single fiche's OCR.
 *
 * Returns a per-table summary of {scanned, refreshed}.
 */
export async function refreshAadEmbeddings(): Promise<
  Record<AadTable, { scanned: number; refreshed: number }>
> {
  const summary = {} as Record<AadTable, { scanned: number; refreshed: number }>;
  for (const spec of AAD_TABLES) {
    const rows = await prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(
      `SELECT id, ${spec.titleColumn}${spec.titleArColumn ? `, ${spec.titleArColumn}` : ""}${
        spec.extraTextColumns.length > 0 ? `, ${spec.extraTextColumns.join(", ")}` : ""
      }, embedding_hash
       FROM ${spec.table}
       WHERE ${spec.publishedColumn} = true`,
    );
    let refreshed = 0;
    for (const row of rows) {
      const text = textFromRow(row, spec);
      if (!text) continue;
      const currentHash = hash(text);
      if (row.embedding_hash === currentHash) continue;
      try {
        const embedding = await generateEmbedding(text);
        if (!embedding?.length || embedding.some((n) => !Number.isFinite(n))) continue;
        const vectorLiteral = toVectorLiteral(embedding);
        await prisma.$executeRawUnsafe(
          `UPDATE ${spec.table}
             SET embedding = '${vectorLiteral}'::vector,
                 embedding_hash = $1
           WHERE id = $2::uuid`,
          currentHash,
          row.id,
        );
        refreshed++;
      } catch (err) {
        console.warn(
          `[aad-embed] failed to embed ${spec.table}.${row.id}:`,
          (err as Error).message,
        );
      }
    }
    summary[spec.table] = { scanned: rows.length, refreshed };
  }
  return summary;
}

/**
 * Semantic search against a single Accès-aux-droits table. Returns the
 * hydrated rows with a `similarity` score (0..1), sorted best first.
 * Same threshold model as fiche search — the caller decides the cutoff.
 */
export async function searchAadTable(
  spec: AadTableSpec,
  vectorLiteral: string,
  minSimilarity: number,
  limit: number,
): Promise<Array<Record<string, unknown> & { similarity: number }>> {
  const cols = [
    "id",
    spec.titleColumn,
    ...(spec.titleArColumn ? [spec.titleArColumn] : []),
    ...spec.extraTextColumns,
  ];
  // Include category columns opportunistically — only some tables have
  // them, so probe with a LEFT JOIN of information_schema is overkill.
  // Instead we try/catch: unknown columns just come back as null.
  const optionalCols = ["category", "category_ar", "url", "file_url"];
  const selectCols = [...cols, ...optionalCols].join(", ");
  try {
    const rows = await prisma.$queryRawUnsafe<
      Array<Record<string, unknown> & { similarity: number }>
    >(
      `SELECT ${selectCols},
              (1 - (embedding <=> '${vectorLiteral}'::vector))::float AS similarity
         FROM ${spec.table}
        WHERE ${spec.publishedColumn} = true
          AND embedding IS NOT NULL
          AND (1 - (embedding <=> '${vectorLiteral}'::vector)) >= ${minSimilarity}
        ORDER BY embedding <=> '${vectorLiteral}'::vector
        LIMIT ${limit}`,
    );
    return rows;
  } catch (err) {
    // Table may be missing one of the optional columns — retry without
    // them so we still return matches.
    const errMsg = (err as Error).message;
    if (!/column .* does not exist/i.test(errMsg)) throw err;
    const rows = await prisma.$queryRawUnsafe<
      Array<Record<string, unknown> & { similarity: number }>
    >(
      `SELECT ${cols.join(", ")},
              (1 - (embedding <=> '${vectorLiteral}'::vector))::float AS similarity
         FROM ${spec.table}
        WHERE ${spec.publishedColumn} = true
          AND embedding IS NOT NULL
          AND (1 - (embedding <=> '${vectorLiteral}'::vector)) >= ${minSimilarity}
        ORDER BY embedding <=> '${vectorLiteral}'::vector
        LIMIT ${limit}`,
    );
    return rows;
  }
}

/**
 * Search every Accès-aux-droits surface at once and return a flat list
 * of hits with their client-facing metadata already assembled.
 */
export async function searchAllAad(
  question: string,
  minSimilarity: number,
  perTableLimit: number,
): Promise<
  Array<{
    id: string;
    type: AadTableSpec["clientType"];
    title: string;
    titleAr: string | null;
    summary: string | null;
    summaryAr: string | null;
    category: string | null;
    categoryAr: string | null;
    href: string | null;
    similarity: number;
  }>
> {
  const embedding = await generateEmbedding(question);
  if (!embedding?.length || embedding.some((n) => !Number.isFinite(n))) return [];
  const vectorLiteral = toVectorLiteral(embedding);
  const results = await Promise.all(
    AAD_TABLES.map(async (spec) => {
      const rows = await searchAadTable(spec, vectorLiteral, minSimilarity, perTableLimit);
      return rows.map((r) => ({
        id: String(r.id),
        type: spec.clientType,
        title: (r[spec.titleColumn] as string) ?? "",
        titleAr: (spec.titleArColumn ? (r[spec.titleArColumn] as string) : null) ?? null,
        summary:
          (r.description as string) ??
          (r.excerpt as string) ??
          (r.content as string) ??
          null,
        summaryAr:
          (r.description_ar as string) ??
          (r.excerpt_ar as string) ??
          (r.content_ar as string) ??
          null,
        category: (r.category as string) ?? null,
        categoryAr: (r.category_ar as string) ?? null,
        href:
          spec.clientType === "link"
            ? ((r.url as string) ?? null)
            : spec.clientType === "resource"
              ? ((r.file_url as string) ?? null)
              : null,
        similarity: Number(r.similarity),
      }));
    }),
  );
  return results.flat().sort((a, b) => b.similarity - a.similarity);
}
