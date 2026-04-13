import type { NextFunction, Request, Response } from "express";
import { verifyJwt, type JwtPayload } from "../lib/jwt.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7);
  const queryToken = req.query.token;
  if (typeof queryToken === "string" && queryToken.length > 0) return queryToken;
  return null;
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (!token) return next();
  try {
    req.user = verifyJwt(token);
  } catch {
    // ignore invalid tokens
  }
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  try {
    req.user = verifyJwt(token);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    const userRoles = req.user.roles ?? [];
    const hasRole = userRoles.some((r) => allowedRoles.includes(r));
    if (!hasRole) {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }
    next();
  };
}

export function isAdmin(req: Request): boolean {
  return (req.user?.roles ?? []).includes("admin");
}

export function hasObservatoireRole(req: Request): boolean {
  const roles = req.user?.roles ?? [];
  return roles.includes("admin") || roles.includes("admin_observatoire");
}

export function hasAccesDroitsRole(req: Request): boolean {
  const roles = req.user?.roles ?? [];
  return roles.includes("admin") || roles.includes("admin_acces_droits");
}
