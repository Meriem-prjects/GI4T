// Generic CRUD aliases the frontend's supabase-shim queries expect:
//   supabase.from('chatbot_config')               → /api/chatbot_config
//   supabase.from('chatbot_training_documents')   → /api/chatbot_training_documents
//
// The existing /api/chatbot/* router has hand-rolled endpoints used by
// other consumers — keeping these aliases means we don't break those
// callers while the admin pages keep working through the shim.

import { z } from "zod";
import { makeCrudRouter } from "../lib/crud.js";

const configSchema = z.object({
  tone: z.string().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  fontFamily: z.string().optional(),
  systemPrompt: z.string().optional(),
  welcomeMessage: z.string().optional(),
});

export const chatbotConfigRouter = makeCrudRouter({
  model: "chatbotConfig",
  createSchema: configSchema,
  updateSchema: configSchema.partial(),
  listOrderBy: { createdAt: "desc" },
  writeRoles: ["admin", "admin_acces_droits"],
});

const trainingDocSchema = z.object({
  title: z.string().min(1),
  titleAr: z.string().optional().nullable(),
  content: z.string().min(1),
  fileUrl: z.string().optional().nullable(),
  fileName: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export const chatbotTrainingDocumentsRouter = makeCrudRouter({
  model: "chatbotTrainingDocument",
  createSchema: trainingDocSchema,
  updateSchema: trainingDocSchema.partial(),
  listOrderBy: { createdAt: "desc" },
  writeRoles: ["admin", "admin_acces_droits"],
});
