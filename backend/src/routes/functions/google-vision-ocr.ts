import type { Request } from "express";
import { z } from "zod";
import { ocrWithOpenAI } from "../../services/text-extraction.js";

// Renamed in spirit: this endpoint now delegates to OpenAI gpt-4o
// vision instead of Google Vision. The frontend keeps the same name.
const schema = z.object({
  imageBase64: z.string(),
  languageHints: z.array(z.string()).default(["fr", "ar"]),
});

export async function googleVisionOcr(req: Request) {
  const { imageBase64, languageHints } = schema.parse(req.body);
  const buffer = Buffer.from(imageBase64, "base64");
  const lang: "fr" | "ar" | "auto" = languageHints.includes("ar")
    ? languageHints[0] === "ar"
      ? "ar"
      : "auto"
    : "fr";
  return ocrWithOpenAI(buffer, "image/png", lang);
}
