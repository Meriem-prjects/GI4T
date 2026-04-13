import { z } from "zod";
import { makeCrudRouter } from "../lib/crud.js";

const createSchema = z.object({
  question: z.string().min(1),
  questionAr: z.string().optional().nullable(),
  answer: z.string().min(1),
  answerAr: z.string().optional().nullable(),
  category: z.string(),
  categoryAr: z.string().optional().nullable(),
  displayOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const faqRouter = makeCrudRouter({
  model: "faqItem",
  createSchema,
  updateSchema: createSchema.partial(),
  listOrderBy: { displayOrder: "asc" },
  writeRoles: ["admin", "admin_acces_droits"],
});
