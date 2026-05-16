// Cuts a raw PyMuPDF text into structured blocks using anchors returned
// by the AI. The AI never rewrites content — it just tells us WHERE to
// cut. We re-anchor inside the original text using a normalised lookup
// (diacritics removed, alef variants unified, whitespace collapsed) so
// imperfect transcription of the anchor by the AI still resolves.

/**
 * Normalise an Arabic/French string for robust substring search:
 *  - strips Arabic diacritics (tashkeel + tatweel)
 *  - unifies alef variants (إ أ آ → ا) and ya (ى → ي)
 *  - collapses any whitespace to single space
 * Returns the normalised string AND an index map that lets us translate
 * a position in the normalised string back to a position in the original.
 */
export function normalizeWithMap(s: string): { normalized: string; indexMap: number[] } {
  let normalized = "";
  const indexMap: number[] = [];
  let lastWasSpace = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    const code = c.charCodeAt(0);
    // Tashkeel (064B-065F), Superscript Alef (0670), Tatweel (0640)
    if ((code >= 0x064b && code <= 0x065f) || code === 0x0670 || code === 0x0640) continue;
    let mapped = c;
    // Normalise alef variants → bare alef
    if (code === 0x0622 || code === 0x0623 || code === 0x0625) mapped = "ا";
    // Normalise alef maksura (ى) → ya (ي)
    else if (code === 0x0649) mapped = "ي";
    // Collapse whitespace
    if (/\s/.test(mapped)) {
      if (lastWasSpace) continue;
      mapped = " ";
      lastWasSpace = true;
    } else {
      lastWasSpace = false;
    }
    indexMap.push(i);
    normalized += mapped;
  }
  return { normalized, indexMap };
}

/**
 * Find the first occurrence of `needle` inside `haystack` after applying
 * normalisation to both. Returns the position in the ORIGINAL haystack,
 * or -1 if not found.
 */
export function findOriginalPos(haystack: string, needle: string | null | undefined): number {
  if (!needle || !needle.trim()) return -1;
  const hay = normalizeWithMap(haystack);
  const nd = normalizeWithMap(needle);
  if (!nd.normalized.trim()) return -1;
  const pos = hay.normalized.indexOf(nd.normalized.trim());
  if (pos === -1) return -1;
  return hay.indexMap[pos] ?? -1;
}

export interface SectionMarker {
  anchor_text?: string;
  anchor_first_words?: string;
  title_ar?: string;
  title?: string;
  level?: number;
  block_kind?: string; // for jurisprudence/commentaire
  label_ar?: string;
}

export interface AnalysePayload {
  intro_anchor?: string | null;
  conclusion_anchor?: string | null;
  biblio_anchor?: string | null;
  section_markers?: SectionMarker[];
}

export interface AnalyseSlices {
  introduction: string;
  conclusion: string;
  bibliography: string;
  sections: Array<{ title: string; level: number; content: string }>;
}

/**
 * For each marker, try anchor_text first, then anchor_first_words.
 * Returns positions in the original text (or -1 if not found).
 */
function locateMarkers(text: string, markers: SectionMarker[]): number[] {
  return markers.map((m) => {
    let pos = findOriginalPos(text, m.anchor_text);
    if (pos === -1) pos = findOriginalPos(text, m.anchor_first_words);
    return pos;
  });
}

export function sliceAnalyse(text: string, payload: AnalysePayload): AnalyseSlices {
  const introPos = findOriginalPos(text, payload.intro_anchor);
  const conclusionPos = findOriginalPos(text, payload.conclusion_anchor);
  const biblioPos = findOriginalPos(text, payload.biblio_anchor);
  const markers = payload.section_markers ?? [];
  const markerPositions = locateMarkers(text, markers);

  const docEnd = biblioPos !== -1 ? biblioPos : text.length;

  // First valid marker position (for intro end)
  const firstMarkerPos = markerPositions.find((p) => p !== -1);
  const introStart = introPos !== -1 ? introPos : 0;
  const introEnd = firstMarkerPos ?? (conclusionPos !== -1 ? conclusionPos : docEnd);

  const introduction = text.slice(introStart, introEnd).trim();

  const sections: Array<{ title: string; level: number; content: string }> = [];
  for (let i = 0; i < markers.length; i++) {
    const start = markerPositions[i];
    if (start === -1) continue;
    // Next valid marker position strictly after start
    let end = docEnd;
    for (let j = i + 1; j < markerPositions.length; j++) {
      if (markerPositions[j] !== -1 && markerPositions[j]! > start) {
        end = markerPositions[j]!;
        break;
      }
    }
    if (conclusionPos !== -1 && conclusionPos > start && conclusionPos < end) {
      end = conclusionPos;
    }
    sections.push({
      title: markers[i].title_ar ?? markers[i].title ?? "",
      level: markers[i].level ?? 1,
      content: text.slice(start, end).trim(),
    });
  }

  const conclusion = conclusionPos !== -1 ? text.slice(conclusionPos, docEnd).trim() : "";
  const bibliography = biblioPos !== -1 ? text.slice(biblioPos).trim() : "";

  return { introduction, conclusion, bibliography, sections };
}

export interface JurisprudencePayload {
  section_markers?: SectionMarker[];
  biblio_anchor?: string | null;
}

export interface JurisprudenceSlices {
  facts: string;
  legalProblem: string;
  proposedSolution: string;
  bibliography: string;
}

export function sliceJurisprudence(
  text: string,
  payload: JurisprudencePayload,
): JurisprudenceSlices {
  const markers = payload.section_markers ?? [];
  const positions = locateMarkers(text, markers);
  const biblioPos = findOriginalPos(text, payload.biblio_anchor);
  const docEnd = biblioPos !== -1 ? biblioPos : text.length;

  // Build a kind→[start, end] map. Multiple markers of same kind get concatenated.
  const slices: Record<string, string[]> = {};
  for (let i = 0; i < markers.length; i++) {
    if (positions[i] === -1) continue;
    const kind = markers[i].block_kind ?? "proposed_solution";
    let end = docEnd;
    for (let j = i + 1; j < positions.length; j++) {
      if (positions[j] !== -1 && positions[j]! > positions[i]!) {
        end = positions[j]!;
        break;
      }
    }
    const chunk = text.slice(positions[i], end).trim();
    if (!slices[kind]) slices[kind] = [];
    slices[kind].push(chunk);
  }

  return {
    facts: (slices.facts ?? []).join("\n\n"),
    legalProblem: (slices.legal_problem ?? []).join("\n\n"),
    proposedSolution: (slices.proposed_solution ?? []).join("\n\n"),
    bibliography: biblioPos !== -1 ? text.slice(biblioPos).trim() : "",
  };
}

export interface CommentairePayload {
  section_markers?: SectionMarker[];
  biblio_anchor?: string | null;
}

export interface CommentaireSlices {
  ruling: string;
  observations: string;
  bibliography: string;
}

export function sliceCommentaire(
  text: string,
  payload: CommentairePayload,
): CommentaireSlices {
  const markers = payload.section_markers ?? [];
  const positions = locateMarkers(text, markers);
  const biblioPos = findOriginalPos(text, payload.biblio_anchor);
  const docEnd = biblioPos !== -1 ? biblioPos : text.length;

  const slices: Record<string, string[]> = {};
  for (let i = 0; i < markers.length; i++) {
    if (positions[i] === -1) continue;
    const kind = markers[i].block_kind ?? "observations";
    let end = docEnd;
    for (let j = i + 1; j < positions.length; j++) {
      if (positions[j] !== -1 && positions[j]! > positions[i]!) {
        end = positions[j]!;
        break;
      }
    }
    const chunk = text.slice(positions[i], end).trim();
    if (!slices[kind]) slices[kind] = [];
    slices[kind].push(chunk);
  }

  return {
    ruling: (slices.ruling ?? []).join("\n\n"),
    observations: (slices.observations ?? []).join("\n\n"),
    bibliography: biblioPos !== -1 ? text.slice(biblioPos).trim() : "",
  };
}
