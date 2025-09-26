// Import unpdf for serverless PDF text extraction
import { extractText, getDocumentProxy } from "https://esm.sh/unpdf@1.2.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
      const errorMessage = loadError instanceof Error ? loadError.message : String(loadError);
      throw new Error(`Impossible de charger le PDF: ${errorMessage}`);
    }

    // Extract text from all pages with comprehensive error handling
    let extractionResult;
    let texts = [];
    let totalPages = 0;

    try {
      extractionResult = await extractText(pdf, { mergePages: false });
      
      // Validate extraction result structure
      if (extractionResult && typeof extractionResult === 'object') {
        totalPages = extractionResult.totalPages || pdf.numPages || 0;
        
        // Handle the actual format returned by unpdf
        if (extractionResult.text && Array.isArray(extractionResult.text)) {
          texts = extractionResult.text.map(pageText => String(pageText || ''));
        } else if (extractionResult.pages && Array.isArray(extractionResult.pages)) {
          texts = extractionResult.pages.map(page => 
            (page && typeof page === 'object' && page.text) ? page.text : String(page || '')
          );
        } else if (extractionResult.text && typeof extractionResult.text === 'string') {
          // If we got a single text string, treat it as page 1
          texts = [extractionResult.text];
          totalPages = 1;
        } else {
          console.warn('Unexpected extraction result format:', extractionResult);
          texts = [];
        }
      } else {
        console.warn('extractText returned invalid result:', extractionResult);
        texts = [];
      }

    } catch (extractError) {
      console.error('Text extraction failed:', extractError);
      
      // Fallback: try to get basic document info and create empty pages
      totalPages = pdf.numPages || 0;
      texts = Array(totalPages).fill('');
      
      console.log(`Fallback: Created ${totalPages} empty text pages for PDF structure`);
    }

    // Ensure we have consistent data
    if (texts.length === 0 && totalPages > 0) {
      texts = Array(totalPages).fill('');
    } else if (totalPages === 0 && texts.length > 0) {
      totalPages = texts.length;
    }

    const totalCharacters = texts.reduce((sum, page) => sum + (page || '').length, 0);
    
    console.log(`PDF text extraction completed: ${totalPages} pages, ${totalCharacters} total characters`);

    const result = {
      success: true,
      numPages: totalPages,
      texts,
      totalCharacters
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error('Error in pdf-reader function:', error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorResult = {
      success: false,
      error: errorMessage,
      numPages: 0,
      texts: []
    };

    return new Response(JSON.stringify(errorResult), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});