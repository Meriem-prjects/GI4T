// Regex-based segmentation for Tunisian legal analyses.
// Input: clean OCR text (typically from Mistral OCR).
// Output: structured HTML body (<h1>/<h2>/<p>) with the keywords block
// and the bibliography block extracted to separate fields.
//
// Markers detected (tolerant to diacritics, alef variants, intra-word
// spaces inserted by OCR, leading markdown prefixes like # ## > *):
//   - الكلمات المفاتيح / كلمات مفاتيح     → keywords block
//   - مقدمة / المقدمة                     → <h1> Introduction
//   - الجزء + ordinal                     → <h1> Part
//   - الفرع + ordinal                     → <h2> Section
//   - خاتمة / الخاتمة                     → <h1> Conclusion
//   - قائمة [...] المراجع / المصادر       → bibliography block
//
// Anti-false-positive guardrails:
//   - Markers are matched at line starts (^ or after newline) so a
//     reference like "...في الجزء الأول من قانون..." mid-sentence isn't
//     captured.
//   - Lookahead drops "الجزء N من ..." references (citations, not markers).
//   - Ordinals are sorted longest-first so "الحادي عشر" matches before
//     "الحادي".

import { markdownToHtml } from "./markdown-to-html.js";

const HTML_ESC: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;" };
function escapeHtml(s: string): string {
  return s.replace(/[&<>]/g, (c) => HTML_ESC[c]);
}

// ───────────────── Arabic-Indic digit conversion ─────────────────

const AR_INDIC_TO_LATIN: Record<string, string> = {
  "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
  "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
};
export function arIndicToLatin(s: string): string {
  return s.replace(/[٠-٩]/g, (c) => AR_INDIC_TO_LATIN[c] ?? c);
}

// ───────────────── normalisation ─────────────────

/**
 * Build a whitespace-stripped, diacritic-free view of the input
 * (`compact`) together with an index map so any position in `compact`
 * can be mapped back to the original text.
 */
function normalizeForMatch(text: string): {
  compact: string;
  map: number[];
} {
  let compact = "";
  const map: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    // Strip tashkeel + tatweel + superscript alef
    if ((code >= 0x064b && code <= 0x065f) || code === 0x0670 || code === 0x0640) continue;
    let c = text[i];
    // Fold alef variants → bare alef
    if (code === 0x0622 || code === 0x0623 || code === 0x0625) c = "ا";
    // Alef maksura → ya
    else if (code === 0x0649) c = "ي";
    if (/\s/.test(c)) continue;
    map.push(i);
    compact += c;
  }
  return { compact, map };
}

// Arabic ordinals (with leading ال), longest-first so multi-word forms
// like "الحادي عشر" match before "الحادي".
const ORDINALS = [
  "الحاديعشر", "الحاديةعشرة",
  "الثانيعشر", "الثانيةعشرة",
  "الثالثعشر", "الرابععشر", "الخامسعشر",
  "السادسعشر", "السابععشر", "الثامنعشر", "التاسععشر",
  "العشرون", "العشرين", "الثلاثون", "الثلاثين",
  "الاول", "الاولي", "الاولى",
  "الثاني", "الثانية",
  "الثالث", "الثالثة",
  "الرابع", "الرابعة",
  "الخامس", "الخامسة",
  "السادس", "السادسة",
  "السابع", "السابعة",
  "الثامن", "الثامنة",
  "التاسع", "التاسعة",
  "العاشر", "العاشرة",
].sort((a, b) => b.length - a.length);
const ORD_GROUP = ORDINALS.join("|");

// Markers matched on compact text (no whitespace, no diacritics).
// `NEXT_NOT_ARABIC` substitutes for the missing Arabic word boundary.
const NEXT_NOT_ARABIC = "(?![\\u0600-\\u06FF\\u0750-\\u077F0-9])";
const RE_PART = new RegExp(`(?:الجزء)(?:${ORD_GROUP}|[0-9]+)${NEXT_NOT_ARABIC}`, "g");
const RE_SECTION = new RegExp(`(?:الفرع)(?:${ORD_GROUP}|[0-9]+)${NEXT_NOT_ARABIC}`, "g");
const RE_INTRO = new RegExp(`(?:المقدمة|مقدمة)${NEXT_NOT_ARABIC}`, "g");
const RE_CONCLUSION = new RegExp(`(?:الخاتمة|خاتمة)${NEXT_NOT_ARABIC}`, "g");
const RE_BIBLIO = new RegExp(
  `قائمة[\\u0600-\\u06FF]{0,20}(?:المراجع|المصادر)${NEXT_NOT_ARABIC}`,
  "g",
);
const RE_KEYWORDS = new RegExp(
  `(?:الكلماتالمفاتيح|الكلماتالمفتاحية|الكلماتالدالة|كلماتمفاتيح|كلماتمفتاحية)`,
  "g",
);

// ───────────────── marker scan ─────────────────

interface Hit {
  origStart: number;
  origEnd: number;
  kind: "intro" | "part" | "section" | "conclusion" | "biblio" | "keywords";
  level: 1 | 2;
}

// Lookahead in ORIGINAL text after a marker. If the next ~20 chars
// start with من / في / إلى / على / لـ / حسب / كما, the match is a
// reference inside a sentence, not a structural heading.
//
// We also require the marker to be near a line start in the original
// text (allowing markdown prefixes `#` / `##` / `*` / `-` / `>`) to
// further reduce false positives on inline references.
function isAtLineStart(text: string, pos: number): boolean {
  // Walk backwards over allowed-prefix chars.
  let i = pos - 1;
  while (i >= 0) {
    const c = text[i];
    if (c === " " || c === "\t" || c === "#" || c === "*" || c === ">" || c === "-" || c === ".") {
      i--;
      continue;
    }
    if (c === "\n" || c === "\r") return true;
    return false;
  }
  return true; // start of file
}

function isReferenceAfter(text: string, pos: number, kind: Hit["kind"]): boolean {
  // Skip our own marker chars first (we want to look at what FOLLOWS
  // the marker text, not the marker itself). The caller passes
  // `origEnd`, which is already past the marker.
  const ahead = text.slice(pos, pos + 30).trimStart();
  // Whitelist Arabic prepositions/conjunctions that signal a reference.
  const REF_AHEAD = /^(?:من|في|إلى|على|الـ?ـ|حسب|كما|كذلك|عبر|وبعد|قبل)\b/;
  if (REF_AHEAD.test(ahead)) {
    // For intro/conclusion the bare word is rarely followed by these
    // prepositions in a structural heading. For parts/sections it's
    // common citation pattern: "الجزء الأول من القانون".
    if (kind === "part" || kind === "section") return true;
    // For intro/conclusion: still drop if clearly mid-sentence.
    if (kind === "intro" || kind === "conclusion") {
      return /^(?:من|في|إلى|على)\b/.test(ahead);
    }
  }
  return false;
}

function scan(text: string, compact: string, map: number[]): Hit[] {
  const hits: Hit[] = [];
  const push = (re: RegExp, kind: Hit["kind"], level: 1 | 2) => {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(compact))) {
      const origStart = map[m.index];
      const lastIdx = Math.min(m.index + m[0].length - 1, map.length - 1);
      const origEnd = map[lastIdx] + 1;
      if (origStart === undefined || origEnd === undefined) {
        if (m.index === re.lastIndex) re.lastIndex++;
        continue;
      }
      // Anti-false-positive #1: marker must be at (or near) a line start.
      if (!isAtLineStart(text, origStart)) {
        if (m.index === re.lastIndex) re.lastIndex++;
        continue;
      }
      // Anti-false-positive #2: drop mid-sentence references.
      if (isReferenceAfter(text, origEnd, kind)) {
        if (m.index === re.lastIndex) re.lastIndex++;
        continue;
      }
      hits.push({ origStart, origEnd, kind, level });
      if (m.index === re.lastIndex) re.lastIndex++;
    }
  };
  push(RE_INTRO, "intro", 1);
  push(RE_PART, "part", 1);
  push(RE_SECTION, "section", 2);
  push(RE_CONCLUSION, "conclusion", 1);
  push(RE_BIBLIO, "biblio", 1);
  push(RE_KEYWORDS, "keywords", 1);

  // Dedup overlapping hits.
  hits.sort((a, b) => a.origStart - b.origStart);
  const deduped: Hit[] = [];
  for (const h of hits) {
    const prev = deduped[deduped.length - 1];
    if (prev && h.origStart < prev.origEnd) continue;
    deduped.push(h);
  }
  return deduped;
}

// ───────────────── helpers ─────────────────

function endOfLine(text: string, from: number): number {
  const i = text.indexOf("\n", from);
  return i === -1 ? text.length : i;
}

function parseKeywordsBlock(rawBlock: string): string[] {
  const cleaned = rawBlock
    .replace(/^[^\n:]*[:：]/, "")
    .replace(/^\s*[#*>-]+\s*/, "")
    .trim();
  if (!cleaned) return [];
  const parts = cleaned
    .split(/\s*[-–—/]\s*|[،;,]\s*|\n+/)
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter((s) => s.length >= 2 && s.length <= 100);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of parts) {
    const k = p.toLowerCase();
    if (!seen.has(k)) {
      seen.add(k);
      out.push(p);
    }
    if (out.length >= 30) break;
  }
  return out;
}

function parseBibliographyBlock(rawBlock: string): string {
  const cleaned = rawBlock
    .replace(/^[^\n:]*[:：]/, "")
    .replace(/^\s*[#*>-]+\s*/, "")
    .trim();
  if (!cleaned) return "";
  const entries: string[] = [];
  for (const p of cleaned.split(/\n\s*\n+/)) {
    const collapsed = p.replace(/\s*\n\s*/g, " ").trim();
    if (collapsed.length >= 5) entries.push(collapsed);
  }
  if (entries.length === 0) {
    const parts = cleaned
      .split(/(?=(?:^|\s)[-–—]?\d{1,3}[-–—]\s)/)
      .map((s) => s.replace(/\s+/g, " ").trim())
      .filter((s) => s.length >= 5);
    if (parts.length > 1) return parts.join("\n");
  }
  return entries.join("\n");
}

function paragraphsToHtml(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  // Hand off to the Markdown parser so lists, emphasis, blockquotes,
  // tables and any intra-section sub-headings produced by Mistral OCR
  // survive — instead of being flattened to a single <p> per block.
  return markdownToHtml(trimmed);
}

// ───────────────── public API ─────────────────

export interface AnalyseSegmentationResult {
  keywords: string[];
  bibliography: string;
  bodyHtml: string;
}

/**
 * Segment a clean OCR text (Mistral OCR markdown or any plain text)
 * into a structured legal-analysis body.
 *
 * Returns:
 *   - keywords:   parsed from the "الكلمات المفاتيح :" block (empty if absent)
 *   - bibliography: parsed from the "قائمة المراجع" block (empty if absent)
 *   - bodyHtml:   HTML with <h1>/<h2> for مقدمة / الجزء* / الفرع* / خاتمة
 *                 and <p> for everything else. The keywords and
 *                 bibliography blocks are REMOVED from the body.
 */
export function segmentAnalyseText(rawText: string): AnalyseSegmentationResult {
  if (!rawText) return { keywords: [], bibliography: "", bodyHtml: "" };
  // Convert Arabic-Indic digits to Latin so numeric markers (e.g.
  // "الجزء 2") match the same regex as "الجزء الثاني".
  const text = arIndicToLatin(rawText);
  const { compact, map } = normalizeForMatch(text);
  const hits = scan(text, compact, map);

  const kwHit = hits.find((h) => h.kind === "keywords");
  const biblioHit = hits.find((h) => h.kind === "biblio");
  const bodyHits = hits.filter(
    (h) => h.kind === "intro" || h.kind === "part" || h.kind === "section" || h.kind === "conclusion",
  );

  // ── keywords block ──
  let keywords: string[] = [];
  if (kwHit) {
    const blockStart = kwHit.origEnd;
    const nextBody = bodyHits.find((h) => h.origStart > kwHit.origStart);
    const blockEnd = Math.min(
      nextBody ? nextBody.origStart : blockStart + 1500,
      blockStart + 1500,
    );
    keywords = parseKeywordsBlock(text.slice(blockStart, blockEnd));
  }

  // ── bibliography block ──
  let bibliography = "";
  if (biblioHit) {
    const blockStart = biblioHit.origEnd;
    bibliography = parseBibliographyBlock(text.slice(blockStart, blockStart + 8000));
  }

  // ── body HTML ──
  if (bodyHits.length === 0) {
    let body = text;
    if (biblioHit) body = body.slice(0, biblioHit.origStart);
    if (kwHit) {
      const kwEnd = kwHit.origEnd;
      const after = body.slice(kwEnd, kwEnd + 1500);
      const nl = after.search(/\n\s*\n/);
      const dropEnd = nl === -1 ? kwEnd + 800 : kwEnd + nl + 2;
      body = body.slice(0, kwHit.origStart) + "\n\n" + body.slice(dropEnd);
    }
    return { keywords, bibliography, bodyHtml: paragraphsToHtml(body) };
  }

  const skipRanges: Array<[number, number]> = [];
  if (kwHit) {
    const blockStart = kwHit.origStart;
    const nextBody = bodyHits.find((h) => h.origStart > kwHit.origStart);
    const blockEnd = nextBody ? nextBody.origStart : kwHit.origEnd + 1500;
    skipRanges.push([blockStart, blockEnd]);
  }
  if (biblioHit) {
    skipRanges.push([biblioHit.origStart, text.length]);
  }
  const inSkip = (pos: number) => skipRanges.some(([a, b]) => pos >= a && pos < b);

  const parts: string[] = [];
  for (let i = 0; i < bodyHits.length; i++) {
    const h = bodyHits[i];
    if (inSkip(h.origStart)) continue;
    const headingEnd = endOfLine(text, h.origStart);
    const titleLine = text
      .slice(h.origStart, headingEnd)
      .replace(/^[ \t#*>-]+/, "")
      .trim();
    parts.push(`<h${h.level}>${escapeHtml(titleLine)}</h${h.level}>`);
    let sliceEnd = i + 1 < bodyHits.length ? bodyHits[i + 1].origStart : text.length;
    for (const [a] of skipRanges) {
      if (a > headingEnd && a < sliceEnd) sliceEnd = a;
    }
    const content = text.slice(headingEnd, sliceEnd).trim();
    if (content) parts.push(paragraphsToHtml(content));
  }
  return { keywords, bibliography, bodyHtml: parts.join("\n") };
}
