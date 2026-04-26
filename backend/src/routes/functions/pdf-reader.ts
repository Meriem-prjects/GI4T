import type { Request } from "express";
import { z } from "zod";
import { extractPdfText } from "../../services/text-extraction.js";

const schema = z.object({
  filename: z.string(),
  fileBase64: z.string(),
});

export async function pdfReader(req: Request) {
  const { fileBase64 } = schema.parse(req.body);
  const buffer = Buffer.from(fileBase64, "base64");
  const { text, pageCount, pageTexts } = await extractPdfText(buffer);
  return {
    fullText: text,
    pageCount,
    pages: pageTexts.map((content, idx) => ({
      pageNumber: idx + 1,
      content,
      confidence: 0.95,
    })),
  };
}
