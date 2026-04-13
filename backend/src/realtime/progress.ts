import type { Server as HttpServer } from "node:http";
import { Server, type Socket } from "socket.io";
import { verifyJwt } from "../lib/jwt.js";
import { corsOrigins } from "../config/env.js";

let io: Server | null = null;

export function attachRealtime(server: HttpServer): Server {
  io = new Server(server, {
    cors: {
      origin: corsOrigins,
      credentials: true,
    },
  });

  const ns = io.of("/progress");
  ns.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error("Unauthorized"));
    try {
      const payload = verifyJwt(token);
      (socket.data as { user?: typeof payload }).user = payload;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  ns.on("connection", (socket: Socket) => {
    socket.on("subscribe:job", (jobId: string) => {
      if (typeof jobId === "string") socket.join(`job:${jobId}`);
    });
    socket.on("unsubscribe:job", (jobId: string) => {
      if (typeof jobId === "string") socket.leave(`job:${jobId}`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}

export interface JobProgressUpdate {
  jobId: string;
  status: string;
  progress: number;
  currentStep?: string | null;
  totalPages?: number | null;
  processedPages?: number | null;
  errorMessage?: string | null;
  resultData?: unknown;
}

export function publishJobProgress(update: JobProgressUpdate): void {
  if (!io) return;
  io.of("/progress").to(`job:${update.jobId}`).emit("update", update);
  io.of("/progress").emit("broadcast", update);
}
