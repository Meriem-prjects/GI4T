import type { Request } from "express";
import { z } from "zod";
import { extractPdfText } from "../../services/text-extraction.js";

const schema = z.object({
  filename: z.string(),
  fileBase64: z.string(),
  pageNumber: z.coerce.number().int().min(1),
});

export async function pdfPageParser(req: Request) {
  const { fileBase64, pageNumber } = schema.parse(req.body);
  const buffer = Buffer.from(fileBase64, "base64");
  const { pageTexts } = await extractPdfText(buffer);
  const text = pageTexts[pageNumber - 1] ?? "";
  return { text, pageNumber };
}
