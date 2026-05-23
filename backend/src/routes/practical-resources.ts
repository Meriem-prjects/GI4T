import { z } from "zod";
import { makeCrudRouter } from "../lib/crud.js";

const createSchema = z.object({
  title: z.string().min(1),
  titleAr: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  descriptionAr: z.string().optional().nullable(),
  fileUrl: z.string().url().optional().nullable(),
  fileSize: z.number().int().optional().nullable(),
  fileType: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  categoryAr: z.string().optional().nullable(),
  downloads: z.number().int().optional(),
  displayOrder: z.number().int().optional(),
  isPublished: z.boolean().optional(),
});

export const practicalResourcesRouter = makeCrudRouter({
  model: "practicalResource",
  createSchema,
  updateSchema: createSchema.partial(),
  listOrderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
  writeRoles: ["admin", "admin_acces_droits"],
});
