import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler, HttpError } from "../middleware/error.js";
import { embedOneAadRow } from "../services/aad-embed.js";

// Fire-and-forget so a slow embedding call never blocks the admin
// write. If it fails the row simply keeps its previous vector until the
// next batch pass sweeps it up.
function eagerEmbed(row: unknown) {
  void Promise.resolve()
    .then(() => embedOneAadRow("chatbot_training_documents", row as Record<string, unknown>))
    .catch((e) => console.warn("[chatbot] eager embed failed:", e));
}

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

// Individual GET — used by the chat popup to preview a training Q/R
// when the citizen clicks a "Q/R officielle" source card.
chatbotRouter.get(
  "/training-documents/:id",
  asyncHandler(async (req, res) => {
    const item = await prisma.chatbotTrainingDocument.findUnique({
      where: { id: req.params.id },
    });
    if (!item) throw new HttpError(404, "Training document not found");
    res.json(item);
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
    eagerEmbed(created);
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
    eagerEmbed(updated);
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
