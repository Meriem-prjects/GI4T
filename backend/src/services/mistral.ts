// Mistral AI client — used for:
//   - OCR of PDFs via /v1/ocr (mistral-ocr-latest, accepts raw PDF base64)
//   - Chat completions via /v1/chat/completions (mistral-large-latest)
//
// Falls back to OpenAI when MISTRAL_API_KEY is not configured.

import { Mistral } from "@mistralai/mistralai";
import { env } from "../config/env.js";

const MISTRAL_BASE = "https://api.mistral.ai/v1";

let _client: Mistral | null = null;
function getClient(): Mistral {
  if (_client) return _client;
  if (!env.MISTRAL_API_KEY) throw new Error("MISTRAL_API_KEY is not set");
  _client = new Mistral({
    apiKey: env.MISTRAL_API_KEY,
    timeoutMs: 300_000, // 5 min — needed for OCR of large scanned PDFs
  });
  return _client;
}

export function hasMistralKey(): boolean {
  return !!env.MISTRAL_API_KEY;
}

// ───────────────── OCR repair (critical) ─────────────────

/**
 * Mistral OCR sometimes splits Arabic legal markers across a <br/>
 * inserted at column/page boundaries:
 *   "الم<br/>قدمة"        → should be "المقدمة"
 *   "الج<br/>زء الأول"     → "الجزء الأول"
 *   "الف<br/>رع الثاني"    → "الفرع الثاني"
 *   "خا<br/>تمة"           → "خاتمة"
 * Without this fix, the marker detection regexes miss the split heading
 * entirely and entire sections get absorbed into the previous block.
 *
 * Same patterns with \n in place of <br/>.
 */
export function repairOcrLineBreaks(text: string): string {
  if (!text) return text;
  return text
    // "الم<br/>قدمة|جزء|فرع|خاتمة"
    .replace(
      /ال[؀-ۿ]{0,3}\s*<br\s*\/?>\s*(قدمة|مقدمة|جزء|فرع|خاتمة|مراجع|مصادر|كلمات|كلمة)/g,
      "ال$1",
    )
    // Same with \n
    .replace(
      /ال[؀-ۿ]{0,3}\s*\n\s*(قدمة|مقدمة|جزء|فرع|خاتمة|مراجع|مصادر|كلمات|كلمة)/g,
      "ال$1",
    )
    // Plain "مقد<br/>مة" / "خات<br/>مة" without leading ال
    .replace(
      /(مقد|خات|الجز|الفر|قائ)\s*<br\s*\/?>\s*(مة|ء|ع|مة)/g,
      "$1$2",
    )
    // Soft hyphens / zero-width separators between Arabic letters
    .replace(/([ء-ي])[­​-‏]+(?=[ء-ي])/g, "$1");
}

// ───────────────── LaTeX noise (Mistral OCR equation mode) ─────────

/**
 * Mistral OCR runs an equation-detection pass that — on Arabic legal
 * PDFs — fires on punctuation, footnote daggers, decorative glyphs,
 * Arabic-Indic digits with diacritics, etc. The result is the output
 * littered with `$\varphi$`, `$\Upsilon$`, `$\ddagger$`, `$\mathfrak{a}$`,
 * `$\mathbb{P}$`, `$\text{©}$`, `$\ddot{f}$`, `$\dot{f}$`, `$\\$`, `$\S\$`…
 *
 * In legal Arabic text the `$` character is never legitimate. We
 * strip the whole inline-math and display-math blocks plus a handful
 * of unbraced LaTeX commands that sometimes leak outside the dollars.
 */
function stripLatexNoise(text: string): string {
  if (!text) return text;
  return (
    text
      // Display math: $$...$$ — strip whole block.
      .replace(/\$\$[^$]*\$\$/g, " ")
      // Inline math: $...$ — strip whole block. Non-greedy via [^$].
      .replace(/\$[^$\n]{0,80}\$/g, " ")
      // Stray unbalanced `$` left over from a bad strip — kill them.
      .replace(/\$/g, " ")
      // LaTeX commands that sometimes leak outside the dollars:
      //   \varphi \Upsilon \ddagger \dagger \mathfrak{a} \mathbb{P}
      //   \text{x} \ddot{f} \dot{f} \tilde{x} \bar{x} \hat{x}
      .replace(/\\(?:var)?[A-Za-z]+(?:\{[^}]*\})?/g, " ")
      // Markdown escape sequences: \_ \* \# \. \( \) \[ \] \{ \} \| \+ \- \~ \` \!
      // Mistral OCR escapes these to be safe inside Markdown — for legal
      // Arabic text we want the literal char (or nothing for `\_` which
      // is almost always a fake placeholder anyway).
      .replace(/\\([_*#.()[\]{}|+\-~`!])/g, " ")
      // Collapse the whitespace we just introduced.
      .replace(/[ \t]{2,}/g, " ")
      .replace(/\n[ \t]+/g, "\n")
      .replace(/[ \t]+\n/g, "\n")
  );
}

// ───────────────── Fallback-glyph noise (`¥`, repeated symbols) ──────

/**
 * Mistral OCR uses the **yen sign `¥` (U+00A5)** as a fallback glyph
 * when it can't map a character (custom PDF font, footnote daggers,
 * bullet markers, decorative borders). The yen never appears in Tunisian
 * legal text — strip it unconditionally.
 *
 * Same logic for other "ghost" glyphs Mistral falls back on.
 *
 * We also detect long runs of the SAME token (`¥ ¥ ¥ ¥`, `الـ الـ الـ`,
 * `25 25 25`, etc.) — these are always page-footer / footnote-number
 * artefacts replicated across rendered tiles by the OCR.
 */
const FALLBACK_GLYPHS_RE = /[¥¤€©®™§¶†‡•·▪◆●○■□▶◀★☆※]/g;

function stripFallbackGlyphs(text: string): string {
  if (!text) return text;
  return text
    .replace(FALLBACK_GLYPHS_RE, " ")
    // Strip surrounding double-quotes around very short tokens — Mistral
    // OCR puts quotes around tatweel-padded prefix articles ("الـ") and
    // similar single-syllable fillers. After unquoting, the inner token
    // will be caught by the regular short-token noise filter below.
    .replace(/"\s*([؀-ۿ]{1,3})\s*"/g, "$1")
    // Long runs of the SAME token separated by spaces — page-footer
    // duplication. Generic: kicks in for any token (digits, symbols,
    // Arabic, Latin). Cap at 60 chars per token to avoid catastrophic
    // backtracking on real text.
    .replace(/\b(\S{1,60})(?:\s+\1\b){2,}/g, " ")
    .replace(/[ \t]{2,}/g, " ");
}

// ───────────────── Mistral OCR garbage cleanup ─────────────────

const NOISE_GLYPHS = new Set([
  "§", "fi", "ff", "fl", "·", "%", "=", "+",
  // Mistral OCR fallback glyphs (see stripFallbackGlyphs above)
  "¥", "¤", "€", "©", "®", "™", "¶", "†", "‡",
  "•", "▪", "◆", "●", "○", "■", "□", "▶", "◀", "★", "☆", "※",
  // Markdown escapes that survived the strip pass (defensive)
  "_", "\\_", "\\*", "\\.", "\\#",
]);
function looksLikeNoiseToken(t: string): boolean {
  if (!t) return true;
  if (NOISE_GLYPHS.has(t)) return true;
  if (/^[؀-ۿ]{1,2}$/.test(t)) return true;
  if (/^[a-zA-Z]{1,2}$/.test(t)) return true;
  if (/^\d{1,3}$/.test(t)) return true;
  if (/^[\p{P}\p{S}]+$/u.test(t)) return true;
  return false;
}

function cleanMistralOcrOutput(text: string): string {
  if (!text) return text;
  const paragraphs = text.split(/\n{2,}/);
  const kept: string[] = [];
  for (const p of paragraphs) {
    const trimmed = p.trim();
    if (!trimmed) continue;
    if (trimmed.length < 4) continue;
    const tokens = trimmed.split(/\s+/);
    const noise = tokens.filter(looksLikeNoiseToken).length;
    const realArabic = tokens.filter((t) => /^[؀-ۿ]{3,}$/.test(t)).length;
    if (tokens.length >= 5 && noise / tokens.length > 0.4 && realArabic < 4) continue;
    let cleaned = trimmed
      .replace(/(?:\d+\s*م(?:\s*[-+]\s*\d+\s*م)+)/g, "")
      .replace(/(?:[؀-ۿ]{1,3}\s+){4,}[؀-ۿ]{1,3}/g, " ")
      .replace(/(?:[§·]\s*[؀-ۿ]{1,3}\s*){2,}/g, " ")
      .replace(/(?:§|fi|ff|fl|·)+/g, "")
      .replace(/\s{2,}/g, " ")
      .trim();
    if (cleaned.length < 4) continue;
    const afterTokens = cleaned.split(/\s+/);
    const afterReal = afterTokens.filter((t) => /^[؀-ۿ]{3,}$/.test(t)).length;
    if (afterReal === 0 && afterTokens.length > 2) continue;
    kept.push(cleaned);
  }
  return kept.join("\n\n");
}

// ───────────────── OCR ─────────────────

/**
 * Send a PDF buffer to Mistral's OCR endpoint via the official SDK.
 * Returns one cleaned markdown string per page.
 *
 * `includeImageBase64: true` is CRITICAL — it tells Mistral to also
 * OCR the text inside embedded images (essential for scanned PDFs and
 * for PDFs whose text layer has a broken cmap). The response gets
 * bigger (~10-30 MB) but the quality is dramatically higher.
 */
export async function ocrPdfWithMistral(
  buffer: Buffer,
): Promise<{ pages: { pageNumber: number; content: string }[]; fullText: string }> {
  const client = getClient();
  const b64 = buffer.toString("base64");
  const res = await client.ocr.process({
    model: "mistral-ocr-latest",
    document: {
      type: "document_url",
      documentUrl: `data:application/pdf;base64,${b64}`,
    },
    includeImageBase64: true,
  } as never);
  const rawPages = (res as { pages?: Array<{ index?: number; markdown?: string; text?: string }> }).pages ?? [];
  const pages = rawPages.map((p, i) => {
    const raw = (p.markdown ?? p.text ?? "").trim();
    // Repair <br/>-split Arabic markers BEFORE cleanup, so the cleanup
    // doesn't drop a "ال" that's now an orphan.
    // Order matters:
    //   1. stripLatexNoise — kill `$\varphi$` and Markdown escapes (`\_`)
    //      first, otherwise the `$` and `\` characters disrupt tokenisation.
    //   2. stripFallbackGlyphs — kill `¥` and amis + repeated-token runs.
    //   3. repairOcrLineBreaks — glue back `الم<br/>قدمة` style splits.
    //   4. cleanMistralOcrOutput — drop noise tokens / repeated runs.
    const repaired = repairOcrLineBreaks(
      stripFallbackGlyphs(stripLatexNoise(raw)),
    );
    return {
      pageNumber: (typeof p.index === "number" ? p.index : i) + 1,
      content: cleanMistralOcrOutput(repaired),
    };
  });
  const fullText = pages.map((p) => p.content).filter(Boolean).join("\n\n");
  return { pages, fullText };
}

/**
 * Vision-only OCR: send pre-rendered PNG images to Mistral OCR via
 * image_url. Used when caller pre-renders pages (e.g. via pdfjs-dist).
 */
export async function ocrImagesWithMistral(
  pngs: { pageNumber: number; buffer: Buffer }[],
): Promise<{ pages: { pageNumber: number; content: string }[]; fullText: string }> {
  const client = getClient();
  const out: { pageNumber: number; content: string }[] = [];
  for (const png of pngs) {
    const dataUrl = `data:image/png;base64,${png.buffer.toString("base64")}`;
    const res = await client.ocr.process({
      model: "mistral-ocr-latest",
      document: { type: "image_url", imageUrl: dataUrl },
      includeImageBase64: false,
    } as never);
    const pages = (res as { pages?: Array<{ markdown?: string; text?: string }> }).pages ?? [];
    const raw = (pages[0]?.markdown ?? pages[0]?.text ?? "").trim();
    // Order matters:
    //   1. stripLatexNoise — kill `$\varphi$` and Markdown escapes (`\_`)
    //      first, otherwise the `$` and `\` characters disrupt tokenisation.
    //   2. stripFallbackGlyphs — kill `¥` and amis + repeated-token runs.
    //   3. repairOcrLineBreaks — glue back `الم<br/>قدمة` style splits.
    //   4. cleanMistralOcrOutput — drop noise tokens / repeated runs.
    const repaired = repairOcrLineBreaks(
      stripFallbackGlyphs(stripLatexNoise(raw)),
    );
    out.push({ pageNumber: png.pageNumber, content: cleanMistralOcrOutput(repaired) });
  }
  const fullText = out.map((p) => p.content).filter(Boolean).join("\n\n");
  return { pages: out, fullText };
}

// ───────────────── Chat completions ─────────────────

export interface MistralChatArgs {
  model?: string;
  system?: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  /** Force JSON-object output (response_format). */
  json?: boolean;
}

/**
 * Chat completion via Mistral. Drop-in replacement for the OpenAI
 * chatCompletion() function with similar argument shape.
 *
 * Uses the official `@mistralai/mistralai` SDK (which honours Node's
 * `--use-system-ca` flag via the global agent) instead of raw `fetch`
 * (which doesn't, and fails behind a corporate SSL proxy).
 */
export async function chatCompletionMistral(args: MistralChatArgs): Promise<string> {
  try {
    const client = getClient();
    const params: Record<string, unknown> = {
      model: args.model ?? "mistral-large-latest",
      temperature: args.temperature ?? 0.2,
      messages: [
        ...(args.system ? [{ role: "system" as const, content: args.system }] : []),
        { role: "user" as const, content: args.prompt },
      ],
    };
    if (args.maxTokens) params.maxTokens = args.maxTokens;
    if (args.json) params.responseFormat = { type: "json_object" };
    const res = await client.chat.complete(params as never);
    const content = (res as { choices?: Array<{ message?: { content?: string | Array<{ text?: string }> } }> })
      .choices?.[0]?.message?.content;
    if (typeof content === "string") return content;
    if (Array.isArray(content)) {
      return content.map((c) => (typeof c === "string" ? c : c.text ?? "")).join("");
    }
    return "";
  } catch (e) {
    // Surface a readable error rather than letting an opaque
    // network-stack failure bubble up to the user.
    throw new Error(`Mistral chat failed: ${(e as Error).message}`);
  }
}

// Legacy fetch-based path kept for reference but no longer used.
async function _unusedFetchChatCompletion(args: MistralChatArgs): Promise<string> {
  const body: Record<string, unknown> = {
    model: args.model ?? "mistral-large-latest",
    temperature: args.temperature ?? 0.2,
    messages: [
      ...(args.system ? [{ role: "system", content: args.system }] : []),
      { role: "user", content: args.prompt },
    ],
  };
  if (args.maxTokens) body.max_tokens = args.maxTokens;
  if (args.json) body.response_format = { type: "json_object" };

  const res = await fetch(`${MISTRAL_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.MISTRAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Mistral chat ${res.status}: ${errText.slice(0, 500)}`);
  }
  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return json.choices?.[0]?.message?.content ?? "";
}
