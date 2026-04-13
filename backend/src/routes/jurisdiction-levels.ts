import { z } from "zod";
import { makeCrudRouter } from "../lib/crud.js";

const createSchema = z.object({
  name: z.string().min(1),
  nameAr: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  descriptionAr: z.string().optional().nullable(),
  levelOrder: z.coerce.number().int().default(1),
});

export const jurisdictionLevelsRouter = makeCrudRouter({
  model: "jurisdictionLevel",
  createSchema,
  updateSchema: createSchema.partial(),
  listOrderBy: { levelOrder: "asc" },
  writeRoles: ["admin", "admin_observatoire"],
});
