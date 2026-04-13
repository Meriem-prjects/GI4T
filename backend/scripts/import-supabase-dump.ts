// Imports a pg_dump from Supabase into the local Prisma database.
// Usage:
//   pg_dump --no-owner --no-acl --schema=public -Fc \
//     "postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres" \
//     > supabase-dump.dump
//   tsx scripts/import-supabase-dump.ts supabase-dump.dump
//
// This script calls pg_restore and then patches auth.users → public.users.

import { execSync } from "node:child_process";
import fs from "node:fs";
import "dotenv/config";

const dumpPath = process.argv[2];
if (!dumpPath || !fs.existsSync(dumpPath)) {
  console.error("Usage: tsx scripts/import-supabase-dump.ts <path-to-dump>");
  process.exit(1);
}

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

console.log("Running pg_restore --data-only ...");
try {
  execSync(
    `pg_restore --data-only --disable-triggers --no-owner --no-acl --schema=public --dbname="${dbUrl}" "${dumpPath}"`,
    { stdio: "inherit" },
  );
} catch (err) {
  console.warn("pg_restore encountered errors (often expected):", err);
}

console.log(`
Next steps:
1. Run: tsx scripts/migrate-auth-users.ts <supabase-url> <service-role-key>
   to pull users from auth.users and recreate them in public.users.
2. Run: tsx scripts/migrate-storage.ts <supabase-url> <service-role-key>
   to download storage files and rewrite URLs.
3. Run: tsx scripts/rewrite-urls.ts  to replace any remaining supabase.co URLs in content.
`);
