import type { Request } from "express";
import { z } from "zod";

const schema = z.object({
  text: z.string(),
});

// Heuristic: fix common Arabic spacing issues (double spaces, punctuation spacing, zero-width joiners)
function fixArabicSpacing(text: string): string {
  return text
    .replace(/\u00A0/g, " ") // non-breaking spaces
    .replace(/\s+([،؛؟!.])/g, "$1") // no space before arabic punctuation
    .replace(/([،؛؟!.])(\S)/g, "$1 $2") // space after punctuation
    .replace(/ {2,}/g, " ") // collapse multiple spaces
    .replace(/(\S)([«])/g, "$1 $2")
    .replace(/([»])(\S)/g, "$1 $2")
    .trim();
}

export async function arabicSpacingFixer(req: Request) {
  const { text } = schema.parse(req.body);
  return { text: fixArabicSpacing(text) };
}
