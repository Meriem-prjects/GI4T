import http from "node:http";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { ensureStorageDirs } from "./lib/storage.js";
import { attachRealtime } from "./realtime/progress.js";

async function main(): Promise<void> {
  await ensureStorageDirs();

  const app = createApp();
  const server = http.createServer(app);

  attachRealtime(server);

  server.listen(env.PORT, () => {
    console.log(`API listening on ${env.API_URL} (port ${env.PORT})`);
    console.log(`Environment: ${env.NODE_ENV}`);
  });

  const shutdown = (signal: string) => {
    console.log(`\n${signal} received, shutting down gracefully...`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});
