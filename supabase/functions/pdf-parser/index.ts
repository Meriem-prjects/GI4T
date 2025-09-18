import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as pdfjsLib from "https://esm.sh/pdfjs-dist@4.7.76";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PdfParseResult {
  success: boolean;
  text: string;
  pages: string[];
  metadata?: {
    pageCount: number;
    title?: string;
  };
  error?: string;
}

// Utility to normalize extracted text (handles odd spaces and null chars)
function normalizeText(input: string) {
  return input
    .replace(/\u0000/g, '')
    .replace(/\uFFFD/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(
        JSON.stringify({ success: false, error: 'Aucun fichier fourni' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing PDF file (pdfjs):', file.name, 'Size:', file.size);

    const fileBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(fileBuffer);

    let extractedText = '';
    let pages: string[] = [];
    let pageCount = 0;

    // Primary extraction using PDF.js (robust + per-page)
    try {
      // Use PDF.js in no-worker mode (Edge Functions do not support web workers)
      // @ts-ignore - VerbosityLevel exists in pdfjs
      const loadingTask = (pdfjsLib as any).getDocument({
        data: uint8Array,
        disableWorker: true,
        disableRange: true,
        disableStream: true,
        disableAutoFetch: true,
        isEvalSupported: false,
        disableFontFace: true,
        // @ts-ignore - VerbosityLevel exists in pdfjs
        verbosity: (pdfjsLib as any).VerbosityLevel?.ERRORS ?? 0,
      });

      const pdf = await (loadingTask as any).promise;
      pageCount = pdf.numPages || 0;
      console.log('PDF loaded with pages:', pageCount);

      for (let i = 1; i <= pageCount; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent({ includeMarkedContent: true });

        const parts: string[] = [];
        for (const item of (textContent.items || []) as any[]) {
          // TextItem has a `str` property
          const s = (item && typeof item.str === 'string') ? item.str : '';
          if (s) parts.push(s);
        }

        let pageText = parts.join(' ');
        pageText = normalizeText(pageText);

        // Avoid empty pages when possible
        if (pageText.length < 3) {
          // Light attempt to preserve newlines when items declare end-of-line
          const partsWithEOL: string[] = [];
          for (const item of (textContent.items || []) as any[]) {
            const s = (item && typeof item.str === 'string') ? item.str : '';
            if (!s) continue;
            partsWithEOL.push(s);
            if ((item as any).hasEOL) partsWithEOL.push('\n');
          }
          pageText = normalizeText(partsWithEOL.join(' '));
        }

        pages.push(pageText);
      }

      // Join all pages with clear separation for the `text` field
      extractedText = normalizeText(pages.join('\n\n'));

      console.log('PDF.js extraction done. Pages:', pages.length, 'Total text length:', extractedText.length);
    } catch (pdfjsError) {
      console.error('PDF.js extraction failed, falling back to basic parser:', pdfjsError);

      try {
        // Fallback (very basic) – last resort if PDF.js fails
        const pdfString = new TextDecoder('latin1').decode(uint8Array);
        const streamRegex = /stream\s*(.*?)\s*endstream/gs;
        const matches = pdfString.match(streamRegex) || [];
        let allText = '';
        for (const match of matches) {
          const streamContent = match.replace(/^stream\s*/, '').replace(/\s*endstream$/, '');
          const textMatches = streamContent.match(/\(([^)]+)\)/g) || [];
          for (const textMatch of textMatches) {
            const text = textMatch.slice(1, -1);
            if (text.length > 1) allText += text + ' ';
          }
        }
        extractedText = normalizeText(allText);
        if (extractedText) pages = [extractedText];
      } catch (fallbackErr) {
        console.error('Fallback parser failed:', fallbackErr);
      }
    }

    if (!extractedText || extractedText.length < 5) {
      const placeholder = `المستند: ${file.name}\n\nلم يتمكن النظام من استخراج النص بشكل مباشر. حاول ملفاً آخر أو استخدم التحرير اليدوي.`;
      extractedText = placeholder;
      pages = [placeholder];
      pageCount = 1;
    }

    const result: PdfParseResult = {
      success: true,
      text: extractedText,
      pages,
      metadata: {
        pageCount: pageCount || pages.length,
        title: file.name.replace(/\.[^/.]+$/, '')
      }
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in pdf-parser function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Erreur lors du parsing PDF',
        details: error?.message || String(error)
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});