import { z } from "zod";
import { makeCrudRouter } from "../lib/crud.js";
import { embedOneAadRow } from "../services/aad-embed.js";

const createSchema = z.object({
  title: z.string().min(1),
  titleAr: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  descriptionAr: z.string().optional().nullable(),
  url: z.string().url(),
  category: z.string().optional().nullable(),
  categoryAr: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  displayOrder: z.number().int().optional(),
  isPublished: z.boolean().optional(),
});

export const usefulLinksRouter = makeCrudRouter({
  model: "usefulLink",
  createSchema,
  updateSchema: createSchema.partial(),
  listOrderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
  writeRoles: ["admin", "admin_acces_droits"],
  afterWrite: (row) => embedOneAadRow("useful_links", row as Record<string, unknown>),
});
