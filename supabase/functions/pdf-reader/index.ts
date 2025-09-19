import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Import de pdfjs depuis un CDN compatible Deno
import * as pdfjsLib from "https://esm.sh/pdfjs-dist@3.11.174/es5/build/pdf.js";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
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
    const pages: string[] = [];

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
        
        pages.push(text);
        console.log(`Page ${i} processed: ${text.length} characters`);
      } catch (pageError) {
        console.error(`Error processing page ${i}:`, pageError);
        pages.push(""); // Add empty page to maintain index consistency
      }
    }

    const result = {
      success: true,
      numPages,
      pages,
      totalCharacters: pages.reduce((sum, page) => sum + page.length, 0)
    };

    console.log(`PDF processing completed: ${pages.length} pages, ${result.totalCharacters} total characters`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error('Error in pdf-reader function:', error);
    
    const errorResult = {
      success: false,
      error: error.message,
      numPages: 0,
      pages: []
    };

    return new Response(JSON.stringify(errorResult), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});