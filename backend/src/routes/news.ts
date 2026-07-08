import { z } from "zod";
import { makeCrudRouter } from "../lib/crud.js";
import { embedOneAadRow } from "../services/aad-embed.js";

const createSchema = z.object({
  title: z.string().min(1),
  titleAr: z.string().optional().nullable(),
  excerpt: z.string().min(1),
  excerptAr: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  contentAr: z.string().optional().nullable(),
  category: z.string(),
  tags: z.array(z.string()).optional(),
  tagsAr: z.array(z.string()).optional(),
  imageUrl: z.string().optional().nullable(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  readTime: z.coerce.number().int().optional().nullable(),
  // Each admin section owns its own actualités stream. The frontend
  // sets this when creating a news item; the list endpoint filters by
  // section so each space sees only its own.
  section: z.enum(["observatoire", "acces_droits"]).optional(),
});

export const newsRouter = makeCrudRouter({
  model: "news",
  createSchema,
  updateSchema: createSchema.partial(),
  listOrderBy: { createdAt: "desc" },
  // Generic CRUD already forwards `?<col>=<value>` query params to the
  // Prisma where clause, so `?section=observatoire` Just Works™.
  writeRoles: ["admin", "admin_acces_droits", "admin_observatoire"],
  afterWrite: (row) => embedOneAadRow("news", row as Record<string, unknown>),
});
