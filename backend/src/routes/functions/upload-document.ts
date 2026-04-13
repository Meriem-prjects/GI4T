import type { Request } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { saveFile } from "../../lib/storage.js";

const schema = z.object({
  filename: z.string(),
  fileBase64: z.string(),
  title: z.string().optional(),
  titleAr: z.string().optional(),
  language: z.string().default("fr"),
  categoryId: z.string().uuid().optional().nullable(),
  documentTypeId: z.string().uuid().optional().nullable(),
});

export async function uploadDocument(req: Request) {
  const { filename, fileBase64, title, titleAr, language, categoryId, documentTypeId } =
    schema.parse(req.body);
  const buffer = Buffer.from(fileBase64, "base64");
  const userId = req.user!.userId;

  const saved = await saveFile("documents", userId, filename, buffer);

  const doc = await prisma.document.create({
    data: {
      userId,
      title: title ?? filename,
      titleAr,
      content: "",
      originalFilename: filename,
      fileUrl: saved.url,
      pdfUrl: saved.url,
      fileSize: saved.size,
      language,
      categoryId: categoryId ?? undefined,
      documentTypeId: documentTypeId ?? undefined,
      status: "pending_validation",
      published: false,
    },
  });
  return doc;
}
