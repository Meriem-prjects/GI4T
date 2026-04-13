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
});

export const photoAlbumsRouter = makeCrudRouter({
  model: "photoAlbum",
  createSchema,
  updateSchema: createSchema.partial(),
  listOrderBy: { createdAt: "desc" },
  writeRoles: ["admin", "admin_acces_droits"],
});
