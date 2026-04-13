import { z } from "zod";
import { makeCrudRouter } from "../lib/crud.js";

const createSchema = z.object({
  title: z.string().min(1),
  titleAr: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  descriptionAr: z.string().optional().nullable(),
  type: z.string().default("Vidéo"),
  category: z.string().default("Campagnes terrain"),
  categoryId: z.string().optional().nullable(),
  governorate: z.string().optional().nullable(),
  videoUrl: z.string().optional().nullable(),
  thumbnailUrl: z.string().optional().nullable(),
  duration: z.string().optional().nullable(),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
});

export const mediaItemsRouter = makeCrudRouter({
  model: "mediaItem",
  createSchema,
  updateSchema: createSchema.partial(),
  listOrderBy: { createdAt: "desc" },
  writeRoles: ["admin", "admin_acces_droits"],
});
