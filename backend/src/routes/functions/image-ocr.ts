import type { Request } from "express";
import { z } from "zod";
import { ocrWithOpenAI } from "../../services/text-extraction.js";

const schema = z.object({
  imageBase64: z.string(),
  mimeType: z.string().optional(),
  languageHint: z.enum(["fr", "ar", "auto"]).optional(),
});

export async function imageOcr(req: Request) {
  const { imageBase64, mimeType, languageHint } = schema.parse(req.body);
  const buffer = Buffer.from(imageBase64, "base64");
  return ocrWithOpenAI(buffer, mimeType ?? "image/png", languageHint ?? "auto");
}
