import { z } from "zod";
import { makeCrudRouter } from "../lib/crud.js";

const createSchema = z.object({
  name: z.string().min(1),
  nameAr: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  descriptionAr: z.string().optional().nullable(),
});

export const courtTypesRouter = makeCrudRouter({
  model: "courtType",
  createSchema,
  updateSchema: createSchema.partial(),
  listOrderBy: { name: "asc" },
  writeRoles: ["admin", "admin_observatoire"],
});
