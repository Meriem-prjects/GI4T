import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple PDF text extraction using basic patterns
function extractTextFromPDF(arrayBuffer: ArrayBuffer): string {
  try {
    const uint8Array = new Uint8Array(arrayBuffer);
    const decoder = new TextDecoder('latin1');
    const pdfText = decoder.decode(uint8Array);
    
    // Extract text between stream objects - basic PDF text extraction
    const textRegex = /BT\s+(.*?)\s+ET/gs;
    const textMatches = pdfText.match(textRegex) || [];
    
    let extractedText = '';
    for (const match of textMatches) {
      // Extract text from Tj commands
      const tjRegex = /\((.*?)\)\s*Tj/g;
      let tjMatch;
      while ((tjMatch = tjRegex.exec(match)) !== null) {
        extractedText += tjMatch[1] + ' ';
      }
      
      // Extract text from TJ commands (array format)
      const tjArrayRegex = /\[(.*?)\]\s*TJ/g;
      let tjArrayMatch;
      while ((tjArrayMatch = tjArrayRegex.exec(match)) !== null) {
        const textArray = tjArrayMatch[1];
        // Extract strings from array
        const stringRegex = /\((.*?)\)/g;
        let stringMatch;
        while ((stringMatch = stringRegex.exec(textArray)) !== null) {
          extractedText += stringMatch[1] + ' ';
        }
      }
    }
    
    // Clean up the extracted text
    extractedText = extractedText
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\\\/g, '\\')
      .replace(/\\\(/g, '(')
      .replace(/\\\)/g, ')')
      .replace(/\s+/g, ' ')
      .trim();
    
    return extractedText || 'Contenu PDF extrait';
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    return 'Erreur lors de l\'extraction du contenu PDF';
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
    const extractedText = extractTextFromPDF(arrayBuffer);
    
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