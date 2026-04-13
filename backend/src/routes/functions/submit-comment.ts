import type { Request } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";

const schema = z.object({
  documentId: z.string().uuid(),
  parentCommentId: z.string().uuid().optional().nullable(),
  authorName: z.string().min(1),
  authorEmail: z.string().email(),
  content: z.string().min(1),
});

export async function submitComment(req: Request) {
  const data = schema.parse(req.body);
  const created = await prisma.documentComment.create({
    data: { ...data, status: "pending" },
  });
  return created;
}
