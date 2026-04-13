import type { Request } from "express";
import { prisma } from "../../lib/prisma.js";

function extractAuthorFromFilename(filename: string): string | null {
  const cleaned = filename
    .replace(/\.pdf$/i, "")
    .replace(/[_-]/g, " ")
    .trim();
  const firstComma = cleaned.split("،")[0] ?? cleaned.split(",")[0];
  if (firstComma && firstComma.length > 2 && firstComma.length < 80) {
    return firstComma.trim();
  }
  return null;
}

export async function fixAuthors(_req: Request) {
  const docs = await prisma.document.findMany({
    where: { OR: [{ author: null }, { author: "" }] },
    select: { id: true, originalFilename: true },
  });

  let updated = 0;
  for (const doc of docs) {
    const author = extractAuthorFromFilename(doc.originalFilename);
    if (author) {
      await prisma.document.update({
        where: { id: doc.id },
        data: { author },
      });
      updated++;
    }
  }
  return { scanned: docs.length, updated };
}
