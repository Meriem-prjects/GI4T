import type { Request } from "express";
import { z } from "zod";
import { extractPdfText } from "../../services/text-extraction.js";

const schema = z.object({
  filename: z.string(),
  fileBase64: z.string(),
});

export async function pdfParser(req: Request) {
  const { fileBase64 } = schema.parse(req.body);
  const buffer = Buffer.from(fileBase64, "base64");
  const { text, pageCount } = await extractPdfText(buffer);
  return { text, length: text.length, pageCount };
}
