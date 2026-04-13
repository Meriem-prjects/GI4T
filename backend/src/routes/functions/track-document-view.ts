import type { Request } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";

const schema = z.object({
  documentId: z.string().uuid(),
  sessionId: z.string().min(1),
  readDuration: z.coerce.number().int().optional(),
});

export async function trackDocumentView(req: Request) {
  const { documentId, sessionId, readDuration } = schema.parse(req.body);
  const ipAddress =
    (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0] ??
    req.socket.remoteAddress ??
    null;
  const userAgent = req.headers["user-agent"] ?? null;

  const view = await prisma.documentView.create({
    data: {
      documentId,
      sessionId,
      readDuration: readDuration ?? 0,
      ipAddress: ipAddress ?? undefined,
      userAgent: userAgent ?? undefined,
    },
  });
  return view;
}
