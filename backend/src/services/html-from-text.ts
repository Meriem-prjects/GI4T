// Convert raw PyMuPDF / extracted text into a clean HTML body with
// hierarchical headings (<h1>/<h2>) inferred from common Tunisian
// legal-document markers (Arabic + French).
//
// Heuristic only — best-effort. Anything not matching a heading pattern
// becomes a `<p>` paragraph. The editor (CKEditor with H1/H2 buttons)
// is the user-facing way to fix any mis-detected heading.
//
// When the input already looks like Markdown (Mistral OCR output), we
// hand off to `markdownToHtml()` which uses the `marked` parser to
// preserve the FULL document structure (headings, lists, emphasis,
// blockquotes, tables) instead of flattening to <p>.

import { markdownToHtml } from "./markdown-to-html.js";

const ESC: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
};
function escapeHtml(s: string): string {
  return s.replace(/[&<>]/g, (c) => ESC[c]);
}

// Detect Markdown structure: at least one of the typical OCR-emitted
// patterns (heading, list, emphasis, blockquote, table). When true we
// route through the full Markdown parser instead of the legacy
// paragraph-only fallback.
function looksLikeMarkdown(text: string): boolean {
  if (!text) return false;
  // Heading anywhere
  if (/(?:^|\n)#{1,6}\s+\S/.test(text)) return true;
  // Bullet list (- or * at line start)
  if (/(?:^|\n)\s*[-*]\s+\S/.test(text)) return true;
  // Numbered list (1. / 2. ...)
  if (/(?:^|\n)\s*\d+\.\s+\S/.test(text)) return true;
  // Blockquote
  if (/(?:^|\n)>\s+\S/.test(text)) return true;
  // Table separator row
  if (/\|\s*-{3,}\s*\|/.test(text)) return true;
  // Bold or italic (require text on both sides to avoid false positives)
  if (/\*\*[^\s*][^*]*[^\s*]\*\*/.test(text)) return true;
  return false;
}

// ───────────────── normalisation for matching only ─────────────────

// Build a "compact" view of a line (no whitespace, no Arabic
// diacritics, alef variants folded) that lets us match heading
// patterns even when PyMuPDF inserted stray spaces inside words.
// We return the compact string AND the original line untouched —
// the original is what we render.
function compactArabic(line: string): string {
  let out = "";
  for (let i = 0; i < line.length; i++) {
    const code = line.charCodeAt(i);
    if ((code >= 0x064b && code <= 0x065f) || code === 0x0670 || code === 0x0640) continue;
    let c = line[i];
    if (code === 0x0622 || code === 0x0623 || code === 0x0625) c = "ا";
    else if (code === 0x0649) c = "ي";
    if (/\s/.test(c)) continue;
    out += c;
  }
  return out;
}

// Arabic ordinals (with and without taa marbuta), no leading ال.
const AR_ORDINALS = [
  "اول", "اولي", "اولى",
  "ثاني", "ثانية",
  "ثالث", "ثالثة",
  "رابع", "رابعة",
  "خامس", "خامسة",
  "سادس", "سادسة",
  "سابع", "سابعة",
  "ثامن", "ثامنة",
  "تاسع", "تاسعة",
  "عاشر", "عاشرة",
];
const AR_ORD_GROUP = AR_ORDINALS.map((o) => `ال${o}`).join("|");

// Patterns matched against the compact form of a line.
// We keep them anchored ^ to make sure the heading is at the start of
// the line (legal docs always put numerals at the line head).
const RE_AR_PART = new RegExp(`^الجزء(?:${AR_ORD_GROUP})`);
const RE_AR_SECTION = new RegExp(`^الفرع(?:${AR_ORD_GROUP})`);
const RE_AR_INTRO = /^(?:المقدمة|مقدمة)/;
const RE_AR_CONCLUSION = /^(?:الخاتمة|خاتمة)/;
const RE_AR_BIBLIO = /^قائمة[؀-ۿ]{0,20}(?:المراجع|المصادر)/;

// French markers — match the raw line directly (case-insensitive),
// allow optional roman numerals / letters after the keyword.
const RE_FR_H1 = /^(?:partie|titre|chapitre|introduction|conclusion|bibliographie|annexes?)\b/i;
const RE_FR_H2 = /^(?:section|sous[- ]?partie|paragraphe)\b/i;

// A "heading-like" line is short, doesn't end with a sentence
// terminator, and matches one of the patterns above. We cap length to
// avoid grabbing whole paragraphs that happen to start with "Partie".
const HEADING_MAX_CHARS = 200;

export interface DetectedHeading {
  level: 1 | 2;
  raw: string;
}

export function detectHeading(rawLine: string): DetectedHeading | null {
  const trimmed = rawLine.trim();
  if (trimmed.length === 0 || trimmed.length > HEADING_MAX_CHARS) return null;
  // Compact Arabic view (does nothing useful for French — French keeps spaces).
  const compact = compactArabic(trimmed);
  if (RE_AR_PART.test(compact)) return { level: 1, raw: trimmed };
  if (RE_AR_INTRO.test(compact)) return { level: 1, raw: trimmed };
  if (RE_AR_CONCLUSION.test(compact)) return { level: 1, raw: trimmed };
  if (RE_AR_BIBLIO.test(compact)) return { level: 1, raw: trimmed };
  if (RE_AR_SECTION.test(compact)) return { level: 2, raw: trimmed };
  if (RE_FR_H1.test(trimmed)) return { level: 1, raw: trimmed };
  if (RE_FR_H2.test(trimmed)) return { level: 2, raw: trimmed };
  return null;
}

// ───────────────── Arabic post-processing (pdf-parse cleanup) ─────────────────

/**
 * pdf-parse on Tunisian legal PDFs frequently emits Arabic glyphs
 * with stray spaces between them ("م ن ا ف س ة" instead of "منافسة")
 * because each glyph is positioned independently and the parser
 * mistakes the gaps for word boundaries.
 *
 * Heuristic: any run of 3+ consecutive SINGLE Arabic characters
 * separated by single spaces is almost certainly a fragmented word
 * and can be glued back. Conservative — won't trigger on normal text.
 *
 * Also collapses common 2-char fragmentation patterns at line boundaries.
 */
function joinFragmentedArabic(text: string): string {
  // Pass 1 — sequences of single Arabic chars separated by single
  // spaces ("م ن ا ف س ة") almost certainly come from a fragmented
  // word. Glue them.
  const re1 = /(?:[؀-ۿݐ-ݿ]\s){2,}[؀-ۿݐ-ݿ]/g;
  let out = text.replace(re1, (m) => m.replace(/\s+/g, ""));

  // Pass 2 — scan line by line. If a line contains a majority of
  // very short Arabic tokens (1-2 chars) — typical of glyph-by-glyph
  // fragmentation — glue all consecutive short tokens together.
  out = out
    .split("\n")
    .map((line) => {
      const tokens = line.split(/(\s+)/); // keep spaces
      const arabicShort = tokens.filter(
        (t) => /^[؀-ۿݐ-ݿ]{1,2}$/.test(t),
      ).length;
      const arabicTotal = tokens.filter((t) => /[؀-ۿݐ-ݿ]/.test(t)).length;
      if (arabicTotal >= 5 && arabicShort / arabicTotal > 0.4) {
        // Aggressive: this line is heavily fragmented. Glue consecutive
        // Arabic-only tokens (any length) that are separated by single
        // spaces.
        return line.replace(
          /([؀-ۿݐ-ݿ]+)(?:\s+([؀-ۿݐ-ݿ]+))+/g,
          (match) => match.replace(/\s+/g, ""),
        );
      }
      return line;
    })
    .join("\n");

  return out;
}

// ───────────────── main converter ─────────────────

/**
 * Convert raw text (PyMuPDF output, possibly with `\n` separated
 * paragraphs) into HTML. Heading lines become <h1>/<h2>; everything
 * else becomes <p>.
 *
 * Blank lines split paragraphs. A single `\n` inside a paragraph is
 * collapsed to a space (PyMuPDF often wraps mid-paragraph).
 */
// Mistral OCR returns Markdown. Parse "# " / "## " / "### " / "#### "
// prefixes as h1/h2/h3 (we cap at h3 since CKEditor only exposes
// H1/H2/H3 in our toolbar). Returns null if the line isn't a Markdown
// heading.
function parseMarkdownHeading(line: string): { level: 1 | 2 | 3; text: string } | null {
  const m = line.match(/^(#{1,6})\s+(.+?)\s*$/);
  if (!m) return null;
  const level = Math.min(m[1].length, 3) as 1 | 2 | 3;
  return { level, text: m[2] };
}

export function htmlFromText(raw: string): string {
  if (!raw) return "";
  // Normalise line endings.
  let text = raw.replace(/\r\n?/g, "\n");
  // Glue back Arabic glyphs that pdf-parse fragmented with spaces.
  text = joinFragmentedArabic(text);
  // If the text already looks like Markdown (Mistral OCR output: `#` /
  // `##` / `**bold**` / `- list` / `> quote` / tables), route it
  // through the full Markdown parser so the PDF's structure (headings,
  // lists, emphasis, tables, blockquotes) survives intact.
  if (looksLikeMarkdown(text)) {
    return markdownToHtml(text);
  }
  // Split into paragraph blocks on blank lines.
  const blocks = text.split(/\n{2,}/);
  const out: string[] = [];
  for (const blockRaw of blocks) {
    const block = blockRaw.trim();
    if (!block) continue;
    const lines = block.split("\n");
    // ── single-line block ──
    if (lines.length === 1) {
      // Markdown heading from Mistral OCR.
      const md = parseMarkdownHeading(lines[0]);
      if (md) {
        out.push(`<h${md.level}>${escapeHtml(md.text)}</h${md.level}>`);
        continue;
      }
      // Heuristic heading (Arabic / French markers).
      const h = detectHeading(lines[0]);
      if (h) {
        out.push(`<h${h.level}>${escapeHtml(h.raw)}</h${h.level}>`);
        continue;
      }
    } else {
      // Multi-line block: if the FIRST line is a heading (Markdown or
      // heuristic), emit it then the rest as a paragraph.
      const first = lines[0].trim();
      const md = parseMarkdownHeading(first);
      if (md) {
        out.push(`<h${md.level}>${escapeHtml(md.text)}</h${md.level}>`);
        const rest = lines.slice(1).join(" ").trim();
        if (rest) out.push(`<p>${escapeHtml(rest)}</p>`);
        continue;
      }
      const h = detectHeading(first);
      if (h) {
        out.push(`<h${h.level}>${escapeHtml(h.raw)}</h${h.level}>`);
        const rest = lines.slice(1).join(" ").trim();
        if (rest) out.push(`<p>${escapeHtml(rest)}</p>`);
        continue;
      }
    }
    // Plain paragraph (collapse intra-block newlines to spaces).
    const collapsed = block.replace(/\s*\n\s*/g, " ").trim();
    out.push(`<p>${escapeHtml(collapsed)}</p>`);
  }
  return out.join("\n");
}
