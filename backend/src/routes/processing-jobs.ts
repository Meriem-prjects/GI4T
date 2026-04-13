import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler, HttpError } from "../middleware/error.js";

export const processingJobsRouter = Router();

processingJobsRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const status = req.query.status as string | undefined;
    const items = await prisma.processingJob.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    res.json({ items });
  }),
);

processingJobsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const item = await prisma.processingJob.findUnique({ where: { id: req.params.id } });
    if (!item) throw new HttpError(404, "Not found");
    res.json(item);
  }),
);
