import { Router, type Request, type Response } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { asyncHandler, HttpError } from "../../middleware/error.js";
import { upload } from "../../middleware/upload.js";

// Function names that need multipart/FormData parsing for an
// uploaded `file` field. Multer's .single("file") is added before
// the handler.
const MULTIPART_FUNCTIONS = new Set(["upload-document"]);

// Admin / user management
import { createAdminUser } from "./create-admin-user.js";
import { createObservatoireAdmin } from "./create-observatoire-admin.js";
import { createAccesDroitsAdmin } from "./create-acces-droits-admin.js";
import { updateUserRoles } from "./update-user-roles.js";
import { deleteUser } from "./delete-user.js";
import { setupInitialAdmin } from "./setup-initial-admin.js";

// Documents
import { uploadDocument } from "./upload-document.js";
import { documentAnalysis } from "./document-analysis.js";
import { reprocessDocument } from "./reprocess-document.js";
import { reExtractDocument } from "./re-extract-document.js";
import { trackDocumentView } from "./track-document-view.js";
import { submitComment } from "./submit-comment.js";
import { fixAuthors } from "./fix-authors.js";

// PDF processing
import { pdfParser } from "./pdf-parser.js";
import { pdfPageParser } from "./pdf-page-parser.js";
import { pdfOcr } from "./pdf-ocr.js";
import { pdfOcrBatch } from "./pdf-ocr-batch.js";
import { pdfToImages } from "./pdf-to-images.js";
import { pdfReader } from "./pdf-reader.js";
import { pdfADetector } from "./pdf-a-detector.js";
import { pdfrestConverter } from "./pdfrest-converter.js";
import { docxParser } from "./docx-parser.js";
import { imageOcr } from "./image-ocr.js";
import { googleVisionOcr } from "./google-vision-ocr.js";

// AI / language
import { smartDocumentAnalysis } from "./smart-document-analysis.js";
import { generateDocumentEmbeddings } from "./generate-document-embeddings.js";
import { batchGenerateEmbeddings } from "./batch-generate-embeddings.js";
import { aiSemanticSearch } from "./ai-semantic-search.js";
import { chatbotFineTuning } from "./chatbot-fine-tuning.js";
import { accesDroitsChat } from "./acces-droits-chat.js";
import { refreshAadEmbeddingsFn } from "./refresh-aad-embeddings.js";
import { translatePage } from "./translate-page.js";
import { translateFields } from "./translate-fields.js";
import { asyncFullTranslation } from "./async-full-translation.js";
import { arabicSpacingFixer } from "./arabic-spacing-fixer.js";

type Handler = (req: Request, res: Response) => Promise<unknown>;

interface FunctionDef {
  name: string;
  handler: Handler;
  auth?: "none" | "required" | "admin" | "admin_observatoire" | "admin_acces_droits";
}

const functions: FunctionDef[] = [
  // Admin / user management
  { name: "create-admin-user", handler: createAdminUser, auth: "admin" },
  { name: "create-observatoire-admin", handler: createObservatoireAdmin, auth: "admin" },
  { name: "create-acces-droits-admin", handler: createAccesDroitsAdmin, auth: "admin" },
  { name: "update-user-roles", handler: updateUserRoles, auth: "admin" },
  { name: "delete-user", handler: deleteUser, auth: "admin" },
  { name: "setup-initial-admin", handler: setupInitialAdmin, auth: "none" },

  // Documents
  { name: "upload-document", handler: uploadDocument, auth: "required" },
  { name: "document-analysis", handler: documentAnalysis, auth: "required" },
  { name: "reprocess-document", handler: reprocessDocument, auth: "required" },
  { name: "re-extract-document", handler: reExtractDocument, auth: "required" },
  { name: "track-document-view", handler: trackDocumentView, auth: "none" },
  { name: "submit-comment", handler: submitComment, auth: "none" },
  { name: "fix-authors", handler: fixAuthors, auth: "admin" },

  // PDF processing
  { name: "pdf-parser", handler: pdfParser, auth: "required" },
  { name: "pdf-page-parser", handler: pdfPageParser, auth: "required" },
  { name: "pdf-ocr", handler: pdfOcr, auth: "required" },
  { name: "pdf-ocr-batch", handler: pdfOcrBatch, auth: "required" },
  { name: "pdf-to-images", handler: pdfToImages, auth: "required" },
  { name: "pdf-reader", handler: pdfReader, auth: "required" },
  { name: "pdf-a-detector", handler: pdfADetector, auth: "required" },
  { name: "pdfrest-converter", handler: pdfrestConverter, auth: "required" },
  { name: "docx-parser", handler: docxParser, auth: "required" },
  { name: "image-ocr", handler: imageOcr, auth: "required" },
  { name: "google-vision-ocr", handler: googleVisionOcr, auth: "required" },

  // AI / language
  { name: "smart-document-analysis", handler: smartDocumentAnalysis, auth: "required" },
  { name: "generate-document-embeddings", handler: generateDocumentEmbeddings, auth: "required" },
  { name: "batch-generate-embeddings", handler: batchGenerateEmbeddings, auth: "admin_observatoire" },
  { name: "ai-semantic-search", handler: aiSemanticSearch, auth: "none" },
  { name: "chatbot-fine-tuning", handler: chatbotFineTuning, auth: "admin_acces_droits" },
  { name: "acces-droits-chat", handler: accesDroitsChat, auth: "none" },
  { name: "refresh-aad-embeddings", handler: refreshAadEmbeddingsFn, auth: "admin" },
  { name: "translate-page", handler: translatePage, auth: "required" },
  { name: "translate-fields", handler: translateFields, auth: "required" },
  { name: "async-full-translation", handler: asyncFullTranslation, auth: "required" },
  { name: "arabic-spacing-fixer", handler: arabicSpacingFixer, auth: "required" },
];

export const functionsRouter = Router();

for (const fn of functions) {
  const middlewares = [];
  switch (fn.auth) {
    case "required":
      middlewares.push(requireAuth);
      break;
    case "admin":
      middlewares.push(requireAuth, requireRole("admin"));
      break;
    case "admin_observatoire":
      middlewares.push(requireAuth, requireRole("admin", "admin_observatoire"));
      break;
    case "admin_acces_droits":
      middlewares.push(requireAuth, requireRole("admin", "admin_acces_droits"));
      break;
    case "none":
    default:
      break;
  }
  if (MULTIPART_FUNCTIONS.has(fn.name)) {
    middlewares.push(upload.single("file"));
  }
  functionsRouter.post(
    `/${fn.name}`,
    ...middlewares,
    asyncHandler(async (req, res) => {
      const result = await fn.handler(req, res);
      if (!res.headersSent) res.json(result ?? { ok: true });
    }),
  );
}

functionsRouter.use((_req, _res, next) => {
  next(new HttpError(404, "Function not found"));
});
