import { z } from "zod";
import { makeCrudRouter } from "../lib/crud.js";

const createSchema = z.object({
  name: z.string().min(1),
  nameAr: z.string().optional().nullable(),
  parentId: z.string().uuid().optional().nullable(),
  description: z.string().optional().nullable(),
  descriptionAr: z.string().optional().nullable(),
  color: z.string().optional(),
});

export const categoriesRouter = makeCrudRouter({
  model: "category",
  createSchema,
  updateSchema: createSchema.partial(),
  listOrderBy: { name: "asc" },
  writeRoles: ["admin", "admin_observatoire"],
});
