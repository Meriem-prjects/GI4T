import type { Request } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { hashPassword } from "../../lib/password.js";
import { HttpError } from "../../middleware/error.js";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  sections: z.array(z.string()).default([]),
});

export async function createAccesDroitsAdmin(req: Request) {
  const body = schema.parse(req.body);
  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) throw new HttpError(409, "Email already in use");

  const passwordHash = await hashPassword(body.password);
  const user = await prisma.$transaction(async (tx) => {
    const u = await tx.user.create({ data: { email: body.email, passwordHash } });
    await tx.profile.create({
      data: { userId: u.id, email: body.email, firstName: body.firstName, lastName: body.lastName },
    });
    await tx.userRole.create({ data: { userId: u.id, role: "admin_acces_droits" } });
    for (const section of body.sections) {
      await tx.accesDroitsPermission.create({ data: { userId: u.id, section } });
    }
    return u;
  });
  return { id: user.id, email: user.email };
}
