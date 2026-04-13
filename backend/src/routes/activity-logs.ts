import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/error.js";

export const activityLogsRouter = Router();

activityLogsRouter.get(
  "/",
  requireAuth,
  requireRole("admin", "admin_observatoire", "admin_acces_droits"),
  asyncHandler(async (req, res) => {
    const entityType = req.query.entity_type as string | undefined;
    const entityId = req.query.entity_id as string | undefined;
    const limit = Math.min(Number(req.query.limit ?? 100), 500);

    const items = await prisma.activityLog.findMany({
      where: {
        ...(entityType ? { entityType } : {}),
        ...(entityId ? { entityId } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    res.json({ items });
  }),
);

const createSchema = z.object({
  entityType: z.string(),
  entityId: z.string().uuid(),
  action: z.string(),
  details: z.any().optional(),
});

activityLogsRouter.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const data = createSchema.parse(req.body);
    const created = await prisma.activityLog.create({
      data: { ...data, userId: req.user!.userId },
    });
    res.status(201).json(created);
  }),
);
