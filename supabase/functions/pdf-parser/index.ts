import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced PDF text extraction using multiple approaches
function extractTextFromPDF(arrayBuffer: ArrayBuffer): string {
  try {
    const uint8Array = new Uint8Array(arrayBuffer);
    const decoder = new TextDecoder('latin1');
    const pdfText = decoder.decode(uint8Array);
    
    console.log('PDF file size:', uint8Array.length);
    
    let extractedText = '';
    
    // Method 1: Extract text from Tj and TJ commands
    const textRegex = /BT\s+(.*?)\s+ET/gs;
    const textMatches = pdfText.match(textRegex) || [];
    
    console.log('Found', textMatches.length, 'text blocks');
    
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
    
    // Method 2: Extract from stream objects
    const streamRegex = /stream\s+(.*?)\s+endstream/gs;
    const streamMatches = pdfText.match(streamRegex) || [];
    
    console.log('Found', streamMatches.length, 'streams');
    
    for (const stream of streamMatches) {
      // Look for text patterns in streams
      const textInStream = stream.match(/\((.*?)\)/g) || [];
      for (const text of textInStream) {
        const cleanText = text.replace(/[()]/g, '');
        if (cleanText.length > 1 && /[a-zA-ZÀ-ÿ]/.test(cleanText)) {
          extractedText += cleanText + ' ';
        }
      }
    }
    
    // Method 3: Direct text search for common patterns
    const directTextRegex = /\([^)]{2,100}\)/g;
    const directMatches = pdfText.match(directTextRegex) || [];
    
    console.log('Found', directMatches.length, 'direct text matches');
    
    for (const match of directMatches) {
      const cleanText = match.replace(/[()]/g, '');
      if (cleanText.length > 2 && /[a-zA-ZÀ-ÿ0-9]/.test(cleanText)) {
        extractedText += cleanText + ' ';
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
      .replace(/[^\w\s\u00C0-\u017F.,!?;:()\-]/g, '') // Keep only readable characters
      .trim();
    
    console.log('Extracted text length:', extractedText.length);
    console.log('First 200 chars:', extractedText.substring(0, 200));
    
    // If we didn't extract much text, try a different approach
    if (extractedText.length < 50) {
      console.log('Trying alternative extraction method...');
      
      // Alternative: look for any readable text patterns
      const alternativeRegex = /[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ0-9\s.,!?;:()\-]{5,}/g;
      const alternativeMatches = pdfText.match(alternativeRegex) || [];
      
      for (const match of alternativeMatches) {
        if (match.trim().length > 5) {
          extractedText += match.trim() + ' ';
        }
      }
      
      extractedText = extractedText.replace(/\s+/g, ' ').trim();
      console.log('Alternative extraction result length:', extractedText.length);
    }
    
    return extractedText.length > 10 ? extractedText : 'Le contenu de ce PDF nécessite un traitement plus avancé pour être extrait correctement.';
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    return 'Erreur lors de l\'extraction du contenu PDF: ' + error.message;
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