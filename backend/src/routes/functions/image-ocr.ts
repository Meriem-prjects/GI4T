import type { Request } from "express";
import { z } from "zod";
import { ocrImage } from "../../services/google-vision.js";

const schema = z.object({
  imageBase64: z.string(),
  languageHints: z.array(z.string()).optional(),
});

export async function imageOcr(req: Request) {
  const { imageBase64, languageHints } = schema.parse(req.body);
  const buffer = Buffer.from(imageBase64, "base64");
  return ocrImage(buffer, languageHints);
}
