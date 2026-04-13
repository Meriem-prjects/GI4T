// Rewrite Supabase storage URLs in DB to point to local backend.
import { Client } from "pg";
import "dotenv/config";

const SUPABASE_URL = process.env.SUPABASE_URL ?? "https://qpkybrcjcoxhkifnbxei.supabase.co";
const LOCAL_DB = process.env.DATABASE_URL ??
  "postgresql://justclick:justclick_dev@localhost:5437/justclick?schema=public";
const NEW_BASE = process.env.STORAGE_PUBLIC_URL ?? "http://localhost:4000/api/storage";

function quoteIdent(id: string): string {
  return `"${id.replace(/"/g, '""')}"`;
}

async function main() {
  const local = new Client({ connectionString: LOCAL_DB });
  await local.connect();

  const patterns = [
    `${SUPABASE_URL}/storage/v1/object/public/`,
    `${SUPABASE_URL}/storage/v1/object/sign/`,
    `${SUPABASE_URL}/storage/v1/object/`,
  ];

  const targets: Array<[string, string]> = [
    ["documents", "file_url"],
    ["documents", "pdf_url"],
    ["news", "image_url"],
    ["chatbot_training_documents", "file_url"],
    ["photo_albums", "cover_image_url"],
    ["media_items", "thumbnail_url"],
    ["media_items", "video_url"],
  ];

  for (const oldBase of patterns) {
    for (const [table, col] of targets) {
      try {
        const res = await local.query(
          `UPDATE ${quoteIdent(table)}
           SET ${quoteIdent(col)} = REPLACE(${quoteIdent(col)}, $1, $2)
           WHERE ${quoteIdent(col)} LIKE $3`,
          [oldBase, `${NEW_BASE}/`, `%${oldBase}%`],
        );
        if (res.rowCount && res.rowCount > 0) {
          console.log(`  ✓ ${table}.${col}: ${res.rowCount} updated (pattern: ${oldBase})`);
        }
      } catch {
        // table or column may not exist
      }
    }
  }

  // Also rewrite any photo_urls or images arrays that contain supabase URLs
  try {
    const photoAlbumsRes = await local.query(
      `UPDATE photo_albums
       SET photo_urls = ARRAY(
         SELECT REPLACE(REPLACE(REPLACE(u,
           $1, $4),
           $2, $4),
           $3, $4)
         FROM unnest(photo_urls) AS u
       )
       WHERE EXISTS (
         SELECT 1 FROM unnest(photo_urls) AS u
         WHERE u LIKE $5 OR u LIKE $6 OR u LIKE $7
       )`,
      [
        patterns[0]!,
        patterns[1]!,
        patterns[2]!,
        `${NEW_BASE}/`,
        `%${patterns[0]!}%`,
        `%${patterns[1]!}%`,
        `%${patterns[2]!}%`,
      ],
    );
    if (photoAlbumsRes.rowCount && photoAlbumsRes.rowCount > 0) {
      console.log(`  ✓ photo_albums.photo_urls: ${photoAlbumsRes.rowCount} updated`);
    }
  } catch {
    // ignore
  }

  try {
    const eventsRes = await local.query(
      `UPDATE events
       SET images = ARRAY(
         SELECT REPLACE(REPLACE(REPLACE(u,
           $1, $4),
           $2, $4),
           $3, $4)
         FROM unnest(images) AS u
       )
       WHERE EXISTS (
         SELECT 1 FROM unnest(images) AS u
         WHERE u LIKE $5 OR u LIKE $6 OR u LIKE $7
       )`,
      [
        patterns[0]!,
        patterns[1]!,
        patterns[2]!,
        `${NEW_BASE}/`,
        `%${patterns[0]!}%`,
        `%${patterns[1]!}%`,
        `%${patterns[2]!}%`,
      ],
    );
    if (eventsRes.rowCount && eventsRes.rowCount > 0) {
      console.log(`  ✓ events.images: ${eventsRes.rowCount} updated`);
    }
  } catch {
    // ignore
  }

  await local.end();
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
