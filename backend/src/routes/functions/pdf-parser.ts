import type { Request } from "express";
import { z } from "zod";
import { pdfrestUpload, pdfrestExtractText } from "../../services/pdfrest.js";

const schema = z.object({
  filename: z.string(),
  fileBase64: z.string(),
});

export async function pdfParser(req: Request) {
  const { filename, fileBase64 } = schema.parse(req.body);
  const buffer = Buffer.from(fileBase64, "base64");
  const uploaded = await pdfrestUpload(filename, buffer);
  const text = await pdfrestExtractText(uploaded.id);
  return { text, length: text.length };
}
