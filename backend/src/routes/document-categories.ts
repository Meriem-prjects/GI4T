// REST API for the document_categories join table.
//
// Frontend (legacy supabase shim) calls:
//   GET    /api/document-categories?document_id=xxx
//   POST   /api/document-categories            body: { document_id, category_id } OR an array
//   DELETE /api/document-categories/:id
//
// All write operations require an observatoire role.

import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler, HttpError } from "../middleware/error.js";

export const documentCategoriesRouter = Router();

const listQuerySchema = z.object({
  document_id: z.string().uuid().optional(),
  category_id: z.string().uuid().optional(),
});

documentCategoriesRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const q = listQuerySchema.parse(req.query);
    const where: Record<string, unknown> = {};
    if (q.document_id) where.documentId = q.document_id;
    if (q.category_id) where.categoryId = q.category_id;
    const items = await prisma.documentCategory.findMany({ where });
    res.json(items);
  }),
);

const writeRoles = ["admin", "admin_observatoire", "editor", "validator"] as const;
type WriteRole = (typeof writeRoles)[number];

const insertSchema = z.union([
  z.object({
    document_id: z.string().uuid(),
    category_id: z.string().uuid(),
  }),
  z.array(
    z.object({
      document_id: z.string().uuid(),
      category_id: z.string().uuid(),
    }),
  ),
]);

documentCategoriesRouter.post(
  "/",
  requireAuth,
  requireRole(...(writeRoles as readonly WriteRole[])),
  asyncHandler(async (req, res) => {
    const parsed = insertSchema.parse(req.body);
    const rows = Array.isArray(parsed) ? parsed : [parsed];
    const created = await prisma.$transaction(
      rows.map((r) =>
        prisma.documentCategory.create({
          data: { documentId: r.document_id, categoryId: r.category_id },
        }),
      ),
    );
    res.status(201).json(Array.isArray(parsed) ? created : created[0]);
  }),
);

documentCategoriesRouter.delete(
  "/:id",
  requireAuth,
  requireRole(...(writeRoles as readonly WriteRole[])),
  asyncHandler(async (req, res) => {
    const existing = await prisma.documentCategory.findUnique({
      where: { id: req.params.id },
    });
    if (!existing) throw new HttpError(404, "Not found");
    await prisma.documentCategory.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  }),
);
