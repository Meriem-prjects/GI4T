import type { Request } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";

const schema = z.object({
  userId: z.string().uuid(),
  roles: z.array(z.string()),
  sections: z.array(z.string()).optional(),
});

export async function updateUserRoles(req: Request) {
  const { userId, roles, sections } = schema.parse(req.body);
  await prisma.$transaction(async (tx) => {
    await tx.userRole.deleteMany({ where: { userId } });
    if (roles.length > 0) {
      await tx.userRole.createMany({
        data: roles.map((r) => ({ userId, role: r as never })),
        skipDuplicates: true,
      });
    }
    if (sections !== undefined) {
      await tx.accesDroitsPermission.deleteMany({ where: { userId } });
      if (sections.length > 0) {
        await tx.accesDroitsPermission.createMany({
          data: sections.map((section) => ({ userId, section })),
          skipDuplicates: true,
        });
      }
    }
  });
  return { ok: true };
}
