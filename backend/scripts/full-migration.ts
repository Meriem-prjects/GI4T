// Full migration from Supabase to local PostgreSQL via the REST API.
// Uses Supabase's PostgREST endpoints (works over HTTPS/IPv4, no direct DB needed).
//
// Usage:
//   SUPABASE_URL=... SUPABASE_SERVICE_KEY=... tsx scripts/full-migration.ts

import { Client } from "pg";
import fs from "node:fs/promises";
import path from "node:path";
import "dotenv/config";

const SUPABASE_URL = process.env.SUPABASE_URL ?? "https://qpkybrcjcoxhkifnbxei.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY ?? "";

const LOCAL_DB = process.env.DATABASE_URL ??
  "postgresql://justclick:justclick_dev@localhost:5437/justclick?schema=public";

const STORAGE_DIR = process.env.STORAGE_DIR ?? path.resolve("storage");
const PAGE_SIZE = 1000;

if (!SUPABASE_KEY) {
  console.error("Missing SUPABASE_SERVICE_KEY");
  process.exit(1);
}

// Tables IN ORDER (respecting FK dependencies)
const MIGRATION_ORDER = [
  "languages",
  "court_types",
  "jurisdiction_levels",
  "document_types",
  "categories",
  "governorates",
  "documents",
  "document_categories",
  "document_comments",
  "document_views",
  "processing_jobs",
  "activity_logs",
  "events",
  "event_registrations",
  "news",
  "faq_items",
  "useful_addresses",
  "chatbot_config",
  "chatbot_training_documents",
  "photo_albums",
  "media_items",
];

async function connectLocal(): Promise<Client> {
  const client = new Client({ connectionString: LOCAL_DB });
  await client.connect();
  return client;
}

function quoteIdent(id: string): string {
  return `"${id.replace(/"/g, '""')}"`;
}

async function fetchRest<T = unknown>(
  pathAndQuery: string,
  headers: Record<string, string> = {},
): Promise<{ data: T; headers: Headers }> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${pathAndQuery}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Accept: "application/json",
      ...headers,
    },
  });
  if (!res.ok) {
    throw new Error(`REST ${pathAndQuery} failed: ${res.status} ${await res.text()}`);
  }
  return { data: (await res.json()) as T, headers: res.headers };
}

async function fetchAllRows(table: string): Promise<Record<string, unknown>[]> {
  const all: Record<string, unknown>[] = [];
  let offset = 0;
  while (true) {
    const { data } = await fetchRest<Record<string, unknown>[]>(
      `${table}?select=*&limit=${PAGE_SIZE}&offset=${offset}`,
    );
    if (data.length === 0) break;
    all.push(...data);
    if (data.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }
  return all;
}

async function getLocalColumns(local: Client, table: string): Promise<Set<string>> {
  const res = await local.query<{ column_name: string }>(
    `SELECT column_name FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1`,
    [table],
  );
  return new Set(res.rows.map((r) => r.column_name));
}

async function migrateUsers(local: Client): Promise<number> {
  console.log("\n=== Migrating users from auth.users admin API ===");
  let page = 1;
  let total = 0;
  while (true) {
    const res = await fetch(
      `${SUPABASE_URL}/auth/v1/admin/users?page=${page}&per_page=1000`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      },
    );
    if (!res.ok) {
      throw new Error(`Fetch users failed: ${res.status} ${await res.text()}`);
    }
    const data = (await res.json()) as {
      users: Array<{
        id: string;
        email?: string;
        encrypted_password?: string;
        created_at: string;
      }>;
    };
    if (!data.users || data.users.length === 0) break;

    for (const u of data.users) {
      if (!u.email) continue;
      try {
        await local.query(
          `INSERT INTO users (id, email, password_hash, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (id) DO NOTHING`,
          [u.id, u.email, u.encrypted_password ?? "", u.created_at, u.created_at],
        );
        total++;
      } catch (err) {
        console.warn(`  ⚠  user ${u.email}:`, (err as Error).message);
      }
    }
    if (data.users.length < 1000) break;
    page++;
  }
  console.log(`  ✓ Imported ${total} users`);
  return total;
}

async function migrateTable(
  local: Client,
  table: string,
): Promise<{ copied: number; skipped: number; total: number }> {
  process.stdout.write(`  ${table.padEnd(32)} `);
  let rows: Record<string, unknown>[];
  try {
    rows = await fetchAllRows(table);
  } catch (err) {
    console.log(`⏭  not in source (${(err as Error).message.slice(0, 60)})`);
    return { copied: 0, skipped: 0, total: 0 };
  }

  if (rows.length === 0) {
    console.log("⏭  empty");
    return { copied: 0, skipped: 0, total: 0 };
  }

  const localCols = await getLocalColumns(local, table);
  if (localCols.size === 0) {
    console.log("⏭  not in destination");
    return { copied: 0, skipped: 0, total: rows.length };
  }

  const srcCols = Object.keys(rows[0]!);
  const commonCols = srcCols.filter((c) => localCols.has(c));
  if (commonCols.length === 0) {
    console.log("⏭  no common columns");
    return { copied: 0, skipped: 0, total: rows.length };
  }

  const insertCols = commonCols.map(quoteIdent).join(", ");
  const placeholders = commonCols.map((_, i) => `$${i + 1}`).join(", ");
  const insertSQL = `INSERT INTO ${quoteIdent(table)} (${insertCols})
    VALUES (${placeholders})
    ON CONFLICT DO NOTHING`;

  let copied = 0;
  let skipped = 0;
  for (const row of rows) {
    try {
      const values = commonCols.map((c) => {
        const v = row[c];
        // JSON columns: PostgREST returns them as JS objects; pg needs JSON strings
        if (v !== null && typeof v === "object" && !Array.isArray(v) && !(v instanceof Date)) {
          return JSON.stringify(v);
        }
        return v;
      });
      const result = await local.query(insertSQL, values);
      if (result.rowCount && result.rowCount > 0) copied++;
      else skipped++;
    } catch (err) {
      skipped++;
      if (skipped <= 2) {
        process.stdout.write(`\n    ⚠  ${(err as Error).message.slice(0, 100)}`);
      }
    }
  }
  console.log(`${copied} copied / ${skipped} skipped / ${rows.length} fetched`);
  return { copied, skipped, total: rows.length };
}

async function listBucket(bucket: string, prefix = ""): Promise<Array<{ name: string; id?: string }>> {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${bucket}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prefix,
      limit: 1000,
      offset: 0,
      sortBy: { column: "name", order: "asc" },
    }),
  });
  if (!res.ok) {
    console.warn(`    ⚠  list ${bucket}/${prefix}: ${res.status}`);
    return [];
  }
  return res.json() as Promise<Array<{ name: string; id?: string }>>;
}

async function listBucketRecursive(bucket: string, prefix = ""): Promise<string[]> {
  const items = await listBucket(bucket, prefix);
  const files: string[] = [];
  for (const item of items) {
    const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
    if (item.id) {
      files.push(fullPath);
    } else {
      const nested = await listBucketRecursive(bucket, fullPath);
      files.push(...nested);
    }
  }
  return files;
}

async function migrateStorage(): Promise<number> {
  console.log("\n=== Migrating storage files ===");
  const buckets = ["documents", "media", "album-photos"];
  let totalDownloaded = 0;
  for (const bucket of buckets) {
    console.log(`\n  --- bucket: ${bucket} ---`);
    const files = await listBucketRecursive(bucket);
    console.log(`    Found ${files.length} files`);
    let downloaded = 0;
    let failed = 0;
    for (const key of files) {
      const destPath = path.resolve(STORAGE_DIR, bucket, key);
      try {
        await fs.mkdir(path.dirname(destPath), { recursive: true });
        const res = await fetch(
          `${SUPABASE_URL}/storage/v1/object/${bucket}/${encodeURI(key)}`,
          {
            headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
          },
        );
        if (!res.ok) {
          failed++;
          continue;
        }
        const buffer = Buffer.from(await res.arrayBuffer());
        await fs.writeFile(destPath, buffer);
        downloaded++;
        if (downloaded % 10 === 0) {
          process.stdout.write(`    ${downloaded}/${files.length}\r`);
        }
      } catch (err) {
        failed++;
        console.warn(`    ⚠  ${key}:`, (err as Error).message);
      }
    }
    console.log(`    ✓ ${bucket}: ${downloaded} downloaded, ${failed} failed`);
    totalDownloaded += downloaded;
  }
  return totalDownloaded;
}

async function rewriteUrls(local: Client): Promise<void> {
  console.log("\n=== Rewriting Supabase URLs in DB ===");
  const newBase = process.env.STORAGE_PUBLIC_URL ?? "http://localhost:4000/api/storage";
  const oldPatterns = [
    `${SUPABASE_URL}/storage/v1/object/public/`,
    `${SUPABASE_URL}/storage/v1/object/sign/`,
    `${SUPABASE_URL}/storage/v1/object/`,
  ];
  const targetColumns: Array<[string, string]> = [
    ["documents", "file_url"],
    ["documents", "pdf_url"],
    ["news", "image_url"],
    ["chatbot_training_documents", "file_url"],
    ["photo_albums", "cover_image_url"],
    ["media_items", "thumbnail_url"],
    ["media_items", "video_url"],
  ];
  for (const oldBase of oldPatterns) {
    for (const [table, col] of targetColumns) {
      try {
        const res = await local.query(
          `UPDATE ${quoteIdent(table)} SET ${quoteIdent(col)} = REPLACE(${quoteIdent(col)}, $1, $2)
           WHERE ${quoteIdent(col)} LIKE $3`,
          [oldBase, `${newBase}/`, `%${oldBase}%`],
        );
        if (res.rowCount && res.rowCount > 0) {
          console.log(`  ✓ ${table}.${col}: ${res.rowCount} updated`);
        }
      } catch {
        // table/column may not exist — ignore
      }
    }
  }
}

async function main() {
  console.log("=== Connecting to local PostgreSQL ===");
  const local = await connectLocal();
  console.log("  ✓ Connected");

  try {
    // session_replication_role requires superuser — skip in production.
    // Triggers will fire but ON CONFLICT DO NOTHING handles idempotency.

    await migrateUsers(local);

    console.log("\n=== Migrating tables (via PostgREST) ===");
    const summary: Array<{ table: string; copied: number; skipped: number; total: number }> = [];
    for (const table of MIGRATION_ORDER) {
      const res = await migrateTable(local, table);
      summary.push({ table, ...res });
    }

    // (session_replication_role reset not needed)

    await migrateStorage();
    await rewriteUrls(local);

    console.log("\n=== SUMMARY ===");
    let totalCopied = 0;
    let totalFetched = 0;
    for (const s of summary) {
      console.log(`  ${s.table.padEnd(32)} ${s.copied} / ${s.total}`);
      totalCopied += s.copied;
      totalFetched += s.total;
    }
    console.log(`\nTotal rows copied: ${totalCopied} (out of ${totalFetched} fetched)`);
    console.log("\n✓ Migration complete.");
  } finally {
    await local.end();
  }
}

main().catch((e) => {
  console.error("\nMigration failed:", e);
  process.exit(1);
});
