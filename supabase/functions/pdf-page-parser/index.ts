import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PageContent {
  pageNumber: number;
  content: string;
  confidence: number;
}

interface ParseResult {
  success: boolean;
  totalPages: number;
  processedPages: number;
  pages: PageContent[];
  fullText: string;
  error?: string;
}

// Simple text extraction from PDF - first page only
async function extractFirstPageText(pdfBuffer: ArrayBuffer): Promise<{ rawText: string, totalPages: number }> {
  try {
    const uint8Array = new Uint8Array(pdfBuffer);
    const pdfString = new TextDecoder('latin1', { fatal: false }).decode(uint8Array.slice(0, Math.min(uint8Array.length, 50000)));
    
    console.log('PDF size:', uint8Array.length, 'bytes');
    
    // Count total pages
    const pageMatches = pdfString.match(/\/Type\s*\/Page\b/g) || [];
    const totalPages = Math.max(pageMatches.length, 1);
    
    console.log(`Detected ${totalPages} total pages, processing first page only`);
    
    // Extract text from first portion only (approximation of first page)
    const firstPageText = extractTextFromPageContent(pdfString.slice(0, Math.floor(pdfString.length / Math.max(totalPages, 1))));
    
    console.log(`First page: extracted ${firstPageText.length} characters`);
    
    return { rawText: firstPageText, totalPages };
  } catch (error) {
    console.error('Error extracting first page text:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to extract text: ${errorMessage}`);
  }
}

// Simple text extraction from PDF content
function extractTextFromPageContent(pageContent: string): string {
  let extractedText = '';
  
  // Basic text extraction patterns
  const textPatterns = [
    /\(([^)]+)\)\s*(?:Tj|'|")/g, // Simple text commands
    /\(([^)]+)\)/g // Any text in parentheses
  ];
  
  for (const pattern of textPatterns) {
    let match;
    while ((match = pattern.exec(pageContent)) !== null) {
      const text = match[1];
      if (text && text.length > 1) {
        extractedText += processTextString(text) + ' ';
      }
    }
  }
  
  return cleanExtractedText(extractedText);
}

// Process text strings with escape sequences
function processTextString(text: string): string {
  return text
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\\/g, '\\')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .trim();
}

// Clean extracted text
function cleanExtractedText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-ZÀ-ÿ0-9\s.,!?;:()\-'"]/g, '')
    .trim();
}

serve(async (req) => {
  console.log('PDF page parser function called');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      throw new Error('No file provided');
    }

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      throw new Error('File is not a PDF');
    }

    console.log(`Processing PDF: ${file.name} (${file.size} bytes) - first page only`);

    // Extract text from first page only
    const pdfBuffer = await file.arrayBuffer();
    const { rawText, totalPages } = await extractFirstPageText(pdfBuffer);
    
    console.log(`Extracted ${rawText.length} characters from first page`);

    // Build simple result
    const pageContent: PageContent = {
      pageNumber: 1,
      content: rawText.trim(),
      confidence: rawText.length > 0 ? 0.8 : 0.1
    };

    const result: ParseResult = {
      success: true,
      totalPages,
      processedPages: 1,
      pages: [pageContent],
      fullText: rawText.trim()
    };

    console.log(`PDF parsing completed. First page processed successfully.`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in pdf-page-parser function:', error);
    
    const errorResult: ParseResult = {
      success: false,
      totalPages: 0,
      processedPages: 0,
      pages: [],
      fullText: '',
      error: error instanceof Error ? error.message : String(error)
    };

    return new Response(JSON.stringify(errorResult), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});