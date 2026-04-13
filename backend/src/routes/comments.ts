import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler, HttpError } from "../middleware/error.js";

export const commentsRouter = Router();

const createSchema = z.object({
  documentId: z.string().uuid(),
  parentCommentId: z.string().uuid().optional().nullable(),
  authorName: z.string().min(1),
  authorEmail: z.string().email(),
  content: z.string().min(1),
});

commentsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const documentId = req.query.document_id as string | undefined;
    const status = (req.query.status as string | undefined) ?? "approved";
    const items = await prisma.documentComment.findMany({
      where: {
        documentId,
        status,
      },
      include: { replies: true },
      orderBy: { createdAt: "asc" },
    });
    res.json({ items });
  }),
);

commentsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = createSchema.parse(req.body);
    const created = await prisma.documentComment.create({
      data: { ...data, status: "pending" },
    });
    res.status(201).json(created);
  }),
);

commentsRouter.patch(
  "/:id",
  requireAuth,
  requireRole("admin", "admin_observatoire"),
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        status: z.enum(["pending", "approved", "rejected", "spam"]).optional(),
        content: z.string().optional(),
        isAdminReply: z.boolean().optional(),
      })
      .parse(req.body);
    const updated = await prisma.documentComment.update({
      where: { id: req.params.id },
      data: body,
    });
    res.json(updated);
  }),
);

commentsRouter.delete(
  "/:id",
  requireAuth,
  requireRole("admin", "admin_observatoire"),
  asyncHandler(async (req, res) => {
    await prisma.documentComment.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  }),
);

commentsRouter.get(
  "/moderation",
  requireAuth,
  requireRole("admin", "admin_observatoire"),
  asyncHandler(async (_req, res) => {
    const items = await prisma.documentComment.findMany({
      where: { status: "pending" },
      include: { document: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ items });
  }),
);

// Just export HttpError to keep import clean
void HttpError;
