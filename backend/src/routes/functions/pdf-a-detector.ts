import type { Request } from "express";
import { z } from "zod";
import { env } from "../../config/env.js";

const schema = z.object({
  filename: z.string(),
  fileBase64: z.string(),
});

export async function pdfADetector(req: Request) {
  if (!env.PDFREST_API_KEY) throw new Error("PDFREST_API_KEY is not set");
  const { filename, fileBase64 } = schema.parse(req.body);
  const buffer = Buffer.from(fileBase64, "base64");

  const form = new FormData();
  form.append("file", new Blob([buffer]), filename);

  const res = await fetch(`${env.PDFREST_API_URL}/pdfa-validate`, {
    method: "POST",
    headers: { "Api-Key": env.PDFREST_API_KEY },
    body: form,
  });
  if (!res.ok) throw new Error(`PDF/A detection failed: ${res.status}`);
  const data = (await res.json()) as {
    isPdfA?: boolean;
    pdfaVersion?: string;
    conformanceLevel?: string;
    [key: string]: unknown;
  };
  return {
    isPdfA: data.isPdfA ?? false,
    version: data.pdfaVersion ?? null,
    conformanceLevel: data.conformanceLevel ?? null,
    details: data,
  };
}
