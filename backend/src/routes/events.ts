import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler, HttpError } from "../middleware/error.js";
import { transformKeysToCamel } from "../lib/case-transform.js";

// Shared include shape: bring the governorate + a compact list of linked
// photo albums (just what the "Voir les photos" CTA needs — id, title,
// cover, count of photos so the number badge is correct).
const EVENT_INCLUDE = {
  governorate: true,
  photoAlbums: {
    where: { published: true },
    select: {
      id: true,
      title: true,
      titleAr: true,
      coverImageUrl: true,
      photoUrls: true,
    },
  },
} as const;

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
      include: {
        ...EVENT_INCLUDE,
        _count: { select: { registrations: true } },
      },
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
      include: { ...EVENT_INCLUDE, registrations: true },
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
    // The frontend shim serialises the payload snake_case; Zod + Prisma
    // both speak camelCase, so normalise up front. Without this, fields
    // like title_ar / event_date / governorate_id / people_impacted /
    // available_places / registration_enabled were silently dropped.
    const camelBody = transformKeysToCamel(req.body as Record<string, unknown>);
    console.log("[events:POST] body:", JSON.stringify(camelBody).slice(0, 800));
    const parseResult = createSchema.safeParse(camelBody);
    if (!parseResult.success) {
      console.log("[events:POST] zod errors:", JSON.stringify(parseResult.error.flatten()));
      throw parseResult.error;
    }
    const data = parseResult.data;
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
    const camelBody = transformKeysToCamel(req.body as Record<string, unknown>);
    const data = createSchema.partial().parse(camelBody);
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
