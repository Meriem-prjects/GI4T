// Local text extraction service.
// Uses pdf-parse for PDFs (free), mammoth for DOCX (free) and OpenAI
// gpt-4o vision as a fallback OCR for scanned PDFs / images (uses
// the existing OPENAI_API_KEY).
//
// Replaces the PDFRest- and Google-Vision-dependent functions when
// those API keys are not configured.

import { createRequire } from "node:module";
import * as mammoth from "mammoth";
import { getOpenAI } from "./openai.js";

// pdf-parse@2.x exposes a `PDFParse` class. The package is published
// as ESM but the CJS build is also there. Use createRequire to load
// the CJS form so we don't depend on dynamic-import in compiled JS.
const requireCjs = createRequire(import.meta.url);
interface PageTextResultLike {
  text: string;
  pageNumber?: number;
  num?: number;
}
interface TextResultLike {
  text: string;
  pages: PageTextResultLike[];
  numPages?: number;
}
interface PDFParseClass {
  new (options: { data: Uint8Array | Buffer }): {
    getText(): Promise<TextResultLike>;
    destroy(): Promise<void>;
  };
}
const pdfParseModule = requireCjs("pdf-parse") as { PDFParse: PDFParseClass };
const PDFParse = pdfParseModule.PDFParse;

export interface ExtractedPage {
  pageNumber: number;
  content: string;
  confidence?: number;
}

export interface ExtractionResult {
  text: string;
  pageCount: number;
  pages: ExtractedPage[];
  method: "pdf-text" | "pdf-vision" | "docx" | "image-vision" | "txt";
  needsOcr?: boolean;
}

/**
 * Extract text from a PDF buffer using pdf-parse (no external API).
 * Returns empty string if the PDF has no text layer (scanned PDF).
 */
export async function extractPdfText(buffer: Buffer): Promise<{
  text: string;
  pageCount: number;
  pageTexts: string[];
}> {
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    const pageTexts = (result.pages ?? []).map((p) => (p.text ?? "").trim());
    const fullText = (result.text ?? pageTexts.join("\n\n")).trim();
    const pages = pageTexts.length > 0 ? pageTexts : [fullText];
    return {
      text: fullText,
      pageCount: result.numPages ?? pages.length,
      pageTexts: pages,
    };
  } finally {
    await parser.destroy().catch(() => {});
  }
}

/**
 * Extract text from a DOCX buffer using mammoth (no external API).
 */
export async function extractDocxText(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value.trim();
}

/**
 * OCR an image (or scanned PDF page rendered to PNG) using OpenAI
 * gpt-4o vision. Returns the extracted text. Uses the existing
 * OPENAI_API_KEY — no Google Vision needed.
 */
export async function ocrWithOpenAI(
  imageBuffer: Buffer,
  mimeType: string = "image/png",
  languageHint: "fr" | "ar" | "auto" = "auto",
): Promise<{ text: string; confidence: number }> {
  const openai = getOpenAI();
  const base64 = imageBuffer.toString("base64");
  const dataUrl = `data:${mimeType};base64,${base64}`;

  const langPrompt =
    languageHint === "ar"
      ? "Le texte est en arabe. Restitue-le tel quel, en respectant les diacritiques et la ponctuation arabe (؟ ؛ .)."
      : languageHint === "fr"
      ? "Le texte est en français. Conserve les accents (é è à ç) et la ponctuation."
      : "Détecte automatiquement la langue (français ou arabe) et restitue le texte tel quel.";

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    max_tokens: 4096,
    messages: [
      {
        role: "system",
        content:
          "Tu es un assistant OCR. Extrait UNIQUEMENT le texte visible de l'image, sans commentaire ni mise en forme. Préserve la structure des paragraphes (sauts de ligne). Si l'image est vide ou illisible, réponds avec une chaîne vide.",
      },
      {
        role: "user",
        content: [
          { type: "text", text: langPrompt },
          { type: "image_url", image_url: { url: dataUrl, detail: "high" } },
        ],
      },
    ],
  });

  const text = completion.choices[0]?.message?.content?.trim() ?? "";
  return { text, confidence: text.length > 50 ? 0.9 : 0.5 };
}

/**
 * High-level entry: extract text from a file, picking the best
 * strategy based on the MIME type / filename, with OpenAI vision
 * as a fallback for scanned PDFs.
 */
export async function extractTextFromFile(
  buffer: Buffer,
  filename: string,
  mimeType?: string,
  languageHint: "fr" | "ar" | "auto" = "auto",
): Promise<ExtractionResult> {
  const lowerName = filename.toLowerCase();
  const isPdf = lowerName.endsWith(".pdf") || mimeType === "application/pdf";
  const isDocx =
    lowerName.endsWith(".docx") ||
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  const isImage =
    /\.(jpe?g|png|webp|gif|bmp|tiff?)$/i.test(lowerName) || (mimeType ?? "").startsWith("image/");
  const isTxt = lowerName.endsWith(".txt") || mimeType === "text/plain";

  if (isTxt) {
    const text = buffer.toString("utf8").trim();
    return {
      text,
      pageCount: 1,
      pages: [{ pageNumber: 1, content: text }],
      method: "txt",
    };
  }

  if (isDocx) {
    const text = await extractDocxText(buffer);
    return {
      text,
      pageCount: 1,
      pages: [{ pageNumber: 1, content: text }],
      method: "docx",
    };
  }

  if (isImage) {
    const ocr = await ocrWithOpenAI(buffer, mimeType ?? "image/png", languageHint);
    return {
      text: ocr.text,
      pageCount: 1,
      pages: [{ pageNumber: 1, content: ocr.text, confidence: ocr.confidence }],
      method: "image-vision",
    };
  }

  if (isPdf) {
    const pdf = await extractPdfText(buffer);
    if (pdf.text.length >= 100) {
      return {
        text: pdf.text,
        pageCount: pdf.pageCount,
        pages: pdf.pageTexts.map((content, i) => ({ pageNumber: i + 1, content })),
        method: "pdf-text",
      };
    }
    // PDF has no text layer (scanned). Mark for OCR — but we can't OCR
    // a PDF directly with OpenAI vision (it expects images). Caller
    // can retry by converting pages to PNGs first.
    return {
      text: pdf.text,
      pageCount: pdf.pageCount,
      pages: pdf.pageTexts.map((content, i) => ({ pageNumber: i + 1, content })),
      method: "pdf-text",
      needsOcr: true,
    };
  }

  // Unknown format: best-effort UTF-8 read.
  return {
    text: buffer.toString("utf8").slice(0, 10000),
    pageCount: 1,
    pages: [{ pageNumber: 1, content: buffer.toString("utf8").slice(0, 10000) }],
    method: "txt",
  };
}
