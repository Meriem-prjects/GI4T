import { z } from "zod";
import { makeCrudRouter } from "../lib/crud.js";

const createSchema = z.object({
  name: z.string().min(1),
  nameAr: z.string(),
  address: z.string().min(1),
  addressAr: z.string(),
  phone: z.string(),
  email: z.string().email().optional().nullable(),
  category: z.string().default("Chambre des Avocats"),
  categoryAr: z.string().default("الدائرة الإبتدائية"),
  governorateId: z.string().uuid().optional().nullable(),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),
  hours: z.string().optional().nullable(),
  hoursAr: z.string().optional().nullable(),
  isPublished: z.boolean().default(true),
});

export const usefulAddressesRouter = makeCrudRouter({
  model: "usefulAddress",
  createSchema,
  updateSchema: createSchema.partial(),
  listOrderBy: { name: "asc" },
  writeRoles: ["admin", "admin_acces_droits"],
});
