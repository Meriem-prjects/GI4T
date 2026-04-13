import { z } from "zod";
import { makeCrudRouter } from "../lib/crud.js";

const createSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(1),
  nameNative: z.string().min(1),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const languagesRouter = makeCrudRouter({
  model: "language",
  createSchema,
  updateSchema: createSchema.partial(),
  listOrderBy: { code: "asc" },
  writeRoles: ["admin"],
});
