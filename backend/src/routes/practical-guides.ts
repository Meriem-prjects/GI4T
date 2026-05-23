import { z } from "zod";
import { makeCrudRouter } from "../lib/crud.js";

const createSchema = z.object({
  title: z.string().min(1),
  titleAr: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  descriptionAr: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  contentAr: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  categoryAr: z.string().optional().nullable(),
  coverImageUrl: z.string().optional().nullable(),
  estimatedTime: z.string().optional().nullable(),
  difficulty: z.string().optional().nullable(),
  views: z.number().int().optional(),
  displayOrder: z.number().int().optional(),
  isPublished: z.boolean().optional(),
});

export const practicalGuidesRouter = makeCrudRouter({
  model: "practicalGuide",
  createSchema,
  updateSchema: createSchema.partial(),
  listOrderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
  writeRoles: ["admin", "admin_acces_droits"],
});
