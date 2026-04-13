import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@justclic.tn";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "changeme-immediately";
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 12);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`User ${email} already exists, skipping seed.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, saltRounds);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      profile: { create: { email, firstName: "Super", lastName: "Admin" } },
      roles: { create: [{ role: "admin" }] },
    },
  });

  console.log(`Created admin user: ${user.email}`);
  console.log(`Password: ${password}`);
  console.log("Change this password immediately.");

  // Seed a few reference rows if empty
  const langCount = await prisma.language.count();
  if (langCount === 0) {
    await prisma.language.createMany({
      data: [
        { code: "fr", name: "French", nameNative: "Français", isDefault: true, isActive: true },
        { code: "ar", name: "Arabic", nameNative: "العربية", isActive: true },
        { code: "en", name: "English", nameNative: "English", isActive: true },
      ],
    });
  }

  const courtCount = await prisma.courtType.count();
  if (courtCount === 0) {
    await prisma.courtType.createMany({
      data: [
        { name: "Civil", nameAr: "مدني" },
        { name: "Administratif", nameAr: "إداري" },
      ],
    });
  }

  const jurCount = await prisma.jurisdictionLevel.count();
  if (jurCount === 0) {
    await prisma.jurisdictionLevel.createMany({
      data: [
        { name: "Tribunal de première instance", nameAr: "المحكمة الابتدائية", levelOrder: 1 },
        { name: "Cour d'appel", nameAr: "محكمة الاستئناف", levelOrder: 2 },
        { name: "Cour de cassation", nameAr: "محكمة التعقيب", levelOrder: 3 },
      ],
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
