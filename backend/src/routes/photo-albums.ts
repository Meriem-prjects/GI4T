import { z } from "zod";
import { makeCrudRouter } from "../lib/crud.js";

const createSchema = z.object({
  title: z.string().min(1),
  titleAr: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  descriptionAr: z.string().optional().nullable(),
  date: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  locationAr: z.string().optional().nullable(),
  governorate: z.string().optional().nullable(),
  category: z.string().default("Campagnes"),
  coverImageUrl: z.string().optional().nullable(),
  photoUrls: z.array(z.string()).optional(),
  photoCount: z.coerce.number().int().default(0),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  // Optional link back to the event this album documents. The frontend
  // shim ships `event_id`; makeCrudRouter now runs transformKeysToCamel
  // before validating, so it lands here as `eventId`.
  eventId: z.string().uuid().optional().nullable(),
});

export const photoAlbumsRouter = makeCrudRouter({
  model: "photoAlbum",
  createSchema,
  updateSchema: createSchema.partial(),
  listOrderBy: { createdAt: "desc" },
  writeRoles: ["admin", "admin_acces_droits"],
  // Include the linked event so the public AlbumsPhotos page can render
  // "Événement : <title>" without an extra round-trip.
  include: {
    event: {
      select: { id: true, title: true, titleAr: true, eventDate: true },
    },
  },
});
