import { Router, type Request } from "express";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { optionalAuth, requireAuth, hasObservatoireRole } from "../middleware/auth.js";
import { asyncHandler, HttpError } from "../middleware/error.js";
import { snakeToCamel, transformKeysToCamel } from "../lib/case-transform.js";
import { removeOdfDir } from "../lib/storage.js";

export const documentsRouter = Router();

const listQuerySchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  published: z.string().optional(),
  category_id: z.string().uuid().optional(),
  // Droit fondamental parmi tous ceux du document (table document_categories)
  category_any: z.string().uuid().optional(),
  document_type_id: z.string().uuid().optional(),
  document_type_ids: z.string().optional(),
  id_in: z.string().optional(),
  import_key: z.string().optional(),
  import_key_in: z.string().optional(),
  imported: z.enum(["true", "false"]).optional(),
  language: z.string().optional(),
  year: z.coerce.number().int().optional(),
  year_gte: z.coerce.number().int().optional(),
  year_lte: z.coerce.number().int().optional(),
  // card : listes (sans le texte intégral) ; sync : script d'import
  fields: z.enum(["card", "sync"]).optional(),
  sort: z.enum(["recent", "oldest", "number", "title", "year_desc", "year_asc"]).optional(),
  limit: z.coerce.number().min(1).max(1000).default(50),
  offset: z.coerce.number().min(0).default(0),
  order_by: z.string().default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
}).passthrough();

type ListQuery = z.infer<typeof listQuerySchema>;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function csv(v?: string): string[] {
  return v ? v.split(",").map((x) => x.trim()).filter(Boolean) : [];
}

function uuids(v?: string): string[] {
  const ids = csv(v);
  if (ids.some((id) => !UUID_RE.test(id))) throw new HttpError(400, "Invalid id list");
  return ids;
}

const CATEGORY_SELECT = { id: true, name: true, nameAr: true, color: true } as const;

const CARD_SELECT = {
  id: true,
  title: true,
  titleAr: true,
  subtitle: true,
  subtitleAr: true,
  summary: true,
  summaryAr: true,
  author: true,
  authorAr: true,
  keywords: true,
  keywordsAr: true,
  language: true,
  year: true,
  validationDate: true,
  caseNumber: true,
  court: true,
  courtAr: true,
  courtLevel: true,
  courtLevelAr: true,
  categoryId: true,
  documentTypeId: true,
  book: true,
  status: true,
  published: true,
  importKey: true,
  sortOrder: true,
  pdfUrl: true,
  pageCount: true,
  originalFilename: true,
  createdAt: true,
  updatedAt: true,
  category: { select: CATEGORY_SELECT },
  documentTypeRel: { select: { id: true, name: true, nameAr: true } },
  documentCategories: { select: { id: true, categoryId: true, category: { select: CATEGORY_SELECT } } },
} satisfies Prisma.DocumentSelect;

const SYNC_SELECT = {
  id: true,
  importKey: true,
  book: true,
  published: true,
  status: true,
  documentTypeId: true,
  categoryId: true,
  documentCategories: { select: { id: true, categoryId: true } },
} satisfies Prisma.DocumentSelect;

const LAST = { id: "asc" } as const;
const SORTS: Record<NonNullable<ListQuery["sort"]>, Prisma.DocumentOrderByWithRelationInput[]> = {
  recent: [
    { validationDate: { sort: "desc", nulls: "last" } },
    { year: { sort: "desc", nulls: "last" } },
    { createdAt: "desc" },
    LAST,
  ],
  oldest: [
    { validationDate: { sort: "asc", nulls: "last" } },
    { year: { sort: "asc", nulls: "last" } },
    { createdAt: "asc" },
    LAST,
  ],
  year_desc: [{ year: { sort: "desc", nulls: "last" } }, { sortOrder: { sort: "asc", nulls: "last" } }, { title: "asc" }, LAST],
  year_asc: [{ year: { sort: "asc", nulls: "last" } }, { sortOrder: { sort: "asc", nulls: "last" } }, { title: "asc" }, LAST],
  number: [{ sortOrder: { sort: "asc", nulls: "last" } }, { title: "asc" }, LAST],
  title: [{ title: "asc" }, LAST],
};

type Facet = "type" | "category" | "year";

// Filtres communs à la liste et aux compteurs ; chaque compteur ignore son
// propre filtre (le nombre de fiches par année tient compte du droit choisi,
// mais pas de l'année choisie).
function buildDocumentWhere(q: ListQuery, req: Request, skip?: Facet): Prisma.DocumentWhereInput {
  const where: Prisma.DocumentWhereInput = {};
  const and: Prisma.DocumentWhereInput[] = [];

  if (q.status) where.status = q.status;
  if (q.published !== undefined) where.published = q.published === "true";
  if (q.language) where.language = q.language;
  if (skip !== "category" && q.category_id) where.categoryId = q.category_id;
  if (skip !== "type") {
    if (q.document_type_id) where.documentTypeId = q.document_type_id;
    const typeIds = uuids(q.document_type_ids);
    if (typeIds.length) where.documentTypeId = { in: typeIds };
  }
  const ids = uuids(q.id_in);
  if (ids.length) where.id = { in: ids };
  if (q.import_key) where.importKey = q.import_key;
  const keys = csv(q.import_key_in);
  if (keys.length) where.importKey = { in: keys };
  if (q.imported === "true") and.push({ importKey: { not: null } });
  if (q.imported === "false") and.push({ importKey: null });
  if (skip !== "year") {
    if (q.year !== undefined) where.year = q.year;
    else if (q.year_gte !== undefined || q.year_lte !== undefined) {
      where.year = { gte: q.year_gte, lte: q.year_lte };
    }
  }
  const s = q.search?.trim();
  if (s) {
    const like = { contains: s, mode: "insensitive" as const };
    where.OR = [
      { title: like },
      { titleAr: like },
      { subtitle: like },
      { subtitleAr: like },
      { summary: like },
      { summaryAr: like },
      { author: like },
      { authorAr: like },
      { caseNumber: like },
      { content: like },
      { translatedContent: like },
    ];
  }
  const anyCategory = q.category_any ?? extractDocumentCategoryId(req.query as Record<string, unknown>);
  if (skip !== "category" && anyCategory) {
    where.documentCategories = { some: { categoryId: anyCategory } };
  }
  // Le public ne voit que les documents publiés, quels que soient les paramètres.
  if (!hasObservatoireRole(req)) where.published = true;
  if (and.length) where.AND = and;
  return where;
}

// Supabase-shim frontend sends nested relation filters like
// `document_categories.category_id=<uuid>`. Express's default qs parser
// keeps the dot as a literal key ({ "document_categories.category_id": v })
// unless `allowDots` is enabled — read it that way.
function extractDocumentCategoryId(query: Record<string, unknown>): string | undefined {
  const v = query["document_categories.category_id"];
  if (typeof v === "string" && v.length > 0) return v;
  return undefined;
}

documentsRouter.get(
  "/",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const q = listQuerySchema.parse(req.query);
    const where = buildDocumentWhere(q, req);
    const orderBy = q.sort ? SORTS[q.sort] : { [snakeToCamel(q.order_by)]: q.order };
    const page = { where, orderBy, take: q.limit, skip: q.offset };

    const [items, total] = await Promise.all([
      q.fields === "card"
        ? prisma.document.findMany({ ...page, select: CARD_SELECT })
        : q.fields === "sync"
          ? prisma.document.findMany({ ...page, select: SYNC_SELECT })
          : prisma.document.findMany({
              ...page,
              include: {
                category: true,
                documentTypeRel: true,
                documentCategories: { include: { category: true } },
              },
            }),
      prisma.document.count({ where }),
    ]);

    res.json({ items, total, limit: q.limit, offset: q.offset });
  }),
);

// Compteurs par type, par droit fondamental et par année (mêmes filtres que
// la liste). Déclaré avant "/:id".
documentsRouter.get(
  "/facets",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const q = listQuerySchema.parse(req.query);
    const [total, types, years, cats] = await Promise.all([
      prisma.document.count({ where: buildDocumentWhere(q, req) }),
      prisma.document.groupBy({
        by: ["documentTypeId"],
        where: buildDocumentWhere(q, req, "type"),
        _count: { _all: true },
      }),
      prisma.document.groupBy({
        by: ["year"],
        where: buildDocumentWhere(q, req, "year"),
        _count: { _all: true },
        orderBy: { year: "desc" },
      }),
      prisma.documentCategory.groupBy({
        by: ["categoryId"],
        where: { document: buildDocumentWhere(q, req, "category") },
        _count: { _all: true },
      }),
    ]);
    const typeIds = types.map((t) => t.documentTypeId).filter((id): id is string => !!id);
    const [typeRows, catRows] = await Promise.all([
      prisma.documentType.findMany({ where: { id: { in: typeIds } }, select: { id: true, name: true, nameAr: true } }),
      prisma.category.findMany({ where: { id: { in: cats.map((c) => c.categoryId) } }, select: CATEGORY_SELECT }),
    ]);
    const typeById = new Map(typeRows.map((t) => [t.id, t]));
    const catById = new Map(catRows.map((c) => [c.id, c]));
    res.json({
      total,
      types: types
        .filter((t) => t.documentTypeId && typeById.has(t.documentTypeId))
        .map((t) => ({ ...typeById.get(t.documentTypeId!)!, count: t._count._all }))
        .sort((a, b) => b.count - a.count),
      categories: cats
        .filter((c) => catById.has(c.categoryId))
        .map((c) => ({ ...catById.get(c.categoryId)!, count: c._count._all }))
        .sort((a, b) => b.count - a.count),
      years: years
        .filter((y) => y.year !== null)
        .map((y) => ({ year: y.year!, count: y._count._all })),
    });
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
    const existing = await prisma.document.findUnique({
      where: { id: req.params.id },
      select: { userId: true, book: true },
    });
    if (!existing) throw new HttpError(404, "Document not found");
    if (!hasObservatoireRole(req) && existing.userId !== req.user!.userId) {
      throw new HttpError(403, "Forbidden");
    }
    await prisma.document.delete({ where: { id: req.params.id } });
    // Pages et PDF du lecteur (documents ODF importés)
    const book = (existing.book ?? {}) as Record<string, unknown>;
    for (const edition of Object.values(book)) {
      const dir = (edition as { dir?: unknown } | null)?.dir;
      if (typeof dir === "string") await removeOdfDir("documents", dir);
    }
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
