import type { Request } from "express";
import { prisma } from "../../lib/prisma.js";
import { hashPassword } from "../../lib/password.js";
import { env } from "../../config/env.js";
import { HttpError } from "../../middleware/error.js";

export async function setupInitialAdmin(_req: Request) {
  const hasAnyAdmin = await prisma.userRole.findFirst({ where: { role: "admin" } });
  if (hasAnyAdmin) {
    throw new HttpError(409, "An admin user already exists");
  }

  const passwordHash = await hashPassword(env.SEED_ADMIN_PASSWORD);
  const user = await prisma.$transaction(async (tx) => {
    const u = await tx.user.create({
      data: { email: env.SEED_ADMIN_EMAIL, passwordHash },
    });
    await tx.profile.create({
      data: { userId: u.id, email: env.SEED_ADMIN_EMAIL, firstName: "Super", lastName: "Admin" },
    });
    await tx.userRole.create({ data: { userId: u.id, role: "admin" } });
    return u;
  });

  return {
    email: user.email,
    password: env.SEED_ADMIN_PASSWORD,
    message: "Initial admin created. Change password immediately.",
  };
}
