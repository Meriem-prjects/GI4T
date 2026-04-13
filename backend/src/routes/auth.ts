import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { signJwt } from "../lib/jwt.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler, HttpError } from "../middleware/error.js";
import { env, isProd } from "../config/env.js";

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

async function buildTokenForUser(userId: string, email: string): Promise<string> {
  const roles = await prisma.userRole.findMany({
    where: { userId },
    select: { role: true },
  });
  return signJwt({
    userId,
    email,
    roles: roles.map((r) => r.role),
  });
}

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new HttpError(401, "Invalid credentials");

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) throw new HttpError(401, "Invalid credentials");

    const token = await buildTokenForUser(user.id, user.email);
    const roles = await prisma.userRole.findMany({
      where: { userId: user.id },
      select: { role: true },
    });
    const profile = await prisma.profile.findUnique({ where: { userId: user.id } });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: profile?.firstName ?? null,
        lastName: profile?.lastName ?? null,
        roles: roles.map((r) => r.role),
      },
    });
  }),
);

authRouter.post(
  "/signup",
  asyncHandler(async (req, res) => {
    if (isProd) {
      throw new HttpError(403, "Signup is disabled in production");
    }
    const { email, password, firstName, lastName } = signupSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new HttpError(409, "Email already registered");

    const passwordHash = await hashPassword(password);
    const user = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: { email, passwordHash },
      });
      await tx.profile.create({
        data: { userId: u.id, email, firstName, lastName },
      });
      return u;
    });

    const token = await buildTokenForUser(user.id, user.email);
    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, firstName, lastName, roles: [] },
    });
  }),
);

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        roles: { select: { role: true } },
      },
    });
    if (!user) throw new HttpError(404, "User not found");
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.profile?.firstName ?? null,
      lastName: user.profile?.lastName ?? null,
      roles: user.roles.map((r) => r.role),
    });
  }),
);

authRouter.post("/logout", (_req, res) => {
  // Stateless JWT: client discards the token. Kept for API symmetry.
  res.json({ ok: true });
});

// Helper exported for internal admin creation flows
export async function createUserWithRole(args: {
  email: string;
  password: string;
  roles: string[];
  firstName?: string;
  lastName?: string;
}) {
  const passwordHash = await hashPassword(args.password);
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { email: args.email, passwordHash },
    });
    await tx.profile.create({
      data: {
        userId: user.id,
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
      },
    });
    for (const role of args.roles) {
      await tx.userRole.create({
        data: { userId: user.id, role: role as never },
      });
    }
    return user;
  });
}

// Expose env for downstream files that need it (unused here but avoids warnings)
void env;
