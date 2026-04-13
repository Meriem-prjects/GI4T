import type { Request } from "express";
import { z } from "zod";
import { env } from "../../config/env.js";

const schema = z.object({
  filename: z.string(),
  fileBase64: z.string(),
  pageNumber: z.coerce.number().int().min(1),
});

export async function pdfPageParser(req: Request) {
  if (!env.PDFREST_API_KEY) throw new Error("PDFREST_API_KEY is not set");
  const { filename, fileBase64, pageNumber } = schema.parse(req.body);
  const buffer = Buffer.from(fileBase64, "base64");

  const uploadForm = new FormData();
  uploadForm.append("file", new Blob([buffer]), filename);
  uploadForm.append("pages", String(pageNumber));

  const res = await fetch(`${env.PDFREST_API_URL}/extracted-text`, {
    method: "POST",
    headers: { "Api-Key": env.PDFREST_API_KEY },
    body: uploadForm,
  });
  if (!res.ok) throw new Error(`PDFRest page parser failed: ${res.status}`);
  const data = (await res.json()) as { fullText?: string; text?: string };
  return { text: data.fullText ?? data.text ?? "", pageNumber };
}
