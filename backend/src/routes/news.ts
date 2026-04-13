import { z } from "zod";
import { makeCrudRouter } from "../lib/crud.js";

const createSchema = z.object({
  title: z.string().min(1),
  titleAr: z.string().optional().nullable(),
  excerpt: z.string().min(1),
  excerptAr: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  contentAr: z.string().optional().nullable(),
  category: z.string(),
  tags: z.array(z.string()).optional(),
  tagsAr: z.array(z.string()).optional(),
  imageUrl: z.string().optional().nullable(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  readTime: z.coerce.number().int().optional().nullable(),
});

export const newsRouter = makeCrudRouter({
  model: "news",
  createSchema,
  updateSchema: createSchema.partial(),
  listOrderBy: { createdAt: "desc" },
  writeRoles: ["admin", "admin_acces_droits"],
});
