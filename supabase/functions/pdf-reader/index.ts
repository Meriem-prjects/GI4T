// Import ESM pdf.js bundle
import * as pdfjsLib from "https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.mjs";

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

    // Charger le document
    const loadingTask = pdfjsLib.getDocument({ 
      data: typedArray,
      verbosity: 0 // Reduce logging
    });
    const pdf = await loadingTask.promise;

    const numPages = pdf.numPages;
    const texts: string[] = [];

    console.log(`PDF loaded successfully. Total pages: ${numPages}`);

    // Extraire texte de chaque page
    for (let i = 1; i <= numPages; i++) {
      console.log(`Processing page ${i}/${numPages}...`);
      
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const text = textContent.items
          .map((item: any) => item.str)
          .join(" ")
          .trim();
        
        texts.push(text);
        console.log(`Page ${i} processed: ${text.length} characters`);
      } catch (pageError) {
        console.error(`Error processing page ${i}:`, pageError);
        texts.push(""); // Add empty page to maintain index consistency
      }
    }

    const result = {
      success: true,
      numPages,
      texts,
      totalCharacters: texts.reduce((sum, page) => sum + page.length, 0)
    };

    console.log(`PDF processing completed: ${texts.length} pages, ${result.totalCharacters} total characters`);

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