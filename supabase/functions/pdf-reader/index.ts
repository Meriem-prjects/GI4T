// Import unpdf for serverless PDF text extraction
import { extractText, getDocumentProxy } from "npm:unpdf@1.2.2";

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

    // Load PDF document using unpdf
    console.log('Loading PDF document with unpdf...');
    const pdf = await getDocumentProxy(typedArray);
    
    console.log(`PDF loaded successfully. Total pages: ${pdf.numPages}`);

    // Extract text from all pages
    const { totalPages, text, pages } = await extractText(pdf, { mergePages: false });
    
    // Convert pages array to texts array for backward compatibility
    const texts = pages.map(page => page.text);

    console.log(`PDF text extraction completed: ${totalPages} pages, ${texts.reduce((sum, page) => sum + page.length, 0)} total characters`);

    const result = {
      success: true,
      numPages: totalPages,
      texts,
      totalCharacters: texts.reduce((sum, page) => sum + page.length, 0)
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error('Error in pdf-reader function:', error);
    
    const errorResult = {
      success: false,
      error: error.message,
      numPages: 0,
      texts: []
    };

    return new Response(JSON.stringify(errorResult), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});