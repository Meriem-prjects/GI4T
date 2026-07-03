import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { optionalAuth, requireAuth, hasObservatoireRole } from "../middleware/auth.js";
import { asyncHandler, HttpError } from "../middleware/error.js";
import { snakeToCamel, transformKeysToCamel } from "../lib/case-transform.js";

export const documentsRouter = Router();

const listQuerySchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  published: z.string().optional(),
  category_id: z.string().uuid().optional(),
  document_type_id: z.string().uuid().optional(),
  language: z.string().optional(),
  limit: z.coerce.number().min(1).max(200).default(50),
  offset: z.coerce.number().min(0).default(0),
  order_by: z.string().default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
}).passthrough();

// Supabase-shim frontend sends nested relation filters like
// `document_categories.category_id=<uuid>`. Express's qs parser turns
// that into `req.query.document_categories = { category_id: "<uuid>" }`.
// Translate to Prisma's junction-table filter.
function extractDocumentCategoryId(query: Record<string, unknown>): string | undefined {
  const dc = query["document_categories"];
  if (dc && typeof dc === "object" && !Array.isArray(dc)) {
    const cid = (dc as Record<string, unknown>)["category_id"];
    if (typeof cid === "string" && cid.length > 0) return cid;
  }
  return undefined;
}

documentsRouter.get(
  "/",
  optionalAuth,
  asyncHandler(async (req, res) => {
    console.log("[documents] req.query =", JSON.stringify(req.query).slice(0, 500));
    const q = listQuerySchema.parse(req.query);
    const where: Record<string, unknown> = {};

    if (q.status) where.status = q.status;
    if (q.published !== undefined) where.published = q.published === "true";
    if (q.category_id) where.categoryId = q.category_id;
    if (q.document_type_id) where.documentTypeId = q.document_type_id;
    if (q.language) where.language = q.language;
    if (q.search) {
      where.OR = [
        { title: { contains: q.search, mode: "insensitive" } },
        { titleAr: { contains: q.search, mode: "insensitive" } },
        { content: { contains: q.search, mode: "insensitive" } },
      ];
    }

    const nestedCategoryId = extractDocumentCategoryId(req.query as Record<string, unknown>);
    if (nestedCategoryId) {
      where.documentCategories = { some: { categoryId: nestedCategoryId } };
    }

    // Public access only sees published documents. Admins see everything.
    if (!hasObservatoireRole(req) && q.published === undefined) {
      where.published = true;
    }

    const orderByField = snakeToCamel(q.order_by);

    const [items, total] = await Promise.all([
      prisma.document.findMany({
        where,
        include: {
          category: true,
          documentTypeRel: true,
          documentCategories: { include: { category: true } },
        },
        orderBy: { [orderByField]: q.order },
        take: q.limit,
        skip: q.offset,
      }),
      prisma.document.count({ where }),
    ]);

    res.json({ items, total, limit: q.limit, offset: q.offset });
  }),
);

documentsRouter.get(
  "/:id",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const doc = await prisma.document.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        documentTypeRel: true,
        documentCategories: { include: { category: true } },
      },
    });
    if (!doc) throw new HttpError(404, "Document not found");
    if (!doc.published && !hasObservatoireRole(req)) {
      throw new HttpError(404, "Document not found");
    }
    res.json(doc);
  }),
);

const upsertSchema = z.object({
  title: z.string().min(1),
  titleAr: z.string().optional().nullable(),
  content: z.string(),
  summary: z.string().optional().nullable(),
  summaryAr: z.string().optional().nullable(),
  originalFilename: z.string(),
  fileUrl: z.string().optional().nullable(),
  pdfUrl: z.string().optional().nullable(),
  language: z.string().optional(),
  categoryId: z.string().uuid().optional().nullable(),
  documentTypeId: z.string().uuid().optional().nullable(),
  keywords: z.array(z.string()).optional(),
  keywordsAr: z.array(z.string()).optional(),
  status: z.string().optional(),
  published: z.boolean().optional(),
}).passthrough();

documentsRouter.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const data = upsertSchema.parse(req.body);
    const doc = await prisma.document.create({
      data: {
        ...data,
        userId: req.user!.userId,
      } as never,
    });
    res.status(201).json(doc);
  }),
);

documentsRouter.patch(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!hasObservatoireRole(req)) {
      const existing = await prisma.document.findUnique({ where: { id: req.params.id } });
      if (!existing || existing.userId !== req.user!.userId) {
        throw new HttpError(403, "Forbidden");
      }
    }
    // Frontend may send snake_case keys (Supabase legacy). Normalize
    // to camelCase before passing to Prisma.
    const camelBody = transformKeysToCamel(req.body as Record<string, unknown>);
    const data = upsertSchema.partial().parse(camelBody);
    const doc = await prisma.document.update({
      where: { id: req.params.id },
      data: data as never,
    });
    res.json(doc);
  }),
);

documentsRouter.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!hasObservatoireRole(req)) {
      const existing = await prisma.document.findUnique({ where: { id: req.params.id } });
      if (!existing || existing.userId !== req.user!.userId) {
        throw new HttpError(403, "Forbidden");
      }
    }
    await prisma.document.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  }),
);

// Semantic search via pgvector (raw SQL — embedding column is not in Prisma schema)
const semanticSchema = z.object({
  embedding: z.array(z.number()).length(1536),
  threshold: z.number().default(0.7),
  count: z.number().int().min(1).max(100).default(10),
});

documentsRouter.post(
  "/semantic-search",
  asyncHandler(async (req, res) => {
    const { embedding, threshold, count } = semanticSchema.parse(req.body);
    const vectorLiteral = `[${embedding.join(",")}]`;
    const rows = await prisma.$queryRawUnsafe<
      Array<{ id: string; similarity: number }>
    >(
      `SELECT id, 1 - (embedding <=> $1::vector) AS similarity
       FROM documents
       WHERE published = true AND embedding IS NOT NULL
         AND 1 - (embedding <=> $1::vector) >= $2
       ORDER BY embedding <=> $1::vector
       LIMIT $3`,
      vectorLiteral,
      threshold,
      count,
    );
    res.json(rows);
  }),
);
