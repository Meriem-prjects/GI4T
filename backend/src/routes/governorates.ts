import { z } from "zod";
import { makeCrudRouter } from "../lib/crud.js";

const createSchema = z.object({
  name: z.string().min(1),
  nameAr: z.string().optional().nullable(),
  code: z.string().min(1),
  geojson: z.any(),
  population: z.coerce.number().int().optional().nullable(),
  areaKm2: z.coerce.number().optional().nullable(),
});

export const governoratesRouter = makeCrudRouter({
  model: "governorate",
  createSchema,
  updateSchema: createSchema.partial(),
  listOrderBy: { name: "asc" },
  writeRoles: ["admin", "admin_acces_droits"],
});
