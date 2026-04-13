import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler, HttpError } from "../middleware/error.js";
import { hashPassword } from "../lib/password.js";

export const usersRouter = Router();

usersRouter.get(
  "/",
  requireAuth,
  requireRole("admin", "admin_observatoire", "admin_acces_droits"),
  asyncHandler(async (_req, res) => {
    const users = await prisma.user.findMany({
      include: {
        profile: true,
        roles: { select: { role: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(
      users.map((u) => ({
        id: u.id,
        email: u.email,
        firstName: u.profile?.firstName ?? null,
        lastName: u.profile?.lastName ?? null,
        roles: u.roles.map((r) => r.role),
        createdAt: u.createdAt,
      })),
    );
  }),
);

usersRouter.get(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: { profile: true, roles: { select: { role: true } } },
    });
    if (!user) throw new HttpError(404, "User not found");
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.profile?.firstName ?? null,
      lastName: user.profile?.lastName ?? null,
      roles: user.roles.map((r) => r.role),
      createdAt: user.createdAt,
    });
  }),
);

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  roles: z.array(z.string()).default([]),
});

usersRouter.post(
  "/",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const body = createUserSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) throw new HttpError(409, "Email already in use");

    const passwordHash = await hashPassword(body.password);
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: { email: body.email, passwordHash },
      });
      await tx.profile.create({
        data: {
          userId: created.id,
          email: body.email,
          firstName: body.firstName,
          lastName: body.lastName,
        },
      });
      if (body.roles.length > 0) {
        await tx.userRole.createMany({
          data: body.roles.map((role) => ({ userId: created.id, role: role as never })),
          skipDuplicates: true,
        });
      }
      return created;
    });

    res.status(201).json({ id: user.id, email: user.email });
  }),
);

const updateRolesSchema = z.object({
  roles: z.array(z.string()),
});

usersRouter.patch(
  "/:id/roles",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const { roles } = updateRolesSchema.parse(req.body);
    await prisma.$transaction([
      prisma.userRole.deleteMany({ where: { userId: req.params.id } }),
      prisma.userRole.createMany({
        data: roles.map((r) => ({ userId: req.params.id, role: r as never })),
        skipDuplicates: true,
      }),
    ]);
    res.json({ ok: true });
  }),
);

usersRouter.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  }),
);
