import type { Request } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";

const schema = z.object({ userId: z.string().uuid() });

export async function deleteUser(req: Request) {
  const { userId } = schema.parse(req.body);
  await prisma.user.delete({ where: { id: userId } });
  return { ok: true };
}
