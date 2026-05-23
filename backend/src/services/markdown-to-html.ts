// Convert Mistral OCR's Markdown output to structured HTML, preserving
// the document hierarchy as it appears in the source PDF:
//   - `#` `##` `###` `####`            →  <h1> <h2> <h3> <h4>
//   - `**bold**`                        →  <strong>
//   - `*italic*` / `_italic_`           →  <em>
//   - `- item` / `* item` / `1. item`   →  <ul> / <ol> <li>
//   - `> quote`                         →  <blockquote>
//   - `| a | b |\n|---|---|\n| c | d |` →  <table>
//   - blank-line separated blocks       →  <p>
//
// This replaces the legacy `htmlFromText()` which only recognised `#`
// headings on isolated lines and collapsed everything else into <p>.

import { marked } from "marked";

// One-time global config: enable GitHub-Flavoured Markdown for tables,
// strikethrough, task lists. Keep `breaks: false` so a single newline
// inside a paragraph isn't promoted to <br/> — Mistral OCR wraps lines
// at column boundaries and we don't want those line wraps preserved
// as visual line-breaks in the editor.
marked.setOptions({
  gfm: true,
  breaks: false,
});

// Pre-normalise the OCR text before feeding it to `marked`:
//   1. Drop horizontal-rule lines (`---`, `***`, `___`) — Mistral OCR
//      uses these as page-break separators, never as document content.
//   2. Drop lines that are only `>` (orphan blockquote markers).
//   3. Collapse 3+ consecutive newlines down to exactly 2 (one blank).
function normaliseOcrMarkdown(md: string): string {
  return md
    .replace(/^\s*[-*_]{3,}\s*$/gm, "")
    .replace(/^\s*>\s*$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Convert Markdown → HTML, preserving the structural hierarchy.
 * Returns an empty string when input is falsy or whitespace-only.
 */
export function markdownToHtml(md: string | undefined | null): string {
  if (!md || !md.trim()) return "";
  const normalised = normaliseOcrMarkdown(md);
  if (!normalised) return "";
  const html = marked.parse(normalised, { async: false }) as string;
  return html.trim();
}
