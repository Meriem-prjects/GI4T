import type { Request } from "express";
import { z } from "zod";
import { env } from "../../config/env.js";

const schema = z.object({
  filename: z.string(),
  fileBase64: z.string(),
  dpi: z.coerce.number().int().default(200),
});

export async function pdfToImages(req: Request) {
  if (!env.PDFREST_API_KEY) throw new Error("PDFREST_API_KEY is not set");
  const { filename, fileBase64, dpi } = schema.parse(req.body);
  const buffer = Buffer.from(fileBase64, "base64");

  const form = new FormData();
  form.append("file", new Blob([buffer]), filename);
  form.append("output_type", "png");
  form.append("resolution", String(dpi));

  const res = await fetch(`${env.PDFREST_API_URL}/image`, {
    method: "POST",
    headers: { "Api-Key": env.PDFREST_API_KEY },
    body: form,
  });
  if (!res.ok) throw new Error(`PDF to images failed: ${res.status}`);
  const data = (await res.json()) as { outputUrl?: string; outputUrls?: string[] };
  return { images: data.outputUrls ?? [data.outputUrl].filter(Boolean) };
}
