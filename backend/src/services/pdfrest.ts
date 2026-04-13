import { env } from "../config/env.js";

function ensureKey(): string {
  if (!env.PDFREST_API_KEY) throw new Error("PDFREST_API_KEY is not set");
  return env.PDFREST_API_KEY;
}

export async function pdfrestUpload(filename: string, buffer: Buffer): Promise<{ id: string }> {
  const key = ensureKey();
  const form = new FormData();
  form.append("file", new Blob([buffer]), filename);
  const res = await fetch(`${env.PDFREST_API_URL}/upload`, {
    method: "POST",
    headers: { "Api-Key": key },
    body: form,
  });
  if (!res.ok) throw new Error(`PDFRest upload failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { files: Array<{ id: string }> };
  return { id: data.files[0]!.id };
}

export async function pdfrestExtractText(fileId: string): Promise<string> {
  const key = ensureKey();
  const res = await fetch(`${env.PDFREST_API_URL}/extracted-text`, {
    method: "POST",
    headers: {
      "Api-Key": key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: fileId }),
  });
  if (!res.ok) throw new Error(`PDFRest extract failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { fullText?: string; text?: string };
  return data.fullText ?? data.text ?? "";
}

export async function pdfrestConvertToPdfA(
  filename: string,
  buffer: Buffer,
  conformanceLevel = "2b",
): Promise<Buffer> {
  const key = ensureKey();
  const form = new FormData();
  form.append("file", new Blob([buffer]), filename);
  form.append("output_type", "pdfa");
  form.append("conformance_level", conformanceLevel);
  const res = await fetch(`${env.PDFREST_API_URL}/pdfa`, {
    method: "POST",
    headers: { "Api-Key": key },
    body: form,
  });
  if (!res.ok) throw new Error(`PDFRest PDF/A failed: ${res.status} ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
}
