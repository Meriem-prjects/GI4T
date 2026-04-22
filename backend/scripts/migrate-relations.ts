// Re-migrate tables that depend on documents (document_categories, document_views)
// after the documents have been fixed.

import { Client } from "pg";
import "dotenv/config";

const SUPABASE_URL = process.env.SUPABASE_URL ?? "https://qpkybrcjcoxhkifnbxei.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY ?? "";
const LOCAL_DB = process.env.DATABASE_URL ?? "";

if (!SUPABASE_KEY) {
  console.error("Missing SUPABASE_SERVICE_KEY");
  process.exit(1);
}

const PAGE_SIZE = 1000;

function quoteIdent(id: string): string {
  return `"${id.replace(/"/g, '""')}"`;
}

async function fetchAll(table: string): Promise<Record<string, unknown>[]> {
  const all: Record<string, unknown>[] = [];
  let offset = 0;
  while (true) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/${table}?select=*&limit=${PAGE_SIZE}&offset=${offset}`,
      {
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      },
    );
    if (!res.ok) throw new Error(`${table}: ${res.status}`);
    const data = (await res.json()) as Record<string, unknown>[];
    if (data.length === 0) break;
    all.push(...data);
    if (data.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }
  return all;
}

async function getColumns(local: Client, table: string): Promise<Set<string>> {
  const res = await local.query<{ column_name: string }>(
    `SELECT column_name FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1`,
    [table],
  );
  return new Set(res.rows.map((r) => r.column_name));
}

async function migrateTable(local: Client, table: string): Promise<void> {
  const rows = await fetchAll(table);
  if (rows.length === 0) {
    console.log(`${table}: empty`);
    return;
  }
  const cols = await getColumns(local, table);
  const srcCols = Object.keys(rows[0]!).filter((c) => cols.has(c));
  const insertSQL = `INSERT INTO ${quoteIdent(table)} (${srcCols
    .map(quoteIdent)
    .join(", ")}) VALUES (${srcCols.map((_, i) => `$${i + 1}`).join(", ")})
    ON CONFLICT DO NOTHING`;

  let ok = 0;
  let fail = 0;
  for (const row of rows) {
    try {
      const values = srcCols.map((c) => {
        const v = row[c];
        if (v !== null && typeof v === "object" && !Array.isArray(v) && !(v instanceof Date)) {
          return JSON.stringify(v);
        }
        return v;
      });
      const r = await local.query(insertSQL, values);
      if (r.rowCount && r.rowCount > 0) ok++;
      else fail++;
    } catch {
      fail++;
    }
  }
  console.log(`${table}: ${ok} copied, ${fail} skipped (of ${rows.length})`);
}

async function main() {
  const local = new Client({ connectionString: LOCAL_DB });
  await local.connect();
  try {
    for (const table of ["document_categories", "document_views"]) {
      await migrateTable(local, table);
    }
  } finally {
    await local.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
