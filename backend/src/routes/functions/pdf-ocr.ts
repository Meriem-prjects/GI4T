import type { Request } from "express";
import { z } from "zod";
import { ocrWithOpenAI } from "../../services/text-extraction.js";

const schema = z.object({
  fileBase64: z.string(),
  mimeType: z.string().optional(),
  languageHints: z.array(z.string()).optional(),
});

export async function pdfOcr(req: Request) {
  const { fileBase64, mimeType, languageHints } = schema.parse(req.body);
  const buffer = Buffer.from(fileBase64, "base64");
  const lang =
    languageHints?.includes("ar") && languageHints[0] === "ar"
      ? "ar"
      : languageHints?.includes("fr") && languageHints[0] === "fr"
      ? "fr"
      : "auto";
  return ocrWithOpenAI(buffer, mimeType ?? "image/png", lang as "fr" | "ar" | "auto");
}
