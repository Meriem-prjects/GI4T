// Pure regex/heuristic segmentation for Tunisian legal analyses.
// Zero AI call. Reads raw PyMuPDF text and extracts:
//  - title, author, author_position
//  - keywords (after the "الكلمات المفاتيح" marker)
//  - introduction (text between keywords and first part marker)
//  - sections: hierarchical parts (الجزء) + subsections (الفرع)
//  - conclusion (after الخاتمة marker)
//  - bibliography (after قائمة المراجع marker)
//
// Tolerant to:
//   - tashkeel / diacritics anywhere
//   - alef variants (ا/أ/إ/آ), ya variants (ي/ى), ta marbuta (ة/ه)
//   - whitespace inserted in the middle of words by PyMuPDF
//   - line breaks anywhere

export interface AnalyseSection {
  title: string;
  level: 1 | 2 | 3;
  content: string;
}

export interface RegexAnalyseResult {
  title?: string;
  author?: string;
  authorPosition?: string;
  keywords: string[];
  introduction: string;
  sections: AnalyseSection[];
  conclusion: string;
  bibliography: string;
}

// ───────────────── normalisation ─────────────────

/** Build a normalised version of `s` plus an index map so we can map
 *  any position back to the original string. */
export function normalize(s: string): { norm: string; map: number[] } {
  let norm = "";
  const map: number[] = [];
  let lastSpace = false;
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i);
    // strip tashkeel + tatweel + superscript alef
    if ((code >= 0x064b && code <= 0x065f) || code === 0x0670 || code === 0x0640) continue;
    let c = s[i];
    // alef variants → bare alef
    if (code === 0x0622 || code === 0x0623 || code === 0x0625) c = "ا";
    // alef maksura → ya
    else if (code === 0x0649) c = "ي";
    // ta marbuta → ha (so "الخاتمة" matches "الخاتمه" if the OCR slipped)
    // Keep for now — Tunisian legal text uses ة consistently.
    if (/\s/.test(c)) {
      if (lastSpace) continue;
      c = " ";
      lastSpace = true;
    } else {
      lastSpace = false;
    }
    map.push(i);
    norm += c;
  }
  return { norm, map };
}

// ───────────────── ordinals + section header patterns ─────────────────

// Arabic ordinals from 1 to 15 + their feminine forms with/without ال
const ORDINALS = [
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
];
const ORDINAL_GROUP = ORDINALS.join("|");

// Header detectors run on NORMALISED text. They use word boundaries that
// work for Arabic (space before, space/colon/end after).
const RE_INTRO = new RegExp(
  "(?:^|\\s)(?:المقدمة|مقدمة)\\s*[:\\-—]?",
  "g",
);
const RE_PART = new RegExp(
  `(?:^|\\s)(?:الجزء)\\s+(?:${ORDINAL_GROUP})\\b`,
  "g",
);
const RE_SECTION = new RegExp(
  `(?:^|\\s)(?:الفرع)\\s+(?:${ORDINAL_GROUP})\\b`,
  "g",
);
const RE_CONCLUSION = new RegExp(
  "(?:^|\\s)(?:الخاتمة|خاتمة)\\s*[:\\-—]?",
  "g",
);
const RE_BIBLIO = new RegExp(
  "(?:^|\\s)(?:قائمة\\s+(?:في\\s+)?(?:بعض\\s+)?المراجع|قائمة\\s+المصادر|المراجع\\s+و(?:ال)?مصادر|المراجع\\s*:)",
  "g",
);
const RE_KEYWORDS = new RegExp(
  "(?:^|\\s)(?:الكلمات\\s+المفاتيح)\\s*[:：]?",
  "g",
);

// Helper: scan a regex globally on `norm`, map every match back to the
// original-text position and length. Returns positions sorted ascending.
function scan(re: RegExp, norm: string, map: number[]): Array<{ start: number; end: number; matchText: string }> {
  re.lastIndex = 0;
  const results: Array<{ start: number; end: number; matchText: string }> = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(norm))) {
    const matchStart = m.index + (m[0].match(/^\s+/)?.[0].length ?? 0);
    const matchEnd = m.index + m[0].length;
    const origStart = map[matchStart];
    const origEnd = map[Math.min(matchEnd - 1, map.length - 1)] + 1;
    if (origStart !== undefined && origEnd !== undefined) {
      results.push({ start: origStart, end: origEnd, matchText: m[0].trim() });
    }
    if (m.index === re.lastIndex) re.lastIndex++; // safety against zero-width loops
  }
  return results;
}

// Get end-of-line position in the ORIGINAL text starting at a given char.
function endOfLine(text: string, fromPos: number): number {
  const i = text.indexOf("\n", fromPos);
  return i === -1 ? text.length : i;
}

// ───────────────── metadata extraction ─────────────────

function extractTitleAuthorPosition(text: string, keywordsPos: number | null): {
  title?: string;
  author?: string;
  authorPosition?: string;
} {
  // Everything before the keywords marker (or first ~800 chars) is the
  // header block: title + author + author position.
  const block = (keywordsPos !== null ? text.slice(0, keywordsPos) : text.slice(0, 800)).trim();
  const lines = block.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return {};
  // First non-trivial line = title (skip empty/very short lines).
  const title = lines[0];
  // Author = next line that looks like a name (Arabic letters, length > 5)
  let author: string | undefined;
  let authorPosition: string | undefined;
  for (let i = 1; i < lines.length; i++) {
    const l = lines[i];
    if (/^\(.*\)$/.test(l)) {
      // Parenthesised → faculty / affiliation
      authorPosition = authorPosition ? `${authorPosition} ${l}` : l;
      continue;
    }
    if (!author && /[؀-ۿ]/.test(l)) {
      author = l;
      continue;
    }
    if (author && !authorPosition && /[؀-ۿ]/.test(l)) {
      authorPosition = l;
      continue;
    }
  }
  return { title, author, authorPosition };
}

function extractKeywords(text: string, keywordsPos: number | null, nextMarkerPos: number): string[] {
  if (keywordsPos === null) return [];
  // The keywords block runs from after the "الكلمات المفاتيح" header to
  // the next section marker (or 2000 chars later, whichever is closer).
  const blockEnd = Math.min(nextMarkerPos, keywordsPos + 3000);
  let block = text.slice(keywordsPos, blockEnd);
  // Strip the leading "الكلمات المفاتيح :" itself
  block = block.replace(/^[^\n:]*[:：]/, "").trim();
  // Split on " - " or " – " or "،" or new lines after a dash
  const parts = block
    .split(/\s*[-–—]\s*|[،,]\s*/)
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter((s) => s.length >= 2 && s.length <= 80 && /[؀-ۿ]/.test(s));
  // Dedup while preserving order
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of parts) {
    const k = p.replace(/[ً-ٰٟ]/g, "");
    if (!seen.has(k)) {
      seen.add(k);
      out.push(p);
    }
    if (out.length >= 25) break;
  }
  return out;
}

// ───────────────── master extractor ─────────────────

export function extractAnalyseStructure(rawText: string): RegexAnalyseResult {
  const { norm, map } = normalize(rawText);

  const introHits = scan(RE_INTRO, norm, map);
  const partHits = scan(RE_PART, norm, map);
  const sectionHits = scan(RE_SECTION, norm, map);
  const conclusionHits = scan(RE_CONCLUSION, norm, map);
  const biblioHits = scan(RE_BIBLIO, norm, map);
  const keywordHits = scan(RE_KEYWORDS, norm, map);

  const keywordsPos = keywordHits.length > 0 ? keywordHits[0].start : null;
  const biblioPos = biblioHits.length > 0 ? biblioHits[biblioHits.length - 1].start : -1;
  const conclusionPos = conclusionHits.length > 0
    ? conclusionHits[conclusionHits.length - 1].start
    : -1;
  const docEnd = biblioPos !== -1 ? biblioPos : rawText.length;

  // Header → title / author
  const { title, author, authorPosition } = extractTitleAuthorPosition(rawText, keywordsPos);

  // ─── Sections (hierarchical) ───────────────
  // Merge parts + subsections in document order
  const allMarkers = [
    ...partHits.map((h) => ({ ...h, level: 1 as const })),
    ...sectionHits.map((h) => ({ ...h, level: 2 as const })),
  ].sort((a, b) => a.start - b.start);

  // Intro = text between the keywords block and the first part marker.
  // If no part marker, intro stretches to the conclusion or biblio.
  const firstMarkerPos = allMarkers.length > 0 ? allMarkers[0].start : (conclusionPos !== -1 ? conclusionPos : docEnd);
  const introStart = introHits.length > 0
    ? introHits[0].start
    : (keywordsPos !== null
        ? endOfLine(rawText, keywordsPos)
        : 0);
  let introEnd = firstMarkerPos;
  // Skip the keywords block if it sits between intro marker and the first part.
  if (keywordsPos !== null && introStart < keywordsPos && keywordsPos < firstMarkerPos) {
    // Keywords are inline in the intro block — keep them in introduction (they're typically before the intro proper anyway)
  }
  const introduction = rawText.slice(introStart, introEnd).trim();

  // Build sections by slicing between markers
  const sections: AnalyseSection[] = [];
  for (let i = 0; i < allMarkers.length; i++) {
    const m = allMarkers[i];
    const headerEnd = endOfLine(rawText, m.start);
    const titleLine = rawText.slice(m.start, headerEnd).trim();
    let sliceEnd = docEnd;
    if (i + 1 < allMarkers.length) sliceEnd = allMarkers[i + 1].start;
    if (conclusionPos !== -1 && conclusionPos > m.start && conclusionPos < sliceEnd) {
      sliceEnd = conclusionPos;
    }
    const content = rawText.slice(headerEnd, sliceEnd).trim();
    sections.push({
      title: titleLine,
      level: m.level,
      content,
    });
  }

  // Conclusion text
  let conclusion = "";
  if (conclusionPos !== -1) {
    const conclusionHeaderEnd = endOfLine(rawText, conclusionPos);
    const end = biblioPos !== -1 && biblioPos > conclusionPos ? biblioPos : rawText.length;
    conclusion = rawText.slice(conclusionHeaderEnd, end).trim();
  }

  // Bibliography text
  let bibliography = "";
  if (biblioPos !== -1) {
    const biblioHeaderEnd = endOfLine(rawText, biblioPos);
    bibliography = rawText.slice(biblioHeaderEnd).trim();
  }

  // Keywords
  const keywords = extractKeywords(rawText, keywordsPos, firstMarkerPos);

  return {
    title,
    author,
    authorPosition,
    keywords,
    introduction,
    sections,
    conclusion,
    bibliography,
  };
}
