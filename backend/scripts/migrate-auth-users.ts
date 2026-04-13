// Pulls users from Supabase auth.users and recreates them in public.users,
// preserving the original UUIDs so all foreign keys remain valid.
//
// Usage: tsx scripts/migrate-auth-users.ts <supabase-url> <service-role-key>

import { prisma } from "../src/lib/prisma.js";

interface SupabaseAuthUser {
  id: string;
  email: string;
  encrypted_password?: string;
  created_at: string;
}

async function main() {
  const [supabaseUrl, serviceKey] = process.argv.slice(2);
  if (!supabaseUrl || !serviceKey) {
    console.error("Usage: tsx scripts/migrate-auth-users.ts <url> <service-role-key>");
    process.exit(1);
  }

  const res = await fetch(`${supabaseUrl}/auth/v1/admin/users?page=1&per_page=1000`, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
  });
  if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);

  const { users } = (await res.json()) as { users: SupabaseAuthUser[] };
  console.log(`Fetched ${users.length} users from Supabase`);

  let created = 0;
  let skipped = 0;
  for (const u of users) {
    if (!u.email) {
      skipped++;
      continue;
    }
    const existing = await prisma.user.findUnique({ where: { id: u.id } });
    if (existing) {
      skipped++;
      continue;
    }
    await prisma.user.create({
      data: {
        id: u.id,
        email: u.email,
        passwordHash: u.encrypted_password ?? "",
        createdAt: new Date(u.created_at),
      },
    });
    created++;
  }

  console.log(`Imported users — created: ${created}, skipped: ${skipped}`);
  console.log(
    "NOTE: Supabase and local bcrypt hashes may differ. Users may need to reset their passwords.",
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
