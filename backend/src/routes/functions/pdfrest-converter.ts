import type { Request } from "express";
import { z } from "zod";
import { pdfrestConvertToPdfA } from "../../services/pdfrest.js";
import { saveFile } from "../../lib/storage.js";

const schema = z.object({
  filename: z.string(),
  fileBase64: z.string(),
  conformanceLevel: z.string().default("2b"),
});

export async function pdfrestConverter(req: Request) {
  const { filename, fileBase64, conformanceLevel } = schema.parse(req.body);
  const buffer = Buffer.from(fileBase64, "base64");
  const pdfaBuffer = await pdfrestConvertToPdfA(filename, buffer, conformanceLevel);

  const saved = await saveFile(
    "documents",
    req.user!.userId,
    filename.replace(/\.pdf$/i, `.pdfa.pdf`),
    pdfaBuffer,
  );
  return {
    url: saved.url,
    key: saved.key,
    size: saved.size,
    conformanceLevel,
  };
}
