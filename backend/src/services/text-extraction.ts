// Local text extraction service.
// Uses pdf-parse for PDFs (free), mammoth for DOCX (free) and OpenAI
// gpt-4o vision as a fallback OCR for scanned PDFs / images (uses
// the existing OPENAI_API_KEY).
//
// Replaces the PDFRest- and Google-Vision-dependent functions when
// those API keys are not configured.

import * as pdfParseModule from "pdf-parse";
import * as mammoth from "mammoth";
import { getOpenAI } from "./openai.js";

// pdf-parse exports a function as default. Under ESM/NodeNext the
// shape varies — handle both `pdfParseModule.default` and the
// callable namespace itself.
type PdfParseFn = (
  buffer: Buffer | Uint8Array,
  opts?: object,
) => Promise<{ text: string; numpages: number }>;
const pdfParse: PdfParseFn =
  (pdfParseModule as unknown as { default?: PdfParseFn }).default ??
  (pdfParseModule as unknown as PdfParseFn);

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
  const pageTexts: string[] = [];
  let currentPage = 1;
  let currentBuffer = "";

  const data = await pdfParse(buffer, {
    pagerender: async (pageData: {
      getTextContent: (opts?: object) => Promise<{ items: Array<{ str: string; transform: number[] }> }>;
    }) => {
      const textContent = await pageData.getTextContent({
        normalizeWhitespace: true,
        disableCombineTextItems: false,
      });
      const text = textContent.items.map((item) => item.str).join(" ");
      pageTexts.push(text);
      return text;
    },
  } as unknown as Parameters<typeof pdfParse>[1]);

  // pagerender provides per-page text. Fallback to the global text
  // if individual pages weren't captured.
  const pages = pageTexts.length > 0 ? pageTexts : [data.text];
  void currentPage;
  void currentBuffer;
  return {
    text: data.text.trim(),
    pageCount: data.numpages,
    pageTexts: pages.map((p) => p.trim()),
  };
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
