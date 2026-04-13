import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler, HttpError } from "../middleware/error.js";

export const chatbotRouter = Router();

chatbotRouter.get(
  "/config",
  asyncHandler(async (_req, res) => {
    const config = await prisma.chatbotConfig.findFirst();
    res.json(config);
  }),
);

const configSchema = z.object({
  tone: z.string().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  fontFamily: z.string().optional(),
  systemPrompt: z.string().optional(),
  welcomeMessage: z.string().optional(),
});

chatbotRouter.put(
  "/config",
  requireAuth,
  requireRole("admin", "admin_acces_droits"),
  asyncHandler(async (req, res) => {
    const data = configSchema.parse(req.body);
    const existing = await prisma.chatbotConfig.findFirst();
    if (existing) {
      const updated = await prisma.chatbotConfig.update({
        where: { id: existing.id },
        data,
      });
      res.json(updated);
      return;
    }
    const created = await prisma.chatbotConfig.create({
      data: {
        tone: data.tone ?? "professionnel",
        primaryColor: data.primaryColor ?? "#3B82F6",
        secondaryColor: data.secondaryColor ?? "#10B981",
        fontFamily: data.fontFamily ?? "Inter, sans-serif",
        systemPrompt: data.systemPrompt ?? "",
        welcomeMessage: data.welcomeMessage ?? "",
      },
    });
    res.status(201).json(created);
  }),
);

chatbotRouter.get(
  "/training-documents",
  asyncHandler(async (_req, res) => {
    const items = await prisma.chatbotTrainingDocument.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ items });
  }),
);

const trainingSchema = z.object({
  title: z.string().min(1),
  titleAr: z.string().optional().nullable(),
  content: z.string().min(1),
  fileUrl: z.string().optional().nullable(),
  fileName: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

chatbotRouter.post(
  "/training-documents",
  requireAuth,
  requireRole("admin", "admin_acces_droits"),
  asyncHandler(async (req, res) => {
    const data = trainingSchema.parse(req.body);
    const created = await prisma.chatbotTrainingDocument.create({ data });
    res.status(201).json(created);
  }),
);

chatbotRouter.patch(
  "/training-documents/:id",
  requireAuth,
  requireRole("admin", "admin_acces_droits"),
  asyncHandler(async (req, res) => {
    const data = trainingSchema.partial().parse(req.body);
    const updated = await prisma.chatbotTrainingDocument.update({
      where: { id: req.params.id },
      data,
    });
    res.json(updated);
  }),
);

chatbotRouter.delete(
  "/training-documents/:id",
  requireAuth,
  requireRole("admin", "admin_acces_droits"),
  asyncHandler(async (req, res) => {
    await prisma.chatbotTrainingDocument.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  }),
);

void HttpError;
