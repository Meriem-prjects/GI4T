// Render a PDF buffer to per-page PNG buffers using pdfjs-dist +
// @napi-rs/canvas directly, bypassing pdf-to-png-converter which has a
// known Windows bug (cMapUrl uses backslashes, pdfjs-dist rejects).
//
// We resolve the cmaps / standard_fonts directories as file:// URLs
// with forward slashes (works on every platform).

import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createCanvas } from "@napi-rs/canvas";

const requireCjs = createRequire(import.meta.url);

// Locate the bundled pdfjs-dist assets.
const PDFJS_DIST_DIR = path.dirname(
  requireCjs.resolve("pdfjs-dist/package.json"),
);
const CMAP_URL = pathToFileURL(path.join(PDFJS_DIST_DIR, "cmaps") + path.sep).toString();
const STANDARD_FONTS_URL = pathToFileURL(
  path.join(PDFJS_DIST_DIR, "standard_fonts") + path.sep,
).toString();

interface PdfJsModule {
  getDocument: (params: Record<string, unknown>) => {
    promise: Promise<{
      numPages: number;
      getPage: (n: number) => Promise<{
        getViewport: (opts: { scale: number }) => { width: number; height: number };
        render: (opts: {
          canvasContext: unknown;
          viewport: { width: number; height: number };
        }) => { promise: Promise<void> };
      }>;
      destroy: () => Promise<void>;
    }>;
  };
  GlobalWorkerOptions?: { workerSrc?: string };
}

let _pdfjs: PdfJsModule | undefined;
async function loadPdfjs(): Promise<PdfJsModule> {
  if (_pdfjs) return _pdfjs;
  const mod = (await import("pdfjs-dist/legacy/build/pdf.mjs")) as unknown as PdfJsModule;
  // pdfjs requires a workerSrc URL even in Node. Point it at the
  // bundled worker file (file:// URL).
  if (mod.GlobalWorkerOptions) {
    const workerPath = path.join(PDFJS_DIST_DIR, "legacy", "build", "pdf.worker.mjs");
    mod.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).toString();
  }
  _pdfjs = mod;
  return mod;
}

export interface RenderedPage {
  pageNumber: number;
  buffer: Buffer;
}

/**
 * Render every page of the given PDF buffer to a PNG buffer.
 * @param scale Render scale (1.0 = native PDF DPI, 2.0 = double).
 *              Higher = better OCR but slower + larger images.
 */
export async function renderPdfToPngs(
  buffer: Buffer,
  scale = 2.0,
  maxPages = 30,
): Promise<RenderedPage[]> {
  const pdfjs = await loadPdfjs();
  const doc = await pdfjs.getDocument({
    data: new Uint8Array(buffer),
    cMapUrl: CMAP_URL,
    cMapPacked: true,
    standardFontDataUrl: STANDARD_FONTS_URL,
    // Enable embedded font faces AND system font fallback. Crucial for
    // Tunisian legal PDFs whose embedded Arabic fonts have broken cmap
    // tables — without system font fallback, pdfjs renders the wrong
    // glyphs, the rendered PNG is visually misleading, and gpt-4o
    // vision then "reads" plausible-but-wrong Arabic words.
    disableFontFace: false,
    useSystemFonts: true,
    verbosity: 0,
  }).promise;
  try {
    const pages: RenderedPage[] = [];
    const count = Math.min(doc.numPages, maxPages);
    for (let i = 1; i <= count; i++) {
      const page = await doc.getPage(i);
      const viewport = page.getViewport({ scale });
      const canvas = createCanvas(
        Math.ceil(viewport.width),
        Math.ceil(viewport.height),
      );
      const ctx = canvas.getContext("2d");
      await page.render({ canvasContext: ctx, viewport }).promise;
      pages.push({ pageNumber: i, buffer: canvas.toBuffer("image/png") });
    }
    return pages;
  } finally {
    await doc.destroy().catch(() => {});
  }
}
