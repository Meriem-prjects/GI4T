import type { Request } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { saveFile } from "../../lib/storage.js";
import { extractTextFromFile } from "../../services/text-extraction.js";
import { chatCompletion } from "../../services/openai.js";
import { generateAndStoreEmbedding } from "../../services/embeddings.js";
import { publishJobProgress } from "../../realtime/progress.js";
import { htmlFromText } from "../../services/html-from-text.js";
import { markdownToHtml } from "../../services/markdown-to-html.js";
import { segmentAnalyseText } from "../../services/analyse-segmentation.js";
import { htmlToMarkdown } from "../../services/html-to-markdown.js";

const schema = z.object({
  filename: z.string(),
  fileBase64: z.string(),
  title: z.string().optional(),
  titleAr: z.string().optional(),
  language: z.string().default("fr"),
  categoryId: z.string().uuid().optional().nullable(),
  documentTypeId: z.string().uuid().optional().nullable(),
  // Optional: skip auto-processing for very large files
  skipProcessing: z.boolean().optional(),
  // Processing mode: "ai" (default, full pipeline = vision OCR +
  // metadata extraction + translation) or "direct" (PyMuPDF / pdf-parse
  // + regex-based heading detection, no AI, no translation).
  processingMode: z.enum(["ai", "direct"]).optional(),
});

export type ProcessingMode = "ai" | "direct";

export type DocKind = "jurisprudence" | "commentaire" | "blog" | "analyse" | "generic";

export function classifyDocType(documentTypeName: string | null | undefined): DocKind {
  const t = (documentTypeName ?? "").toLowerCase();
  if (t.includes("jurisprudence") || t.includes("جذاذة") || t.includes("فقه")) return "jurisprudence";
  if (t.includes("commentaire") || t.includes("تعليق")) return "commentaire";
  if (t.includes("blog") || t.includes("تدوين") || t.includes("مدونة")) return "blog";
  if (t.includes("analyse") || t.includes("opinion") || t.includes("تحليل")) return "analyse";
  return "generic";
}

function safeParseJson(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw);
  } catch {
    const m = raw.match(/\{[\s\S]*\}/);
    if (m) {
      try {
        return JSON.parse(m[0]);
      } catch {
        /* ignore */
      }
    }
    return {};
  }
}

/**
 * Build the structure+metadata prompt for a given document type.
 *
 * Returns:
 *   - metadata in the source language (title, author, summary, keywords,
 *     plus type-specific scalars like court / case_number / year)
 *   - `section_markers`: an array of {level, anchor_text} that tells the
 *     backend WHERE the headings start in the source text. The backend
 *     then slices the full source text around those anchors and emits
 *     proper <h1>/<h2>/<p> HTML without ever asking the model to
 *     reproduce the body verbatim (which it routinely truncates).
 */
function buildStructurePrompt(
  documentTypeName: string | null | undefined,
  sourceLang: "fr" | "ar" | "auto",
): string {
  const kind = classifyDocType(documentTypeName);
  const lang = sourceLang === "auto" ? "ar" : sourceLang;
  const suf = lang === "ar" ? "_ar" : "";
  const langName = lang === "ar" ? "ARABE" : "FRANÇAIS";

  const anchorsRules = `RÈGLES POUR section_markers (TRÈS IMPORTANT) :
- Repère TOUS les titres structurels du document dans l'ordre où ils apparaissent.
- Niveau 1 (level: 1) : Introduction (مقدمة), Conclusion (خاتمة), Bibliographie / Références (قائمة المراجع, قائمة في المراجع), Partie majeure (الجزء الأول/الثاني/الثالث), Chapitre.
- Niveau 2 (level: 2) : Section / Sous-partie (الفرع الأول/الثاني/الثالث), titres de paragraphe.
- Pour chaque titre, retourne anchor_text = la ligne EXACTE telle qu'elle apparaît dans le texte source, sans la reformuler ni la traduire. C'est cette chaîne que le backend va rechercher pour découper le texte.
- N'invente PAS de titres. Si le document n'a pas de structure hiérarchique, retourne section_markers: [].
- Si un ancrage est tronqué dans le PDF (lettres collées, espaces parasites), recopie-le EXACTEMENT tel quel — le backend gère la recherche tolérante.
- Ne renvoie PAS le titre du document comme premier marqueur — le titre vit dans le champ "title".`;

  const commonRules = `RÈGLES MÉTADONNÉES :
1. Réponds UNIQUEMENT avec un JSON strict (mode response_format=json_object).
2. Tu travailles dans la langue source : ${langName}. NE TRADUIS PAS les métadonnées.
3. Si un champ est introuvable, mets null (ou [] pour un tableau).
4. keywords${suf} : 8 à 15 chaînes, jamais des nombres.
5. summary${suf} : 60 à 120 mots maximum, pas plus.
6. year : entier (pas une chaîne).`;

  const baseMetadata = `  "title${suf}": "...",
  "subtitle${suf}": "...",
  "author${suf}": "...",
  "summary${suf}": "...",
  "keywords${suf}": ["..."],
  "legalDomains${suf}": ["..."],
  "mainTopics${suf}": ["..."],
  "legalReferences${suf}": ["..."],
  "entities${suf}": ["..."],
  "dates${suf}": ["..."]`;

  const typeSpecific = (() => {
    switch (kind) {
      case "jurisprudence":
        return `,
  "court${suf}": "...",
  "court_level${suf}": "...",
  "court_category${suf}": "...",
  "case_number": "...",
  "year": 2024,
  "plaintiff${suf}": "...",
  "defendant${suf}": "...",
  "jurisdiction${suf}": "..."`;
      case "commentaire":
        return `,
  "court${suf}": "...",
  "case_number": "...",
  "year": 2024`;
      default:
        return "";
    }
  })();

  return `Tu es un analyseur expert de documents juridiques tunisiens en ${langName}.

${commonRules}

${anchorsRules}

Schéma JSON attendu :
{
${baseMetadata}${typeSpecific},
  "section_markers": [
    { "level": 1, "anchor_text": "مقدمة" },
    { "level": 1, "anchor_text": "الجزء الأول : تكريس حرّية تكوين الأحزاب والجمعيّات" },
    { "level": 2, "anchor_text": "الفرع الأول : الاستناد إلى الدستور" },
    { "level": 2, "anchor_text": "الفرع الثاني : ..." },
    { "level": 1, "anchor_text": "الجزء الثاني : ..." },
    { "level": 1, "anchor_text": "خاتمة" },
    { "level": 1, "anchor_text": "قائمة المراجع" }
  ]
}`;
}

// ───────────────── explicit bibliography extraction ─────────────────

/**
 * Scan the raw extracted text for a bibliography block
 * ("قائمة المراجع", "Bibliographie:", "Références:") and return a
 * newline-joined string with one reference per line. Returns null if
 * no marker is found.
 *
 * Detection heuristic: find the marker, take the rest of the document
 * up to the end (or up to ~3000 chars), split on common reference
 * separators (newlines, " - ", "،"), and join with `\n`.
 */
function extractBibliographyFromText(rawText: string): string | null {
  if (!rawText) return null;
  // Allow several words between "قائمة" and "المراجع" (e.g. "قائمة
  // في بعض المراجع", "قائمة في أهم المراجع", "قائمة من المراجع").
  // The character class includes both Arabic letters and whitespace.
  const markers = [
    /قائمة[\s؀-ۿ]{0,40}(?:المراجع|المصادر)\s*[:：]?/i,
    /Bibliographie\s*[:：]?/i,
    /R[ée]f[ée]rences?(?:\s+(?:bibliographiques?|cit[ée]es?))?\s*[:：]?/i,
    /Bibliography\s*[:：]?/i,
  ];
  let blockStart = -1;
  let markerLen = 0;
  for (const m of markers) {
    const match = rawText.match(m);
    if (match && match.index !== undefined) {
      // Take the LATEST marker (bibliography is usually at the end).
      if (match.index > blockStart) {
        blockStart = match.index;
        markerLen = match[0].length;
      }
    }
  }
  if (blockStart === -1) return null;
  const start = blockStart + markerLen;
  // Bibliography lives at the end of the doc — take everything that
  // follows the marker (caps avoid pathological cases).
  const tail = rawText.slice(start, start + 8000).trim();
  if (!tail) return null;

  // Split on DOUBLE newlines first (each entry is a paragraph that may
  // wrap onto 2-3 lines). Within each paragraph, collapse internal
  // newlines to spaces. This matches the typical Arabic bibliography
  // layout: "1- ref1...\nrest of ref1\n\n2- ref2...".
  const paragraphs = tail.split(/\n\s*\n+/);
  const entries: string[] = [];
  for (const p of paragraphs) {
    const collapsed = p.replace(/\s*\n\s*/g, " ").trim();
    if (!collapsed) continue;
    // If a paragraph contains MULTIPLE numbered items glued together,
    // split it. Numbered prefix is "N- " or "-N " (PyMuPDF sometimes
    // reverses the dash for RTL).
    if (/(?:^|\s)[-–—]?\d{1,3}[-–—]\s/.test(collapsed) && collapsed.length > 200) {
      const parts = collapsed.split(/(?=(?:^|\s)[-–—]?\d{1,3}[-–—]\s)/);
      for (const part of parts) {
        const t = part.trim();
        if (t.length >= 10) entries.push(t);
      }
    } else if (collapsed.length >= 10) {
      entries.push(collapsed);
    }
  }
  // If we got nothing useful (single huge paragraph), fall back to
  // splitting on " - " or "،".
  if (entries.length <= 1 && tail.length > 200) {
    const fallback = tail
      .split(/\s+[-–—]\s+|[،;]\s+/)
      .map((s) => s.replace(/\s+/g, " ").trim())
      .filter((s) => s.length >= 10);
    if (fallback.length > entries.length) {
      return fallback.join("\n");
    }
  }
  // Drop trailing entries that are just page numbers / digits.
  while (entries.length > 0 && /^[\s\d.\-–—]+$/.test(entries[entries.length - 1])) {
    entries.pop();
  }
  if (entries.length === 0) return null;
  return entries.join("\n");
}

// ───────────────── explicit keywords extraction ─────────────────

/**
 * Scan the raw extracted text for an explicit "keywords" block
 * ("الكلمات المفاتيح :", "Mots-clés :", "Keywords:" etc.) and return
 * the parsed list. Returns null when no marker is found — caller
 * should fall back to AI-generated keywords.
 */
function extractKeywordsFromText(rawText: string): string[] | null {
  if (!rawText) return null;
  // Marker variants the document may use. We accept both colon types and
  // optional leading "ال". Case-insensitive for French/English.
  const markers = [
    /(?:الكلمات\s*المفاتيح|كلمات\s*مفاتيح|الكلمات\s*المفتاحية|الكلمات\s*الدالة)\s*[:：]/i,
    /Mots[- ]?cl[ée]s\s*[:：]/i,
    /Keywords?\s*[:：]/i,
  ];
  let blockStart = -1;
  let markerLen = 0;
  for (const m of markers) {
    const match = rawText.match(m);
    if (match && match.index !== undefined) {
      if (blockStart === -1 || match.index < blockStart) {
        blockStart = match.index;
        markerLen = match[0].length;
      }
    }
  }
  if (blockStart === -1) return null;
  // Block runs from end of marker up to ~600 chars or first double-newline
  // (whichever comes first). Legal docs usually keep keywords on 1-3 lines.
  const start = blockStart + markerLen;
  const tail = rawText.slice(start, start + 800);
  const stopAt = tail.search(/\n\s*\n/);
  const block = (stopAt > 0 ? tail.slice(0, stopAt) : tail).trim();
  if (!block) return null;
  // Split on common separators: " - ", " – ", "،", ",", ";", "/"
  // (NOT on plain hyphen-without-spaces — that would split compound words).
  const parts = block
    .split(/\s*[-–—/]\s*|[،;,]\s*|\n+/)
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter((s) => s.length >= 2 && s.length <= 80);
  // Dedup while preserving order.
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of parts) {
    const k = p.toLowerCase();
    if (!seen.has(k)) {
      seen.add(k);
      out.push(p);
    }
    if (out.length >= 25) break;
  }
  return out.length >= 3 ? out : null;
}

// ───────────────── anchor-based HTML builder ─────────────────

const HTML_ESC: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;" };
function escapeHtml(s: string): string {
  return s.replace(/[&<>]/g, (c) => HTML_ESC[c]);
}

// Normalise a string for tolerant matching: strip whitespace, strip
// Arabic diacritics / tatweel, fold alef variants. Used to find an
// anchor in the source text even when PyMuPDF/pdf-parse inserted stray
// spaces or didn't normalise hamza.
function normalizeForMatch(s: string): string {
  let out = "";
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i);
    if ((code >= 0x064b && code <= 0x065f) || code === 0x0670 || code === 0x0640) continue;
    let c = s[i];
    if (code === 0x0622 || code === 0x0623 || code === 0x0625) c = "ا";
    else if (code === 0x0649) c = "ي";
    if (/\s/.test(c)) continue;
    out += c;
  }
  return out;
}

interface SectionMarker {
  level: 1 | 2;
  anchorText: string;
}

/**
 * Build a structured HTML body from raw text + AI-detected anchors.
 * Strategy:
 *   - Build a normalised version of the raw text and remember a map
 *     from normalised position → original position.
 *   - For each anchor, find its normalised form in the normalised text.
 *     Record the original-text position.
 *   - Sort by position, slice the raw text between anchor positions.
 *   - Emit <h{level}> for each anchor's line + <p> for each chunk.
 */
function buildBodyHtmlFromAnchors(
  rawText: string,
  markers: SectionMarker[],
): string {
  if (!rawText) return "";
  // Build normalised view + position map.
  let norm = "";
  const map: number[] = [];
  for (let i = 0; i < rawText.length; i++) {
    const code = rawText.charCodeAt(i);
    if ((code >= 0x064b && code <= 0x065f) || code === 0x0670 || code === 0x0640) continue;
    let c = rawText[i];
    if (code === 0x0622 || code === 0x0623 || code === 0x0625) c = "ا";
    else if (code === 0x0649) c = "ي";
    if (/\s/.test(c)) continue;
    map.push(i);
    norm += c;
  }

  // Find each marker's position in the original text.
  type Hit = { level: 1 | 2; start: number; lineEnd: number; titleLine: string };
  const hits: Hit[] = [];
  let searchFrom = 0;
  for (const m of markers) {
    const needle = normalizeForMatch(m.anchorText);
    if (!needle || needle.length < 3) continue;
    const idx = norm.indexOf(needle, searchFrom);
    if (idx === -1) continue;
    const startOrig = map[idx];
    // Find the end of the heading line in the raw text (next \n or
    // ~120 chars cap so we don't grab a whole paragraph as the title).
    const nl = rawText.indexOf("\n", startOrig);
    const lineEnd = nl === -1 ? Math.min(startOrig + 120, rawText.length) : nl;
    const titleLine = rawText.slice(startOrig, lineEnd).trim();
    hits.push({ level: m.level, start: startOrig, lineEnd, titleLine });
    searchFrom = idx + needle.length;
  }

  // Emit HTML.
  const out: string[] = [];
  const wrapParagraphs = (chunk: string) => {
    const trimmed = chunk.trim();
    if (!trimmed) return;
    // Run the section content through the Markdown parser so emphasis,
    // lists, blockquotes, tables and intra-section sub-headings produced
    // by Mistral OCR survive — instead of being flattened into <p>.
    const html = markdownToHtml(trimmed);
    if (html) out.push(html);
  };

  if (hits.length === 0) {
    wrapParagraphs(rawText);
    return out.join("\n");
  }

  // Prelude (before first heading).
  if (hits[0].start > 0) {
    wrapParagraphs(rawText.slice(0, hits[0].start));
  }
  for (let i = 0; i < hits.length; i++) {
    const h = hits[i];
    out.push(`<h${h.level}>${escapeHtml(h.titleLine)}</h${h.level}>`);
    const bodyStart = h.lineEnd;
    const bodyEnd = i + 1 < hits.length ? hits[i + 1].start : rawText.length;
    if (bodyEnd > bodyStart) {
      wrapParagraphs(rawText.slice(bodyStart, bodyEnd));
    }
  }
  return out.join("\n");
}

/**
 * Translate a large HTML body in chunks (split on </p> / </h1> / </h2>
 * boundaries to avoid breaking mid-tag). gpt-4o-mini's 16k output cap
 * means a single call can't translate ~40k+ chars of body, so we
 * fan out and reassemble.
 */
async function translateBodyHtml(
  html: string,
  sourceLang: "fr" | "ar",
  targetLang: "fr" | "ar",
  chunkChars = 6000,
): Promise<string> {
  if (!html.trim()) return "";
  if (html.length <= chunkChars) {
    const r = await translateFieldBatch({ body_html: html }, sourceLang, targetLang);
    return r.body_html ?? "";
  }
  const chunks: string[] = [];
  let cursor = 0;
  while (cursor < html.length) {
    let end = Math.min(cursor + chunkChars, html.length);
    if (end < html.length) {
      const candidates = [
        html.lastIndexOf("</p>", end),
        html.lastIndexOf("</h1>", end),
        html.lastIndexOf("</h2>", end),
        html.lastIndexOf("</h3>", end),
      ].filter((p) => p > cursor);
      if (candidates.length > 0) {
        const lastBreak = Math.max(...candidates);
        const tagLen = html.slice(lastBreak).startsWith("</p>") ? 4 : 5;
        end = lastBreak + tagLen;
      }
    }
    chunks.push(html.slice(cursor, end));
    cursor = end;
  }
  console.log(`[upload-document] translating body in ${chunks.length} chunks (${html.length}c total)`);
  const results: string[] = [];
  for (let i = 0; i < chunks.length; i++) {
    const r = await translateFieldBatch({ body_html: chunks[i] }, sourceLang, targetLang);
    results.push(r.body_html ?? "");
  }
  return results.join("\n");
}

/**
 * Ask gpt-4o-mini to translate a dict of fields from one language to
 * another in a SINGLE call. Preserves HTML tags on body_html.
 * Returns the same keys with their translated values (empty string if
 * the AI didn't return one).
 */
async function translateFieldBatch(
  fields: Record<string, string>,
  sourceLang: "fr" | "ar",
  targetLang: "fr" | "ar",
): Promise<Record<string, string>> {
  const filteredEntries = Object.entries(fields).filter(
    ([, v]) => typeof v === "string" && v.trim().length > 0,
  );
  if (filteredEntries.length === 0) return {};
  const filtered = Object.fromEntries(filteredEntries);

  const langName = (c: string) => (c === "fr" ? "French" : "Arabic");
  const system = `You are a professional legal translator working on Tunisian law documents.
Translate every value in the JSON object below from ${langName(sourceLang)} to ${langName(targetLang)}.
Preserve legal terminology, proper names, dates, numbers, HTML tags, and the existing paragraph structure.
Return STRICT JSON ONLY with the SAME KEYS, each value replaced by its translation. No markdown, no commentary.`;

  const userPrompt = `JSON à traduire :\n${JSON.stringify(filtered, null, 2)}`;

  const raw = await chatCompletion({
    model: "gpt-4o-mini",
    system,
    prompt: userPrompt,
    temperature: 0.1,
    maxTokens: 16000,
    json: true,
  });

  const parsed = safeParseJson(raw);
  const out: Record<string, string> = {};
  for (const k of Object.keys(filtered)) {
    const v = (parsed as Record<string, unknown>)[k];
    out[k] = typeof v === "string" ? v : "";
  }
  return out;
}

/**
 * Run the full document processing pipeline asynchronously.
 *
 * Steps:
 *   1. Extract text (vision OCR for Arabic, PyMuPDF for others).
 *   2. AI structuring + metadata (one call, returns structured body_html
 *      with H1/H2 headings + all metadata in source language).
 *   3. AI translation of body_html + metadata to the other language.
 *   4. Persist everything (content, translated_content, all metadata).
 *   5. Generate embedding.
 *   6. Mark document as pending_validation — the editor opens with
 *      everything pre-filled and ready to review.
 */
export async function runProcessingPipeline(args: {
  jobId: string;
  documentId: string;
  buffer: Buffer;
  filename: string;
  mimeType?: string;
  language: "fr" | "ar" | "auto";
  processingMode: ProcessingMode;
}): Promise<void> {
  const { jobId, documentId, buffer, filename, mimeType, language, processingMode } = args;
  const setProgress = async (progress: number, step: string) => {
    await prisma.processingJob.update({
      where: { id: jobId },
      data: { progress, currentStep: step, status: "processing" },
    });
    publishJobProgress({ jobId, status: "processing", progress, currentStep: step });
  };

  try {
    // ── Step 1 — Text extraction ────────────────────────────────────
    await setProgress(10, "extracting_text");
    console.log(`[upload-document] start docId=${documentId} file=${filename} ${buffer.length}B lang=${language} mode=${processingMode}`);
    // In "direct" mode we skip vision OCR (it's the expensive AI step)
    // and rely on the PyMuPDF / pdf-parse path. We trick
    // extractTextFromFile by passing language="auto" which never
    // triggers the Arabic-first vision branch.
    const extractionLang = processingMode === "direct" ? "auto" : language;
    const extraction = await extractTextFromFile(buffer, filename, mimeType, extractionLang);
    console.log(`[upload-document] extraction method=${extraction.method} pages=${extraction.pageCount} text=${extraction.text.length}c needsOcr=${extraction.needsOcr ?? false}${extraction.errorMessage ? ` err="${extraction.errorMessage}"` : ""}`);

    // Always persist a first-pass body now so the document row has SOMETHING
    // if the AI step crashes. Replaced below by the structured body_html.
    const fallbackBody = htmlFromText(extraction.text);
    const pageContents = extraction.pages.map((p) => ({
      pageNumber: p.pageNumber,
      content: p.content,
      confidence: p.confidence ?? 0.95,
    }));
    await prisma.document.update({
      where: { id: documentId },
      data: {
        content: fallbackBody,
        pageContents: pageContents as never,
        pageCount: extraction.pageCount,
        totalPages: extraction.pageCount,
        processedPages: extraction.pageCount,
      },
    });

    if (!extraction.text || extraction.text.length < 50) {
      const reason = extraction.errorMessage
        ? `OCR a échoué : ${extraction.errorMessage}`
        : extraction.needsOcr
        ? "PDF scanné — OCR n'a extrait aucun texte."
        : "Texte trop court ou vide.";
      console.warn(`[upload-document] no_text docId=${documentId} reason="${reason}"`);
      await prisma.processingJob.update({
        where: { id: jobId },
        data: {
          status: "failed",
          progress: 100,
          currentStep: "no_text_extracted",
          errorMessage: reason,
        },
      });
      await prisma.document.update({
        where: { id: documentId },
        data: { status: "extraction_failed" },
      });
      publishJobProgress({ jobId, status: "failed", progress: 100, errorMessage: reason });
      return;
    }

    // ── DIRECT MODE — no AI ────────────────────────────────────────
    // Skip metadata + translation. Just extract text, run regex-based
    // heading detection (htmlFromText), extract the bibliography block,
    // and persist. Fast and deterministic — no OpenAI calls.
    if (processingMode === "direct") {
      await setProgress(80, "saving");
      // Regex-based segmentation: detects الكلمات المفاتيح, مقدمة,
      // الجزء + ordinal, الفرع + ordinal, خاتمة, قائمة المراجع.
      // Returns structured HTML with <h1>/<h2> for each block + the
      // keywords + bibliography extracted to dedicated fields (and
      // removed from the body).
      const seg = segmentAnalyseText(extraction.text);
      // Convert the segmenter's HTML body to Markdown for storage —
      // the editor and the public page both consume Markdown now.
      const directData: Record<string, unknown> = { content: htmlToMarkdown(seg.bodyHtml) };
      if (language === "ar") {
        if (seg.keywords.length > 0) directData.keywordsAr = seg.keywords;
        if (seg.bibliography) directData.bibliographyAr = seg.bibliography;
      } else {
        if (seg.keywords.length > 0) directData.keywords = seg.keywords;
        if (seg.bibliography) directData.bibliography = seg.bibliography;
      }
      await prisma.document.update({ where: { id: documentId }, data: directData as never });
      console.log(`[upload-document] DIRECT mode (regex segmentation): bodyHtml=${seg.bodyHtml.length}c, keywords=${seg.keywords.length}, biblio=${seg.bibliography ? `${seg.bibliography.length}c` : "no"}`);

      await prisma.document.update({
        where: { id: documentId },
        data: { status: "pending_validation" },
      });
      await prisma.processingJob.update({
        where: { id: jobId },
        data: { status: "completed", progress: 100, currentStep: "done" },
      });
      publishJobProgress({ jobId, status: "completed", progress: 100, currentStep: "done" });
      console.log(`[upload-document] DIRECT pipeline complete for ${documentId}`);
      return;
    }

    // ── Step 2 — Structure + metadata (one AI call) ─────────────────
    await setProgress(40, "ai_structure_metadata");
    const docWithType = await prisma.document.findUnique({
      where: { id: documentId },
      include: { documentTypeRel: true },
    });
    const docTypeName = docWithType?.documentTypeRel?.name ?? null;
    const kind = classifyDocType(docTypeName);
    const sourceLang: "fr" | "ar" = language === "ar" ? "ar" : "fr";
    console.log(`[upload-document] AI structure kind=${kind} docType="${docTypeName ?? "unknown"}" lang=${sourceLang}`);

    let analysis: Record<string, unknown> = {};
    try {
      const systemPrompt = buildStructurePrompt(docTypeName, sourceLang);
      // Cap input at ~32k chars to stay within gpt-4o-mini context while
      // leaving room for the structured body_html in the output.
      const raw = await chatCompletion({
        model: "gpt-4o-mini",
        system: systemPrompt,
        prompt: extraction.text.slice(0, 32000),
        temperature: 0.1,
        maxTokens: 16000,
        json: true,
      });
      analysis = safeParseJson(raw);
      if (Object.keys(analysis).length === 0) {
        console.warn(`[upload-document] AI structure returned empty JSON for ${documentId}`);
      } else {
        console.log(`[upload-document] AI structure ok, keys: ${Object.keys(analysis).join(",")}`);
      }
    } catch (err) {
      console.warn(`[upload-document] AI structure failed for ${documentId}:`, (err as Error).message);
    }

    // Helpers to coerce AI output to clean values.
    const str = (v: unknown) => (typeof v === "string" && v.trim() ? v : undefined);
    const arr = (v: unknown) =>
      Array.isArray(v)
        ? v.map((x) => (x == null ? "" : String(x))).filter((x) => x.trim().length > 0)
        : undefined;
    const num = (v: unknown) => {
      if (typeof v === "number" && Number.isFinite(v)) return Math.trunc(v);
      if (typeof v === "string") {
        const n = parseInt(v, 10);
        if (Number.isFinite(n)) return n;
      }
      return undefined;
    };
    const pick = (...keys: string[]) => {
      for (const k of keys) {
        const v = (analysis as Record<string, unknown>)[k];
        if (v != null) return v;
      }
      return undefined;
    };

    // Prefer keywords explicitly written in the document (after a
    // "الكلمات المفاتيح :" / "Mots-clés :" marker). Falls back to
    // AI-generated keywords only if no such block exists.
    const explicitKeywords = extractKeywordsFromText(extraction.text);
    if (explicitKeywords) {
      console.log(`[upload-document] explicit keywords from text: ${explicitKeywords.length} items`);
    } else {
      console.log(`[upload-document] no explicit keyword marker found, falling back to AI keywords`);
    }

    // Source-language metadata + body, as plain JS values.
    const src = {
      title: str(pick("title", "title_ar")),
      subtitle: str(pick("subtitle", "subtitle_ar")),
      author: str(pick("author", "author_ar")),
      summary: str(pick("summary", "summary_ar")),
      keywords: explicitKeywords ?? arr(pick("keywords", "keywords_ar")),
      legalDomains: arr(pick("legalDomains", "legal_domains", "legalDomains_ar", "legal_domains_ar")),
      mainTopics: arr(pick("mainTopics", "main_topics", "mainTopics_ar", "main_topics_ar")),
      legalReferences: arr(pick("legalReferences", "legal_references", "legalReferences_ar", "legal_references_ar")),
      entities: arr(pick("entities", "entities_ar")),
      dates: arr(pick("dates", "dates_ar")),
      court: str(pick("court", "court_ar")),
      courtLevel: str(pick("court_level", "courtLevel", "court_level_ar")),
      courtCategory: str(pick("court_category", "courtCategory", "court_category_ar")),
      caseNumber: str(pick("case_number", "caseNumber")),
      year: num(pick("year")),
      plaintiff: str(pick("plaintiff", "plaintiff_ar")),
      defendant: str(pick("defendant", "defendant_ar")),
      jurisdiction: str(pick("jurisdiction", "jurisdiction_ar")),
      bodyHtml: "" as string,
      bibliography: extractBibliographyFromText(extraction.text) ?? undefined,
    };

    // Build body HTML deterministically from anchors + full source text.
    const rawMarkers = pick("section_markers", "sectionMarkers");
    const markers: SectionMarker[] = Array.isArray(rawMarkers)
      ? rawMarkers
          .map((m: unknown) => {
            const obj = m as Record<string, unknown>;
            const lvl = obj.level === 2 ? 2 : 1;
            const anchor = typeof obj.anchor_text === "string"
              ? obj.anchor_text
              : typeof obj.anchorText === "string"
              ? obj.anchorText
              : "";
            return { level: lvl as 1 | 2, anchorText: anchor };
          })
          .filter((m) => m.anchorText.trim().length >= 3)
      : [];
    src.bodyHtml = buildBodyHtmlFromAnchors(extraction.text, markers) || fallbackBody;
    console.log(`[upload-document] anchors=${markers.length} → bodyHtml=${src.bodyHtml.length}c title="${(src.title ?? "").slice(0, 50)}"`);

    // ── Step 3 — Translation (single call) ──────────────────────────
    const targetLang: "fr" | "ar" = sourceLang === "ar" ? "fr" : "ar";
    await setProgress(70, "translating");
    let translated: Record<string, string> = {};
    try {
      const toTranslate: Record<string, string> = {};
      if (src.title) toTranslate.title = src.title;
      if (src.subtitle) toTranslate.subtitle = src.subtitle;
      if (src.author) toTranslate.author = src.author;
      if (src.summary) toTranslate.summary = src.summary;
      if (src.court) toTranslate.court = src.court;
      if (src.courtLevel) toTranslate.court_level = src.courtLevel;
      if (src.courtCategory) toTranslate.court_category = src.courtCategory;
      if (src.plaintiff) toTranslate.plaintiff = src.plaintiff;
      if (src.defendant) toTranslate.defendant = src.defendant;
      if (src.jurisdiction) toTranslate.jurisdiction = src.jurisdiction;
      if (src.keywords && src.keywords.length > 0) toTranslate.keywords = src.keywords.join("\n");
      if (src.legalReferences && src.legalReferences.length > 0) toTranslate.legal_references = src.legalReferences.join("\n");
      if (src.bibliography) toTranslate.bibliography = src.bibliography;

      if (Object.keys(toTranslate).length > 0) {
        translated = await translateFieldBatch(toTranslate, sourceLang, targetLang);
        console.log(`[upload-document] translated ${Object.keys(translated).length} metadata fields`);
      }
      // Body HTML is translated separately (chunked to avoid 16k output cap).
      if (src.bodyHtml) {
        translated.body_html = await translateBodyHtml(src.bodyHtml, sourceLang, targetLang);
        console.log(`[upload-document] body_html translated: ${translated.body_html.length}c`);
      }
    } catch (err) {
      console.warn(`[upload-document] translation failed for ${documentId}:`, (err as Error).message);
    }

    // ── Step 4 — Persist everything ────────────────────────────────
    await setProgress(85, "saving");
    const data: Record<string, unknown> = {};
    const setBilingual = (
      key: string,
      keyAr: string,
      srcVal: unknown,
      trVal: unknown,
    ) => {
      if (sourceLang === "ar") {
        if (srcVal !== undefined) (data as Record<string, unknown>)[keyAr] = srcVal;
        if (trVal !== undefined && trVal !== "") (data as Record<string, unknown>)[key] = trVal;
      } else {
        if (srcVal !== undefined) (data as Record<string, unknown>)[key] = srcVal;
        if (trVal !== undefined && trVal !== "") (data as Record<string, unknown>)[keyAr] = trVal;
      }
    };

    setBilingual("title", "titleAr", src.title, translated.title);
    setBilingual("subtitle", "subtitleAr", src.subtitle, translated.subtitle);
    setBilingual("author", "authorAr", src.author, translated.author);
    setBilingual("summary", "summaryAr", src.summary, translated.summary);
    setBilingual("court", "courtAr", src.court, translated.court);
    setBilingual("courtLevel", "courtLevelAr", src.courtLevel, translated.court_level);
    setBilingual("courtCategory", "courtCategoryAr", src.courtCategory, translated.court_category);
    setBilingual("plaintiff", "plaintiffAr", src.plaintiff, translated.plaintiff);
    setBilingual("defendant", "defendantAr", src.defendant, translated.defendant);
    setBilingual("bibliography", "bibliographyAr", src.bibliography, translated.bibliography);

    if (src.keywords && src.keywords.length > 0) {
      const trKw = (translated.keywords ?? "")
        .split(/\n+/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (sourceLang === "ar") {
        data.keywordsAr = src.keywords;
        if (trKw.length > 0) data.keywords = trKw;
      } else {
        data.keywords = src.keywords;
        if (trKw.length > 0) data.keywordsAr = trKw;
      }
    }
    if (src.legalReferences && src.legalReferences.length > 0) {
      const trRefs = (translated.legal_references ?? "")
        .split(/\n+/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (sourceLang === "ar") {
        data.legalReferencesAr = src.legalReferences;
        if (trRefs.length > 0) data.legalReferences = trRefs;
      } else {
        data.legalReferences = src.legalReferences;
        if (trRefs.length > 0) data.legalReferencesAr = trRefs;
      }
    }

    // Body: source-language goes to `content`, translation to
    // `translated_content`. Both are converted from the in-pipeline
    // HTML into Markdown — that is the storage format consumed by
    // the editor and the public page. Conversion + noise-stripping
    // lives in `htmlToMarkdown()`.
    if (src.bodyHtml) {
      data.content = htmlToMarkdown(src.bodyHtml);
    }
    if (translated.body_html) {
      data.translatedContent = htmlToMarkdown(translated.body_html);
    }

    if (src.caseNumber) data.caseNumber = src.caseNumber;
    if (src.year) data.year = src.year;
    if (src.jurisdiction) data.jurisdiction = src.jurisdiction;
    if (src.legalDomains) data.legalDomains = src.legalDomains;
    if (src.mainTopics) data.mainTopics = src.mainTopics;
    if (src.entities) data.entities = src.entities;
    if (src.dates) data.dates = src.dates;

    await prisma.document.update({ where: { id: documentId }, data: data as never });
    console.log(`[upload-document] persisted fields: ${Object.keys(data).join(",")}`);

    // ── Step 5 — Embedding ─────────────────────────────────────────
    await setProgress(95, "generating_embedding");
    try {
      const embedText = [src.title ?? "", src.summary ?? "", extraction.text].filter(Boolean).join("\n\n");
      await generateAndStoreEmbedding(documentId, embedText);
    } catch (err) {
      console.warn(`[upload-document] embedding failed for ${documentId}:`, (err as Error).message);
    }

    // ── Step 6 — Done ──────────────────────────────────────────────
    await prisma.document.update({
      where: { id: documentId },
      data: { status: "pending_validation" },
    });
    await prisma.processingJob.update({
      where: { id: jobId },
      data: { status: "completed", progress: 100, currentStep: "done" },
    });
    publishJobProgress({ jobId, status: "completed", progress: 100, currentStep: "done" });
    console.log(`[upload-document] pipeline complete for ${documentId}`);
  } catch (err) {
    console.error(`[upload-document] pipeline failed for ${documentId}:`, err);
    await prisma.processingJob.update({
      where: { id: jobId },
      data: {
        status: "failed",
        errorMessage: (err as Error).message?.slice(0, 500) ?? "unknown error",
      },
    });
    publishJobProgress({
      jobId,
      status: "failed",
      progress: 0,
      errorMessage: (err as Error).message?.slice(0, 500),
    });
  }
}

export async function uploadDocument(req: Request) {
  // Support both multipart upload (FormData with `file` field) and
  // legacy JSON body with fileBase64.
  let filename: string;
  let buffer: Buffer;
  let title: string | undefined;
  let titleAr: string | undefined;
  let language = "fr";
  let categoryId: string | null | undefined;
  let documentTypeId: string | null | undefined;
  let skipProcessing: boolean | undefined;
  let processingMode: ProcessingMode = "ai";

  const reqWithFile = req as Request & { file?: { buffer: Buffer; originalname: string; mimetype: string } };
  if (reqWithFile.file) {
    filename = Buffer.from(reqWithFile.file.originalname, "latin1").toString("utf8");
    buffer = reqWithFile.file.buffer;
    const body = req.body as Record<string, string | undefined>;
    title = body.title;
    titleAr = body.titleAr;
    language = body.language ?? "fr";
    categoryId = body.categoryId || null;
    documentTypeId = body.documentTypeId || null;
    skipProcessing = body.skipProcessing === "true";
    if (body.processingMode === "direct" || body.processingMode === "ai") {
      processingMode = body.processingMode;
    }
  } else {
    const args = schema.parse(req.body);
    filename = args.filename;
    buffer = Buffer.from(args.fileBase64, "base64");
    title = args.title;
    titleAr = args.titleAr;
    language = args.language;
    categoryId = args.categoryId;
    documentTypeId = args.documentTypeId;
    skipProcessing = args.skipProcessing;
    if (args.processingMode) processingMode = args.processingMode;
  }
  const userId = req.user!.userId;

  // 1. Save the file
  const saved = await saveFile("documents", userId, filename, buffer);

  // 2. Create document row (initially with empty content)
  const doc = await prisma.document.create({
    data: {
      userId,
      title: title ?? filename,
      titleAr,
      content: "",
      originalFilename: filename,
      fileUrl: saved.url,
      pdfUrl: saved.url,
      fileSize: saved.size,
      language,
      categoryId: categoryId ?? undefined,
      documentTypeId: documentTypeId ?? undefined,
      status: "processing",
      published: false,
    },
  });

  // 3. Create a processing_job row
  const job = await prisma.processingJob.create({
    data: {
      fileName: filename,
      fileSize: saved.size,
      status: "pending",
      progress: 0,
      currentStep: "queued",
    },
  });
  await prisma.document.update({
    where: { id: doc.id },
    data: { processingJobId: job.id },
  });

  // 4. Fire-and-forget the processing pipeline (don't block response)
  if (!skipProcessing) {
    void runProcessingPipeline({
      jobId: job.id,
      documentId: doc.id,
      buffer,
      filename,
      mimeType: undefined,
      language: language === "ar" || language === "fr" ? language : "auto",
      processingMode,
    });
  }

  // 5. Return document + jobId immediately
  return {
    success: true,
    document: doc,
    jobId: job.id,
  };
}
