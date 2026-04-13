import type { Request } from "express";
import { z } from "zod";
import { ocrImage } from "../../services/google-vision.js";

const schema = z.object({
  fileBase64: z.string(),
  languageHints: z.array(z.string()).optional(),
});

export async function pdfOcr(req: Request) {
  const { fileBase64, languageHints } = schema.parse(req.body);
  const buffer = Buffer.from(fileBase64, "base64");
  return ocrImage(buffer, languageHints);
}
