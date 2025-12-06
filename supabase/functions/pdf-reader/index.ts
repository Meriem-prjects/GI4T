// Import unpdf for serverless PDF text extraction
import { getDocumentProxy } from "https://esm.sh/unpdf@0.11.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TextItem {
  str: string;
  transform?: number[];
  height?: number;
  width?: number;
  dir?: string;
}

interface TextContent {
  items: TextItem[];
}

/**
 * Reconstructs text structure from PDF text content items
 * Analyzes Y positions and font sizes to detect headings, paragraphs, and line breaks
 */
function reconstructTextStructure(textContent: TextContent): string {
  const items = textContent.items.filter((item: TextItem) => item.str && item.str.trim());
  
  if (items.length === 0) return '';
  
  // Calculate average height (font size) for detecting titles
  const heights = items.map((item: TextItem) => item.height || 10).filter(h => h > 0);
  const avgHeight = heights.length > 0 
    ? heights.reduce((sum: number, h: number) => sum + h, 0) / heights.length 
    : 10;
  
  let result = '';
  let lastY: number | null = null;
  let currentLine = '';
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const currentY = item.transform ? item.transform[5] : 0;
    const currentHeight = item.height || 10;
    const text = item.str;
    
    if (lastY !== null) {
      const deltaY = Math.abs(lastY - currentY);
      
      // Large gap = new paragraph (> 1.8x average font height)
      if (deltaY > avgHeight * 1.8) {
        // Flush current line
        if (currentLine.trim()) {
          result += currentLine.trim() + '\n\n';
          currentLine = '';
        }
      }
      // Small gap = new line (> 0.4x average font height)
      else if (deltaY > avgHeight * 0.4) {
        // Flush current line
        if (currentLine.trim()) {
          result += currentLine.trim() + '\n';
          currentLine = '';
        }
      }
    }
    
    // Detect potential heading (font size > 1.35x average and short text)
    const isHeading = currentHeight > avgHeight * 1.35 && text.trim().length < 100 && text.trim().length > 2;
    
    if (isHeading && currentLine.trim() === '') {
      // Start a new heading
      currentLine = `## ${text}`;
    } else if (isHeading && currentLine.startsWith('## ')) {
      // Continue heading on same line
      currentLine += ' ' + text;
    } else {
      // Regular text - add to current line
      if (currentLine && !currentLine.endsWith(' ') && !text.startsWith(' ')) {
        currentLine += ' ';
      }
      currentLine += text;
    }
    
    lastY = currentY;
  }
  
  // Flush remaining content
  if (currentLine.trim()) {
    result += currentLine.trim();
  }
  
  return result.trim();
}

/**
 * Converts structured text (with ## markers and \n) to HTML for CKEditor
 */
function convertStructuredTextToHTML(text: string): string {
  if (!text) return '';
  
  let html = text;
  
  // Convert heading markers to HTML
  // ## Heading -> <h2>Heading</h2>
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  // # Heading -> <h1>Heading</h1>
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  
  // Split by paragraph breaks (double newlines)
  const blocks = html.split(/\n\n+/);
  
  html = blocks
    .map(block => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      
      // Don't wrap headings in <p>
      if (trimmed.startsWith('<h1>') || trimmed.startsWith('<h2>')) {
        return trimmed;
      }
      
      // Wrap regular text in paragraphs, convert single newlines to <br/>
      const withBreaks = trimmed.replace(/\n/g, '<br/>');
      return `<p>${withBreaks}</p>`;
    })
    .filter(block => block)
    .join('\n');
  
  return html;
}

Deno.serve(async (req) => {
  console.log('PDF reader function called');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Récupérer le PDF envoyé
    const arrayBuffer = await req.arrayBuffer();
    
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      throw new Error('No PDF data provided');
    }

    console.log(`Processing PDF: ${arrayBuffer.byteLength} bytes`);

    // Check file size limit (50MB for PDF processing)
    if (arrayBuffer.byteLength > 50 * 1024 * 1024) {
      throw new Error('PDF trop volumineux. Limite : 50MB');
    }

    const typedArray = new Uint8Array(arrayBuffer);

    // Enhanced PDF validation - check for PDF header with multiple valid formats
    const pdfHeader = new TextDecoder('latin1').decode(typedArray.slice(0, 10));
    const validHeaders = ['%PDF-1.', '%PDF-2.', '%PDF', 'PDF-'];
    const isValidPDF = validHeaders.some(header => pdfHeader.includes(header));
    
    if (!isValidPDF) {
      console.warn(`Invalid PDF header detected: ${pdfHeader}`);
      // Still try to process - some PDFs have non-standard headers
    }

    // Load PDF document using unpdf with robust error handling
    console.log('Loading PDF document with unpdf...');
    let pdf;
    try {
      pdf = await getDocumentProxy(typedArray);
      console.log(`PDF loaded successfully. Total pages: ${pdf.numPages}`);
    } catch (loadError) {
      console.error('Failed to load PDF with unpdf:', loadError);
      throw new Error(`Impossible de charger le PDF: ${loadError instanceof Error ? loadError.message : String(loadError)}`);
    }

    // Extract text from all pages using getTextContent() for position analysis
    const texts: string[] = [];
    const htmlTexts: string[] = [];
    const totalPages = pdf.numPages || 0;

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Reconstruct structured text with layout analysis
        const structuredText = reconstructTextStructure(textContent as TextContent);
        texts.push(structuredText);
        
        // Convert to HTML for CKEditor
        const htmlContent = convertStructuredTextToHTML(structuredText);
        htmlTexts.push(htmlContent);
        
        console.log(`Page ${pageNum}: ${structuredText.length} chars extracted, ${htmlContent.length} chars HTML`);
      } catch (pageError) {
        console.error(`Error extracting page ${pageNum}:`, pageError);
        texts.push('');
        htmlTexts.push('');
      }
    }

    const totalCharacters = texts.reduce((sum: number, page: string) => sum + (page || '').length, 0);
    
    console.log(`PDF text extraction completed: ${totalPages} pages, ${totalCharacters} total characters`);

    const result = {
      success: true,
      numPages: totalPages,
      texts,           // Structured text with ## markers and \n
      htmlTexts,       // HTML formatted for CKEditor
      totalCharacters
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error('Error in pdf-reader function:', error);
    
    const errorResult = {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      numPages: 0,
      texts: [],
      htmlTexts: []
    };

    return new Response(JSON.stringify(errorResult), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
