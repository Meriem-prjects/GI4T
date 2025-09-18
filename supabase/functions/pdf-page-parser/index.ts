import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

// Configuration for page processing - optimized to avoid CPU timeout
const MAX_PAGES_PER_BATCH = 3; // Reduced to 3 pages per batch
const MAX_TOTAL_PAGES = 8; // Reduced maximum to 8 pages for faster processing

interface PageContent {
  pageNumber: number;
  content: string;
  confidence?: number;
}

interface ParseResult {
  success: boolean;
  totalPages: number;
  processedPages: number;
  pages: PageContent[];
  fullText: string;
  error?: string;
}

// Extract raw text from PDF pages using enhanced text extraction
async function extractPDFPagesText(pdfBuffer: ArrayBuffer, maxPages: number): Promise<{ pages: { pageNumber: number, rawText: string }[], totalPages: number }> {
  try {
    const uint8Array = new Uint8Array(pdfBuffer);
    const pdfString = new TextDecoder('latin1', { fatal: false }).decode(uint8Array.slice(0, Math.min(uint8Array.length, 100000))); // Limit initial processing
    
    console.log('PDF size:', uint8Array.length, 'bytes');
    
    // Count pages by looking for page objects and page boundaries
    const pageMatches = pdfString.match(/\/Type\s*\/Page\b/g) || [];
    const pageBreaks = pdfString.match(/\/Page\b[^}]*?endobj/g) || [];
    const totalPages = Math.min(Math.max(pageMatches.length, pageBreaks.length, 1), maxPages);
    
    console.log(`Detected ${totalPages} pages (max ${maxPages})`);
    
    const pages: { pageNumber: number, rawText: string }[] = [];
    
    // Try to extract text for each page
    const pdfLength = pdfString.length;
    const pageSize = Math.floor(pdfLength / totalPages);
    
    for (let i = 0; i < totalPages; i++) {
      const pageNumber = i + 1;
      const startIndex = i * pageSize;
      const endIndex = (i === totalPages - 1) ? pdfLength : (i + 1) * pageSize;
      
      const pageContent = pdfString.slice(startIndex, endIndex);
      const extractedText = extractTextFromPageContent(pageContent);
      
      pages.push({
        pageNumber,
        rawText: extractedText
      });
      
      console.log(`Page ${pageNumber}: extracted ${extractedText.length} characters`);
    }
    
    return { pages, totalPages };
  } catch (error) {
    console.error('Error extracting PDF pages text:', error);
    throw new Error(`Failed to extract PDF pages text: ${error.message}`);
  }
}

// Enhanced text extraction for a specific page content
function extractTextFromPageContent(pageContent: string): string {
  let extractedText = '';
  
  // Extract text from various PDF structures
  const textPatterns = [
    // Text showing commands
    /\(([^)]*(?:\\.[^)]*)*)\)\s*(?:Tj|'|")/g,
    // Text arrays
    /\[([^\]]*)\]\s*TJ/g,
    // Stream content
    /stream\s+([\s\S]*?)\s+endstream/g
  ];
  
  for (const pattern of textPatterns) {
    let match;
    while ((match = pattern.exec(pageContent)) !== null) {
      let text = match[1];
      
      if (pattern.source.includes('TJ')) {
        // Handle text arrays
        const stringMatches = text.match(/\(([^)]*(?:\\.[^)]*)*)\)/g) || [];
        for (const stringMatch of stringMatches) {
          const innerText = stringMatch.match(/\(([^)]*(?:\\.[^)]*)*)\)/)?.[1] || '';
          if (innerText.length > 1) {
            extractedText += processTextString(innerText) + ' ';
          }
        }
      } else if (pattern.source.includes('stream')) {
        // Handle stream content
        const streamText = extractTextFromStream(text);
        if (streamText) {
          extractedText += streamText + ' ';
        }
      } else {
        // Handle direct text
        if (text && text.length > 1) {
          extractedText += processTextString(text) + ' ';
        }
      }
    }
  }
  
  return cleanExtractedText(extractedText);
}

// Extract text from PDF streams
function extractTextFromStream(streamContent: string): string {
  let text = '';
  
  // Look for readable text patterns in streams
  const readableMatches = streamContent.match(/[\x20-\x7E\u0600-\u06FF]+/g) || [];
  for (const match of readableMatches) {
    if (match.length > 2 && /[a-zA-Z\u0600-\u06FF]/.test(match)) {
      text += match + ' ';
    }
  }
  
  return text.trim();
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
    .replace(/\\(\d{3})/g, (_, octal) => {
      const code = parseInt(octal, 8);
      return code > 31 && code < 127 ? String.fromCharCode(code) : '';
    })
    .replace(/\\u([0-9A-Fa-f]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .trim();
}

// Clean and validate extracted text
function cleanExtractedText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/(.)\1{4,}/g, '$1$1') // Reduce repetition
    .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-ZÀ-ÿ0-9\s.,!?;:()\-'"]/g, '')
    .trim();
}

// Process a single page with OpenAI for text enhancement
async function processPageWithOpenAI(rawText: string, pageNumber: number): Promise<PageContent> {
  try {
    console.log(`Processing page ${pageNumber} with OpenAI for text enhancement...`);
    
    // Skip OpenAI processing if raw text is too short or empty
    if (!rawText || rawText.length < 10) {
      return {
        pageNumber,
        content: rawText || `[Page ${pageNumber} - Aucun texte extractible]`,
        confidence: 0.1
      };
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 2000,
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en nettoyage et amélioration de texte extrait de PDF. Ton rôle est de:\n1. Corriger les erreurs d\'extraction (caractères mal formés, mots coupés)\n2. Reconstituer les phrases et paragraphes\n3. Préserver fidèlement le contenu original\n4. Maintenir la langue originale (français, arabe, etc.)\n5. Structurer le texte de manière lisible\n\nRetourne uniquement le texte amélioré, sans commentaires ni explications.'
          },
          {
            role: 'user',
            content: `Améliore et nettoie ce texte extrait de la page ${pageNumber} d'un document PDF:\n\n${rawText}`
          }
        ],
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`OpenAI API error for page ${pageNumber}: ${response.status} - ${errorText}`);
      // Fallback to raw text if OpenAI fails
      return {
        pageNumber,
        content: rawText,
        confidence: 0.5
      };
    }

    const data = await response.json();
    const enhancedText = data.choices[0]?.message?.content || rawText;
    
    console.log(`Page ${pageNumber} enhanced successfully. Original: ${rawText.length} chars, Enhanced: ${enhancedText.length} chars`);
    
    return {
      pageNumber,
      content: enhancedText.trim(),
      confidence: enhancedText.length > rawText.length * 0.8 ? 0.9 : 0.7
    };
  } catch (error) {
    console.error(`Error enhancing page ${pageNumber}:`, error);
    // Fallback to raw text
    return {
      pageNumber,
      content: rawText || `[Erreur lors du traitement de la page ${pageNumber}]`,
      confidence: 0.3
    };
  }
}

// Process pages in batches
async function processPagesInBatches(pageTexts: { pageNumber: number, rawText: string }[]): Promise<PageContent[]> {
  const results: PageContent[] = [];
  
  for (let i = 0; i < pageTexts.length; i += MAX_PAGES_PER_BATCH) {
    const batch = pageTexts.slice(i, i + MAX_PAGES_PER_BATCH);
    console.log(`Processing batch ${Math.floor(i / MAX_PAGES_PER_BATCH) + 1}: pages ${batch[0]?.pageNumber}-${batch[batch.length - 1]?.pageNumber}`);
    
    // Process pages in parallel within the batch
    const batchPromises = batch.map(page => 
      processPageWithOpenAI(page.rawText, page.pageNumber)
    );
    
    try {
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Small delay between batches to respect rate limits and avoid CPU timeout
      if (i + MAX_PAGES_PER_BATCH < pageTexts.length) {
        await new Promise(resolve => setTimeout(resolve, 3000)); // Increased delay to 3 seconds
      }
    } catch (error) {
      console.error(`Error processing batch starting at page ${batch[0]?.pageNumber}:`, error);
      // Continue with other batches even if one fails
      for (const page of batch) {
        results.push({
          pageNumber: page.pageNumber,
          content: page.rawText || `[Erreur lors du traitement de la page ${page.pageNumber}]`,
          confidence: 0.2
        });
      }
    }
  }
  
  return results;
}

serve(async (req) => {
  console.log('PDF page parser function called');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // No OpenAI dependency for simple transcription

    const formData = await req.formData();
    const requested = parseInt(formData.get('maxPages') as string) || 1;
    const maxPages = 1; // Force 1st page only for fast transcription

    if (!file) {
      throw new Error('No file provided');
    }

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      throw new Error('File is not a PDF');
    }

    console.log(`Starting page-by-page parsing of: ${file.name} (${file.size} bytes, max ${maxPages} pages)`);

    // Extract raw text from PDF pages
    const pdfBuffer = await file.arrayBuffer();
    const { pages: rawPages, totalPages } = await extractPDFPagesText(pdfBuffer, maxPages);
    
    console.log(`Extracted raw text from ${rawPages.length} pages out of ${totalPages} total pages`);

    // Build page contents without OpenAI
    const pageContents = rawPages.map(p => ({
      pageNumber: p.pageNumber,
      content: (p.rawText || '').trim(),
      confidence: (p.rawText && p.rawText.length > 0) ? 0.8 : 0.1,
    }));
    
    // Combine all page content
    const fullText = pageContents
      .sort((a, b) => a.pageNumber - b.pageNumber)
      .map(page => page.content)
      .join('\n');

    const result: ParseResult = {
      success: true,
      totalPages,
      processedPages: pageContents.length,
      pages: pageContents,
      fullText
    };

    console.log(`PDF parsing completed. Processed ${result.processedPages}/${result.totalPages} pages`);
    console.log(`Total extracted text length: ${result.fullText.length} characters`);

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
      error: error.message
    };

    return new Response(JSON.stringify(errorResult), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});