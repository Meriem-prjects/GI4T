// Re-migrate only the documents table with proper JSON serialization.
// The issue: page_contents is a jsonb column containing an array of objects.
// When PostgREST returns it as a JS array, the pg driver sends it as a
// PostgreSQL array literal instead of a JSON string, which fails.
//
// Fix: detect jsonb columns from information_schema and JSON.stringify them.

import { Client } from "pg";
import "dotenv/config";

const SUPABASE_URL = process.env.SUPABASE_URL ?? "https://qpkybrcjcoxhkifnbxei.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY ?? "";
const LOCAL_DB = process.env.DATABASE_URL ??
  "postgresql://justclick:justclick_dev@localhost:5437/justclick?schema=public";

const PAGE_SIZE = 500;
const TABLE = "documents";

if (!SUPABASE_KEY) {
  console.error("Missing SUPABASE_SERVICE_KEY");
  process.exit(1);
}

function quoteIdent(id: string): string {
  return `"${id.replace(/"/g, '""')}"`;
}

async function fetchAllRows(): Promise<Record<string, unknown>[]> {
  const all: Record<string, unknown>[] = [];
  let offset = 0;
  while (true) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/${TABLE}?select=*&limit=${PAGE_SIZE}&offset=${offset}`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      },
    );
    if (!res.ok) throw new Error(`fetch ${TABLE}: ${res.status} ${await res.text()}`);
    const data = (await res.json()) as Record<string, unknown>[];
    if (data.length === 0) break;
    all.push(...data);
    if (data.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }
  return all;
}

async function getColumnTypes(local: Client): Promise<Map<string, string>> {
  const res = await local.query<{ column_name: string; data_type: string; udt_name: string }>(
    `SELECT column_name, data_type, udt_name
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1`,
    [TABLE],
  );
  const types = new Map<string, string>();
  for (const row of res.rows) {
    // data_type: 'ARRAY' for text[], 'jsonb' for jsonb, etc.
    // udt_name: '_text' for text[], 'jsonb' for jsonb, etc.
    types.set(row.column_name, `${row.data_type}:${row.udt_name}`);
  }
  return types;
}

function serialize(value: unknown, type: string | undefined): unknown {
  if (value === null || value === undefined) return value;
  if (!type) return value;

  // jsonb / json → always stringify objects and arrays
  if (type.includes("jsonb") || type.includes("json")) {
    if (typeof value === "object") return JSON.stringify(value);
    return value;
  }

  // Arrays (text[], integer[], etc.) → pass as JS array, pg handles it
  if (type === "ARRAY:_text" || type.startsWith("ARRAY:")) {
    if (Array.isArray(value)) return value;
    return value;
  }

  // Regular types
  return value;
}

async function main() {
  const local = new Client({ connectionString: LOCAL_DB });
  await local.connect();
  console.log("Connected to local DB");

  try {
    // session_replication_role requires superuser — triggers will fire.

    const columnTypes = await getColumnTypes(local);
    console.log(`Local schema has ${columnTypes.size} columns`);

    const rows = await fetchAllRows();
    console.log(`Fetched ${rows.length} documents from Supabase`);

    if (rows.length === 0) return;

    const srcCols = Object.keys(rows[0]!);
    const commonCols = srcCols.filter((c) => columnTypes.has(c));
    // Exclude 'embedding' (vector type, not in Prisma schema, must be inserted separately)
    const insertCols = commonCols.filter((c) => c !== "embedding");
    console.log(`Inserting ${insertCols.length} columns (excluded embedding)`);

    const insertSQL = `INSERT INTO ${quoteIdent(TABLE)} (${insertCols
      .map(quoteIdent)
      .join(", ")})
      VALUES (${insertCols.map((_, i) => `$${i + 1}`).join(", ")})
      ON CONFLICT (id) DO UPDATE SET
      ${insertCols
        .filter((c) => c !== "id")
        .map((c) => `${quoteIdent(c)} = EXCLUDED.${quoteIdent(c)}`)
        .join(", ")}`;

    let copied = 0;
    let failed = 0;
    for (const row of rows) {
      try {
        const values = insertCols.map((c) => serialize(row[c], columnTypes.get(c)));
        await local.query(insertSQL, values);
        copied++;
        if (copied % 50 === 0) process.stdout.write(`  ${copied}/${rows.length}\r`);
      } catch (err) {
        failed++;
        if (failed <= 5) {
          console.error(`\n  ⚠ ${(row as { id?: string }).id}: ${(err as Error).message}`);
        }
      }
    }

    // (no reset needed)
    console.log(`\n✓ Done: ${copied} copied, ${failed} failed`);
  } finally {
    await local.end();
  }
}

main().catch((e) => {
  console.error("Failed:", e);
  process.exit(1);
});
