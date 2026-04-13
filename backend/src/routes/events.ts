import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler, HttpError } from "../middleware/error.js";

export const eventsRouter = Router();

const createSchema = z.object({
  title: z.string().min(1),
  titleAr: z.string().optional().nullable(),
  description: z.string().min(1),
  descriptionAr: z.string().optional().nullable(),
  type: z.enum(["action_realisee", "evenement_a_venir"]),
  governorateId: z.string().uuid().optional().nullable(),
  eventDate: z.coerce.date(),
  peopleImpacted: z.coerce.number().int().optional().nullable(),
  availablePlaces: z.coerce.number().int().optional().nullable(),
  registrationEnabled: z.boolean().optional(),
  images: z.array(z.string()).optional(),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),
  status: z.string().optional(),
});

eventsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const type = req.query.type as string | undefined;
    const governorateId = req.query.governorate_id as string | undefined;
    const where: Record<string, unknown> = { status: "published" };
    if (type && type !== "all") where.type = type;
    if (governorateId) where.governorateId = governorateId;

    const items = await prisma.event.findMany({
      where,
      include: { governorate: true, _count: { select: { registrations: true } } },
      orderBy: { eventDate: "desc" },
    });
    res.json({ items });
  }),
);

eventsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const item = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: { governorate: true, registrations: true },
    });
    if (!item) throw new HttpError(404, "Not found");
    res.json(item);
  }),
);

eventsRouter.post(
  "/",
  requireAuth,
  requireRole("admin", "admin_acces_droits"),
  asyncHandler(async (req, res) => {
    const data = createSchema.parse(req.body);
    const created = await prisma.event.create({
      data: { ...data, createdBy: req.user!.userId },
    });
    res.status(201).json(created);
  }),
);

eventsRouter.patch(
  "/:id",
  requireAuth,
  requireRole("admin", "admin_acces_droits"),
  asyncHandler(async (req, res) => {
    const data = createSchema.partial().parse(req.body);
    const updated = await prisma.event.update({
      where: { id: req.params.id },
      data,
    });
    res.json(updated);
  }),
);

eventsRouter.delete(
  "/:id",
  requireAuth,
  requireRole("admin", "admin_acces_droits"),
  asyncHandler(async (req, res) => {
    await prisma.event.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  }),
);

// Event registration (public)
const registrationSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
});

eventsRouter.post(
  "/:id/register",
  asyncHandler(async (req, res) => {
    const data = registrationSchema.parse(req.body);
    const event = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!event) throw new HttpError(404, "Event not found");
    if (!event.registrationEnabled) throw new HttpError(403, "Registration disabled");

    const reg = await prisma.eventRegistration.create({
      data: { ...data, eventId: req.params.id },
    });
    res.status(201).json(reg);
  }),
);

eventsRouter.get(
  "/:id/registrations",
  requireAuth,
  requireRole("admin", "admin_acces_droits"),
  asyncHandler(async (req, res) => {
    const items = await prisma.eventRegistration.findMany({
      where: { eventId: req.params.id },
      orderBy: { registeredAt: "desc" },
    });
    res.json({ items });
  }),
);
