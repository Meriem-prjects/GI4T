import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import { corsOrigins, env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/error.js";
import { transformKeysToSnake } from "./lib/case-transform.js";
import { authRouter } from "./routes/auth.js";
import { usersRouter } from "./routes/users.js";
import { documentsRouter } from "./routes/documents.js";
import { documentCategoriesRouter } from "./routes/document-categories.js";
import { categoriesRouter } from "./routes/categories.js";
import { documentTypesRouter } from "./routes/document-types.js";
import { eventsRouter } from "./routes/events.js";
import { newsRouter } from "./routes/news.js";
import { commentsRouter } from "./routes/comments.js";
import { faqRouter } from "./routes/faq.js";
import { usefulAddressesRouter } from "./routes/useful-addresses.js";
import { governoratesRouter } from "./routes/governorates.js";
import { courtTypesRouter } from "./routes/court-types.js";
import { jurisdictionLevelsRouter } from "./routes/jurisdiction-levels.js";
import { languagesRouter } from "./routes/languages.js";
import { chatbotRouter } from "./routes/chatbot.js";
import { statisticsRouter } from "./routes/statistics.js";
import { activityLogsRouter } from "./routes/activity-logs.js";
import { processingJobsRouter } from "./routes/processing-jobs.js";
import { photoAlbumsRouter } from "./routes/photo-albums.js";
import { mediaItemsRouter } from "./routes/media-items.js";
import { storageRouter } from "./routes/storage.js";
import { chatbotConfigRouter, chatbotTrainingDocumentsRouter } from "./routes/chatbot-config.js";
import { usefulLinksRouter } from "./routes/useful-links.js";
import { practicalResourcesRouter } from "./routes/practical-resources.js";
import { practicalGuidesRouter } from "./routes/practical-guides.js";
import { functionsRouter } from "./routes/functions/index.js";

export function createApp(): Express {
  const app = express();

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      // X-Frame-Options is replaced by CSP frame-ancestors below.
      // We need to allow the SPA (localhost:8080 in dev, configured
      // origins in prod) to embed PDFs served from /api/storage in
      // an iframe — the Document AI view depends on it.
      frameguard: false,
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "frame-ancestors": ["'self'", ...corsOrigins],
        },
      },
    }),
  );
  app.use(
    cors({
      origin: corsOrigins,
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Convert all JSON responses from camelCase (Prisma) to snake_case (frontend expects).
  // Skip transformation for binary or non-JSON responses.
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith("/api/storage/")) return next();
    const originalJson = res.json.bind(res);
    res.json = ((body: unknown) => {
      try {
        return originalJson(transformKeysToSnake(body));
      } catch {
        return originalJson(body);
      }
    }) as typeof res.json;
    next();
  });

  app.use("/api/auth", authRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/documents", documentsRouter);
  app.use("/api/document-categories", documentCategoriesRouter);
  app.use("/api/useful-links", usefulLinksRouter);
  app.use("/api/practical-resources", practicalResourcesRouter);
  app.use("/api/practical-guides", practicalGuidesRouter);
  app.use("/api/categories", categoriesRouter);
  app.use("/api/document-types", documentTypesRouter);
  app.use("/api/events", eventsRouter);
  app.use("/api/news", newsRouter);
  app.use("/api/comments", commentsRouter);
  app.use("/api/faq", faqRouter);
  app.use("/api/useful-addresses", usefulAddressesRouter);
  app.use("/api/governorates", governoratesRouter);
  app.use("/api/court-types", courtTypesRouter);
  app.use("/api/jurisdiction-levels", jurisdictionLevelsRouter);
  app.use("/api/languages", languagesRouter);
  app.use("/api/chatbot", chatbotRouter);
  // Aliases under kebab-case paths — the supabase shim's table-to-URL
  // mapper translates `chatbot_config` → `/api/chatbot-config` etc.
  app.use("/api/chatbot-config", chatbotConfigRouter);
  app.use("/api/chatbot-training-documents", chatbotTrainingDocumentsRouter);
  app.use("/api/statistics", statisticsRouter);
  app.use("/api/activity-logs", activityLogsRouter);
  app.use("/api/processing-jobs", processingJobsRouter);
  app.use("/api/photo-albums", photoAlbumsRouter);
  app.use("/api/media-items", mediaItemsRouter);
  app.use("/api/storage", storageRouter);
  app.use("/api/fn", functionsRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
