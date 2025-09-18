import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Import PDF.js for proper PDF parsing
const PDFJS_VERSION = '4.0.379';
const PDF_JS_URL = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.min.mjs`;

// Load PDF.js dynamically
const pdfjs = await import(PDF_JS_URL);

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.mjs`;

async function extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    console.log('Loading PDF with PDF.js, size:', arrayBuffer.byteLength, 'bytes');
    
    // Load the PDF document
    const pdf = await pdfjs.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
      verbosity: 0
    }).promise;
    
    console.log('PDF loaded successfully, pages:', pdf.numPages);
    
    let fullText = '';
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent({
          includeMarkedContent: true,
          disableNormalization: false
        });
        
        let pageText = '';
        
        // Process text items with proper spacing and line breaks
        let previousY = null;
        let currentLine = '';
        
        for (const item of textContent.items) {
          if ('str' in item && item.str.trim()) {
            // Check if we're on a new line (significant Y position change)
            if (previousY !== null && Math.abs(item.transform[5] - previousY) > 5) {
              if (currentLine.trim()) {
                pageText += currentLine.trim() + '\n';
                currentLine = '';
              }
            }
            
            // Add space if needed based on X position gap
            if (currentLine && item.transform[4] - getPreviousX(textContent.items, textContent.items.indexOf(item)) > 10) {
              currentLine += ' ';
            }
            
            currentLine += item.str;
            previousY = item.transform[5];
          }
        }
        
        // Add the last line
        if (currentLine.trim()) {
          pageText += currentLine.trim() + '\n';
        }
        
        console.log(`Page ${pageNum} extracted ${pageText.length} characters`);
        
        if (pageText.trim()) {
          fullText += `\n--- Page ${pageNum} ---\n${pageText}\n`;
        }
        
      } catch (pageError) {
        console.error(`Error extracting page ${pageNum}:`, pageError);
        fullText += `\n--- Page ${pageNum} (erreur d'extraction) ---\n`;
      }
    }
    
    // Clean up the extracted text
    fullText = fullText
      .replace(/\n{3,}/g, '\n\n') // Normalize line breaks
      .replace(/\s{2,}/g, ' ') // Normalize spaces
      .trim();
    
    console.log('Total extracted text length:', fullText.length);
    console.log('First 300 characters:', fullText.substring(0, 300));
    
    if (fullText.length < 20) {
      throw new Error('Insufficient text extracted from PDF');
    }
    
    return fullText;
    
  } catch (error) {
    console.error('PDF.js extraction failed:', error);
    
    // Fallback to basic binary extraction for corrupted PDFs
    console.log('Attempting fallback extraction...');
    return extractFallbackText(arrayBuffer);
  }
}

function getPreviousX(items: any[], currentIndex: number): number {
  for (let i = currentIndex - 1; i >= 0; i--) {
    if ('transform' in items[i]) {
      return items[i].transform[4];
    }
  }
  return 0;
}

function extractFallbackText(arrayBuffer: ArrayBuffer): string {
  try {
    const uint8Array = new Uint8Array(arrayBuffer);
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const text = decoder.decode(uint8Array);
    
    // Extract readable text sequences
    const readableText = text.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\w\s.,!?;:()\-'"]{3,}/g);
    
    if (readableText && readableText.length > 0) {
      return readableText.join(' ').replace(/\s+/g, ' ').trim();
    }
    
    return 'Contenu PDF détecté mais nécessite un traitement OCR pour une extraction précise.';
    
  } catch (error) {
    console.error('Fallback extraction failed:', error);
    return `Erreur d'extraction PDF: ${error.message}`;
  }
}

serve(async (req) => {
  console.log('PDF parser function called');

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

    console.log(`Parsing PDF: ${file.name}, size: ${file.size}`);

    // Read file as ArrayBuffer for PDF processing
    const arrayBuffer = await file.arrayBuffer();
    
    // Extract text content from PDF
    const extractedText = await extractTextFromPDF(arrayBuffer);
    
    console.log(`Extracted text length: ${extractedText.length} characters`);

    return new Response(JSON.stringify({ 
      success: true,
      text: extractedText,
      filename: file.name,
      size: file.size
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in pdf-parser function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});