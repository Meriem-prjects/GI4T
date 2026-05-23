// HTML → Markdown conversion for the upload pipeline.
//
// The pipeline still builds HTML internally (so we can keep the
// existing structure-extraction logic untouched). The very last step
// before persistence runs `htmlToMarkdown()` so what we save in the
// database — and what the editor and the public page render — is
// always Markdown.
//
// Why this matters: Mistral OCR returns Markdown natively. Forcing
// every body through HTML round-trips introduced a class of fidelity
// bugs (raw `#` / `##` markers leaking through, `---` page-separators
// surviving as paragraphs, etc.). Storing Markdown end-to-end means
// the editor receives a structured document directly.

import TurndownService from "turndown";

// Configured once — identical settings to the frontend's MarkdownEditor
// so the round-trip (save in admin, reload, save again) is stable.
const td = new TurndownService({
  headingStyle: "atx",        // # H1 / ## H2 / ### H3
  bulletListMarker: "-",
  codeBlockStyle: "fenced",
  emDelimiter: "*",
  strongDelimiter: "**",
  linkStyle: "inlined",
});

// Drop horizontal rules — Mistral OCR emits `---` between pages and
// they're meaningless once the body is consolidated. (`hr` rule in
// the original is whitelisted but we override it to nothing.)
td.addRule("drop-hr", {
  filter: ["hr"],
  replacement: () => "",
});

// Collapse runs of repeated single tokens that Mistral sometimes
// inserts when it reads a page footer / margin number in a loop, e.g.
// `<p>8 8 8 8 8 8 8 8</p>` or `<p>25 25 25 25 25</p>`. These are
// almost always OCR noise from page numbers — drop them.
function stripFooterNoise(md: string): string {
  return md
    .split("\n")
    .filter((line) => {
      const trimmed = line.trim();
      if (!trimmed) return true;
      // Line is a single token repeated 4+ times, possibly with
      // spaces: "8 8 8 8 8" / "25 25 25 25" / "...... ......".
      const tokens = trimmed.split(/\s+/);
      if (tokens.length >= 4) {
        const first = tokens[0];
        if (first.length <= 4 && tokens.every((t) => t === first)) {
          return false;
        }
      }
      return true;
    })
    // Collapse 3+ consecutive blank lines down to 2.
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
}

export function htmlToMarkdown(html: string): string {
  if (!html) return "";
  const md = td.turndown(html);
  return stripFooterNoise(md).trim();
}
