// One-shot migration: convert document `content` and `translated_content`
// from HTML to Markdown.
//
// Background: until this PR, the editor stored rich-text as HTML
// (CKEditor). The new editor is WYSIWYG-on-top-of-Markdown, and the
// upload pipeline now outputs Markdown directly. This script aligns
// all existing rows with the new storage format so the public page
// and the editor stop having to guess at the format.
//
// Run:
//   cd backend
//   NODE_OPTIONS=--use-system-ca npx tsx scripts/migrate-html-to-markdown.ts
//
// Idempotent: a row whose `content` does not contain any HTML tag is
// skipped (it is already plain text or Markdown).

import { prisma } from "../src/lib/prisma.js";
import TurndownService from "turndown";

const td = new TurndownService({
  headingStyle: "atx",
  bulletListMarker: "-",
  codeBlockStyle: "fenced",
  emDelimiter: "*",
  strongDelimiter: "**",
  linkStyle: "inlined",
});

// Drop horizontal rules — they were OCR artefacts, not real content.
td.addRule("drop-hr", { filter: ["hr"], replacement: () => "" });

// Drop the legacy `page-break` divs the page-by-page editor produced
// — the body is unified now.
td.addRule("drop-page-break", {
  filter: (node) =>
    node.nodeName === "DIV" &&
    typeof (node as HTMLElement).className === "string" &&
    /page-break|page-separator/.test((node as HTMLElement).className ?? ""),
  // Keep the inner text — drop only the wrapping element.
  replacement: (content) => content,
});

const LIKELY_HTML = /<(?:p|div|h[1-6]|br|strong|em|ul|ol|li|span|table|tr|td|th)\b/i;

function htmlToMd(html: string | null | undefined): string | null {
  if (html == null) return null;
  const trimmed = html.trim();
  if (!trimmed) return "";
  if (!LIKELY_HTML.test(trimmed)) return trimmed; // already plain text or markdown
  const md = td.turndown(trimmed).trim();
  // Collapse 3+ blank lines to 2.
  return md.replace(/\n{3,}/g, "\n\n");
}

async function main() {
  const docs = await prisma.document.findMany({
    select: { id: true, content: true, translatedContent: true },
  });
  console.log(`[migrate] scanning ${docs.length} documents`);

  let converted = 0;
  let skipped = 0;
  for (const d of docs) {
    const newContent = htmlToMd(d.content);
    const newTranslated = htmlToMd(d.translatedContent);
    const contentChanged = newContent !== d.content;
    const translatedChanged = newTranslated !== d.translatedContent;
    if (!contentChanged && !translatedChanged) {
      skipped++;
      continue;
    }
    await prisma.document.update({
      where: { id: d.id },
      data: {
        ...(contentChanged ? { content: newContent } : {}),
        ...(translatedChanged ? { translatedContent: newTranslated } : {}),
      },
    });
    converted++;
    if (converted % 25 === 0) {
      console.log(`[migrate] ${converted} converted, ${skipped} skipped`);
    }
  }
  console.log(`[migrate] done — ${converted} converted, ${skipped} unchanged`);
}

main()
  .catch((err) => {
    console.error("[migrate] failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
