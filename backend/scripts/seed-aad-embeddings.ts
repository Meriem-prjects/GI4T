// One-shot seed script: (re)embeds every published row in the five
// Accès-aux-droits tables. Idempotent — running twice is a no-op on the
// second pass. Run once after the migration:
//   cd backend && npx tsx scripts/seed-aad-embeddings.ts

import { refreshAadEmbeddings } from "../src/services/aad-embed.js";

async function main() {
  console.log("[seed] starting AAD embedding pass…");
  const summary = await refreshAadEmbeddings();
  for (const [table, stats] of Object.entries(summary)) {
    console.log(`[seed] ${table}: scanned=${stats.scanned} refreshed=${stats.refreshed}`);
  }
  console.log("[seed] done");
}

main().catch((e) => {
  console.error("[seed] failed:", e);
  process.exit(1);
});
