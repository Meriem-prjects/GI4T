import { Router } from "express";
import { z, type ZodTypeAny } from "zod";
import { prisma } from "./prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler, HttpError } from "../middleware/error.js";
import { snakeToCamel } from "./case-transform.js";

const RESERVED = new Set(["limit", "offset", "order_by", "order", "select", "search"]);

function buildWhereFromQuery(query: Record<string, unknown>): Record<string, unknown> {
  const where: Record<string, unknown> = {};
  for (const [rawKey, rawValue] of Object.entries(query)) {
    if (RESERVED.has(rawKey)) continue;
    if (rawValue === undefined || rawValue === null || rawValue === "") continue;
    const value = String(rawValue);

    let op: string | null = null;
    let col = rawKey;
    for (const suffix of ["_in", "_gte", "_lte", "_gt", "_lt", "_neq"] as const) {
      if (rawKey.endsWith(suffix)) {
        op = suffix.slice(1);
        col = rawKey.slice(0, -suffix.length);
        break;
      }
    }
    // Supabase-style nested filter e.g. "document_categories.category_id=xxx"
    // → Prisma relation filter: { documentCategories: { some: { categoryId: xxx } } }.
    // Without this the dot-notation key silently no-oped and the frontend
    // received an unfiltered list capped at 100 rows, making individual
    // documents unreachable by slug when they fell past that cap.
    if (col.includes(".")) {
      const [relationRaw, fieldRaw] = col.split(".", 2) as [string, string];
      const relation = snakeToCamel(relationRaw);
      const field = snakeToCamel(fieldRaw);
      const parsed = isNaN(Number(value)) ? value : Number(value);
      const inner =
        op === "in"
          ? { [field]: { in: value.split(",") } }
          : op
          ? { [field]: { [op]: parsed } }
          : { [field]: value };
      where[relation] = { some: inner };
      continue;
    }
    const camelCol = snakeToCamel(col);
    if (op === "in") {
      where[camelCol] = { in: value.split(",") };
    } else if (op) {
      const parsed = isNaN(Number(value)) ? value : Number(value);
      where[camelCol] = { [op]: parsed };
    } else if (value === "true" || value === "false") {
      where[camelCol] = value === "true";
    } else {
      where[camelCol] = value;
    }
  }
  return where;
}

type PrismaDelegate = {
  findMany: (args: unknown) => Promise<unknown>;
  findUnique: (args: unknown) => Promise<unknown>;
  create: (args: unknown) => Promise<unknown>;
  update: (args: unknown) => Promise<unknown>;
  delete: (args: unknown) => Promise<unknown>;
  count: (args: unknown) => Promise<number>;
};

export interface CrudOptions<TCreate extends ZodTypeAny, TUpdate extends ZodTypeAny> {
  model: keyof typeof prisma;
  createSchema: TCreate;
  updateSchema: TUpdate;
  listOrderBy?: Record<string, "asc" | "desc"> | Array<Record<string, "asc" | "desc">>;
  writeRoles?: string[];
  publicRead?: boolean;
  defaultWhere?: Record<string, unknown>;
  include?: Record<string, unknown>;
}

export function makeCrudRouter<TCreate extends ZodTypeAny, TUpdate extends ZodTypeAny>(
  opts: CrudOptions<TCreate, TUpdate>,
): Router {
  const router = Router();
  const delegate = (prisma as unknown as Record<string, PrismaDelegate>)[opts.model as string];
  if (!delegate) throw new Error(`Unknown Prisma model: ${String(opts.model)}`);

  const writeRoles = opts.writeRoles ?? ["admin"];
  const listOrderBy = opts.listOrderBy ?? { createdAt: "desc" };

  router.get(
    "/",
    asyncHandler(async (req, res) => {
      const where = {
        ...(opts.defaultWhere ?? {}),
        ...buildWhereFromQuery(req.query as Record<string, unknown>),
      };
      const limit = Math.min(Number(req.query.limit ?? 100), 500);
      const offset = Math.max(Number(req.query.offset ?? 0), 0);

      let orderBy: Record<string, "asc" | "desc"> | Array<Record<string, "asc" | "desc">> = listOrderBy;
      if (req.query.order_by) {
        const col = snakeToCamel(String(req.query.order_by));
        const dir = (req.query.order as "asc" | "desc") ?? "desc";
        orderBy = { [col]: dir };
      }

      const items = await delegate.findMany({
        where,
        orderBy,
        take: limit,
        skip: offset,
        ...(opts.include ? { include: opts.include } : {}),
      });
      const total = await delegate.count({ where });
      res.json({ items, total, limit, offset });
    }),
  );

  router.get(
    "/:id",
    asyncHandler(async (req, res) => {
      const item = await delegate.findUnique({
        where: { id: req.params.id },
        ...(opts.include ? { include: opts.include } : {}),
      });
      if (!item) throw new HttpError(404, "Not found");
      res.json(item);
    }),
  );

  router.post(
    "/",
    requireAuth,
    requireRole(...writeRoles),
    asyncHandler(async (req, res) => {
      const data = opts.createSchema.parse(req.body);
      const created = await delegate.create({ data });
      res.status(201).json(created);
    }),
  );

  router.patch(
    "/:id",
    requireAuth,
    requireRole(...writeRoles),
    asyncHandler(async (req, res) => {
      const data = opts.updateSchema.parse(req.body);
      const updated = await delegate.update({ where: { id: req.params.id }, data });
      res.json(updated);
    }),
  );

  router.delete(
    "/:id",
    requireAuth,
    requireRole(...writeRoles),
    asyncHandler(async (req, res) => {
      await delegate.delete({ where: { id: req.params.id } });
      res.json({ ok: true });
    }),
  );

  return router;
}

// Common zod helpers
export const optionalString = () => z.string().optional().nullable();
export const optionalInt = () => z.coerce.number().int().optional().nullable();
export const optionalBool = () => z.boolean().optional();
