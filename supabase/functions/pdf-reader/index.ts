// Import unpdf for serverless PDF text extraction
import { getDocumentProxy } from "https://esm.sh/unpdf@0.11.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Extract text with layout preservation using text item positions
async function extractTextWithLayout(pdf: any): Promise<string[]> {
  const texts: string[] = [];
  
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    try {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      if (!textContent || !textContent.items || textContent.items.length === 0) {
        texts.push('');
        continue;
      }
      
      let pageText = '';
      let lastY = -1;
      let lastX = -1;
      const heights: number[] = [];
      
      // Calculate average height to detect titles
      for (const item of textContent.items) {
        if (item.height && item.height > 0) {
          heights.push(item.height);
        }
      }
      const avgHeight = heights.length > 0 
        ? heights.reduce((a: number, b: number) => a + b, 0) / heights.length 
        : 12;
      
      // Sort items by Y position (top to bottom) then X position (left to right for LTR, right to left for RTL)
      const sortedItems = [...textContent.items].sort((a: any, b: any) => {
        const yA = a.transform?.[5] || 0;
        const yB = b.transform?.[5] || 0;
        // Sort by Y descending (top of page has higher Y value in PDF coordinates)
        if (Math.abs(yA - yB) > avgHeight * 0.3) {
          return yB - yA;
        }
        // Same line - sort by X
        const xA = a.transform?.[4] || 0;
        const xB = b.transform?.[4] || 0;
        return xA - xB;
      });
      
      let currentLineY = -1;
      let isNewParagraph = false;
      let lineTexts: string[] = [];
      
      for (const item of sortedItems) {
        const y = item.transform?.[5] || 0;
        const x = item.transform?.[4] || 0;
        const height = item.height || avgHeight;
        const str = item.str || '';
        
        if (!str.trim() && !str.includes(' ')) continue;
        
        if (currentLineY === -1) {
          currentLineY = y;
        }
        
        const yDiff = Math.abs(currentLineY - y);
        
        // Check if this is a new line
        if (yDiff > avgHeight * 0.4) {
          // Flush current line
          if (lineTexts.length > 0) {
            const lineText = lineTexts.join(' ').trim();
            if (lineText) {
              // Check if previous line was a title (larger font)
              if (isNewParagraph && pageText.length > 0) {
                pageText += '\n\n';
              } else if (pageText.length > 0) {
                pageText += '\n';
              }
              pageText += lineText;
            }
          }
          
          // Check if this is a new paragraph (larger vertical gap)
          isNewParagraph = yDiff > avgHeight * 1.8;
          
          // Reset for new line
          lineTexts = [];
          currentLineY = y;
          lastX = -1;
        }
        
        // Check if this text item is a title (significantly larger font)
        const isTitle = height > avgHeight * 1.35;
        
        // Add spacing between words on same line if needed
        if (lastX !== -1 && lineTexts.length > 0) {
          const xGap = Math.abs(x - lastX);
          // If there's a significant gap, it might be intentional spacing
          if (xGap > avgHeight * 2) {
            lineTexts.push('   '); // Add extra spacing
          }
        }
        
        // Add title marker if detected
        if (isTitle && lineTexts.length === 0 && str.trim()) {
          lineTexts.push('## ');
        }
        
        lineTexts.push(str);
        lastX = x + (item.width || str.length * avgHeight * 0.5);
      }
      
      // Flush remaining line
      if (lineTexts.length > 0) {
        const lineText = lineTexts.join(' ').trim();
        if (lineText) {
          if (isNewParagraph && pageText.length > 0) {
            pageText += '\n\n';
          } else if (pageText.length > 0) {
            pageText += '\n';
          }
          pageText += lineText;
        }
      }
      
      // Clean up the text
      pageText = pageText
        .replace(/## \s+/g, '## ') // Clean title markers
        .replace(/\n{3,}/g, '\n\n') // Max 2 newlines
        .replace(/  +/g, ' ') // Normalize spaces
        .trim();
      
      texts.push(pageText);
      console.log(`Page ${pageNum}: extracted ${pageText.length} chars with layout`);
      
    } catch (pageError) {
      console.error(`Error extracting page ${pageNum}:`, pageError);
      texts.push('');
    }
  }
  
  return texts;
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

    // Extract text with layout preservation
    let texts: string[] = [];
    let totalPages = pdf.numPages || 0;

    try {
      console.log('Extracting text with layout preservation...');
      texts = await extractTextWithLayout(pdf);
      
      // Validate extraction
      if (texts.length === 0 && totalPages > 0) {
        texts = Array(totalPages).fill('');
      }
      
    } catch (extractError) {
      console.error('Text extraction with layout failed:', extractError);
      
      // Fallback: create empty pages
      texts = Array(totalPages).fill('');
      console.log(`Fallback: Created ${totalPages} empty text pages`);
    }

    // Ensure consistent data
    if (totalPages === 0 && texts.length > 0) {
      totalPages = texts.length;
    }

    const totalCharacters = texts.reduce((sum: number, page: string) => sum + (page || '').length, 0);
    
    console.log(`PDF text extraction completed: ${totalPages} pages, ${totalCharacters} total characters`);

    const result = {
      success: true,
      numPages: totalPages,
      texts,
      totalCharacters,
      layoutPreserved: true
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
      layoutPreserved: false
    };

    return new Response(JSON.stringify(errorResult), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
