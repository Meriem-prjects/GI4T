import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../middleware/error.js";

export const statisticsRouter = Router();

statisticsRouter.get(
  "/global",
  asyncHandler(async (req, res) => {
    const periodDays = Number(req.query.period_days ?? 30);
    const since = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

    const [totalViews, totalReadsAgg, totalComments, pendingComments, uniqueSessions] =
      await Promise.all([
        prisma.documentView.count({ where: { viewedAt: { gte: since } } }),
        prisma.documentView.aggregate({
          where: { viewedAt: { gte: since }, readDuration: { gt: 0 } },
          _avg: { readDuration: true },
          _count: { readDuration: true },
        }),
        prisma.documentComment.count({ where: { createdAt: { gte: since } } }),
        prisma.documentComment.count({ where: { status: "pending" } }),
        prisma.documentView
          .findMany({
            where: { viewedAt: { gte: since } },
            distinct: ["sessionId"],
            select: { sessionId: true },
          })
          .then((r) => r.length),
      ]);

    res.json({
      total_views: totalViews,
      total_reads: totalReadsAgg._count.readDuration,
      avg_read_duration: totalReadsAgg._avg.readDuration ?? 0,
      total_comments: totalComments,
      pending_comments: pendingComments,
      unique_sessions: uniqueSessions,
    });
  }),
);

statisticsRouter.get(
  "/documents/:id",
  asyncHandler(async (req, res) => {
    const documentId = req.params.id;
    const [views, avgDuration, comments, pending] = await Promise.all([
      prisma.documentView.count({ where: { documentId } }),
      prisma.documentView.aggregate({
        where: { documentId },
        _avg: { readDuration: true },
      }),
      prisma.documentComment.count({ where: { documentId } }),
      prisma.documentComment.count({ where: { documentId, status: "pending" } }),
    ]);
    res.json({
      document_id: documentId,
      total_views: views,
      avg_read_duration: avgDuration._avg.readDuration ?? 0,
      total_comments: comments,
      pending_comments: pending,
    });
  }),
);

statisticsRouter.get(
  "/pdfa",
  asyncHandler(async (_req, res) => {
    const [total, compliant] = await Promise.all([
      prisma.document.count(),
      prisma.document.count({ where: { pdfaCompliance: true } }),
    ]);
    res.json({
      total_documents: total,
      pdfa_documents: compliant,
      pdfa_percentage: total === 0 ? 0 : (compliant / total) * 100,
    });
  }),
);
