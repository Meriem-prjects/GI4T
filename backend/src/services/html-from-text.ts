// Convert raw PyMuPDF / extracted text into a clean HTML body with
// hierarchical headings (<h1>/<h2>) inferred from common Tunisian
// legal-document markers (Arabic + French).
//
// Heuristic only — best-effort. Anything not matching a heading pattern
// becomes a `<p>` paragraph. The editor (CKEditor with H1/H2 buttons)
// is the user-facing way to fix any mis-detected heading.

const ESC: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
};
function escapeHtml(s: string): string {
  return s.replace(/[&<>]/g, (c) => ESC[c]);
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

// ───────────────── main converter ─────────────────

/**
 * Convert raw text (PyMuPDF output, possibly with `\n` separated
 * paragraphs) into HTML. Heading lines become <h1>/<h2>; everything
 * else becomes <p>.
 *
 * Blank lines split paragraphs. A single `\n` inside a paragraph is
 * collapsed to a space (PyMuPDF often wraps mid-paragraph).
 */
export function htmlFromText(raw: string): string {
  if (!raw) return "";
  // Normalise line endings.
  const text = raw.replace(/\r\n?/g, "\n");
  // Split into paragraph blocks on blank lines.
  const blocks = text.split(/\n{2,}/);
  const out: string[] = [];
  for (const blockRaw of blocks) {
    const block = blockRaw.trim();
    if (!block) continue;
    // If the block is a single line and looks like a heading → render as heading.
    const lines = block.split("\n");
    if (lines.length === 1) {
      const h = detectHeading(lines[0]);
      if (h) {
        out.push(`<h${h.level}>${escapeHtml(h.raw)}</h${h.level}>`);
        continue;
      }
    } else {
      // Multi-line block: if the FIRST line is a heading, emit it then
      // the rest as a paragraph.
      const first = lines[0].trim();
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
