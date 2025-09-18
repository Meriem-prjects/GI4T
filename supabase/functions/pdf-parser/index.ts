import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced PDF text extraction with multiple robust approaches
function extractTextFromPDF(arrayBuffer: ArrayBuffer): string {
  try {
    const uint8Array = new Uint8Array(arrayBuffer);
    console.log('PDF file size:', uint8Array.length, 'bytes');
    
    // Try multiple encoding approaches
    const encodings = ['utf-8', 'latin1', 'windows-1252'];
    let bestExtraction = '';
    
    for (const encoding of encodings) {
      try {
        const decoder = new TextDecoder(encoding);
        const pdfText = decoder.decode(uint8Array);
        const extracted = extractTextWithEncoding(pdfText, encoding);
        
        if (extracted.length > bestExtraction.length) {
          bestExtraction = extracted;
          console.log(`Better extraction with ${encoding}: ${extracted.length} chars`);
        }
      } catch (e) {
        console.log(`Failed with encoding ${encoding}:`, e.message);
      }
    }
    
    // If still no good extraction, try binary approach
    if (bestExtraction.length < 50) {
      console.log('Trying binary extraction approach...');
      bestExtraction = extractTextFromBinary(uint8Array);
    }
    
    console.log('Final extracted text length:', bestExtraction.length);
    console.log('First 300 chars:', bestExtraction.substring(0, 300));
    
    return bestExtraction.length > 20 ? bestExtraction : 
           'Contenu PDF détecté mais l\'extraction automatique nécessite un traitement manuel. Veuillez vérifier le fichier PDF.';
           
  } catch (error) {
    console.error('Critical error in PDF extraction:', error);
    return `Erreur critique lors de l'extraction PDF: ${error.message}`;
  }
}

function extractTextWithEncoding(pdfText: string, encoding: string): string {
  let extractedText = '';
  
  // Method 1: Enhanced text command extraction
  const textBlockRegex = /BT\s+((?:[^E]|E(?!T))*?)\s+ET/gs;
  const textBlocks = pdfText.match(textBlockRegex) || [];
  
  console.log(`[${encoding}] Found ${textBlocks.length} text blocks`);
  
  for (const block of textBlocks) {
    // Extract from Tj commands with better handling
    const tjMatches = block.match(/\(([^)]*(?:\\.[^)]*)*)\)\s*Tj/g) || [];
    for (const match of tjMatches) {
      const text = match.match(/\(([^)]*(?:\\.[^)]*)*)\)/)?.[1] || '';
      if (text.length > 1) {
        extractedText += processTextString(text) + ' ';
      }
    }
    
    // Extract from TJ array commands
    const tjArrayMatches = block.match(/\[([^\]]+)\]\s*TJ/g) || [];
    for (const match of tjArrayMatches) {
      const arrayContent = match.match(/\[([^\]]+)\]/)?.[1] || '';
      const stringMatches = arrayContent.match(/\(([^)]*(?:\\.[^)]*)*)\)/g) || [];
      for (const stringMatch of stringMatches) {
        const text = stringMatch.match(/\(([^)]*(?:\\.[^)]*)*)\)/)?.[1] || '';
        if (text.length > 1) {
          extractedText += processTextString(text) + ' ';
        }
      }
    }
  }
  
  // Method 2: Stream content extraction
  const streamRegex = /stream\s+([\s\S]*?)\s+endstream/g;
  let streamMatch;
  while ((streamMatch = streamRegex.exec(pdfText)) !== null) {
    const streamContent = streamMatch[1];
    const textInStream = streamContent.match(/\(([^)]{2,})\)/g) || [];
    for (const text of textInStream) {
      const cleanText = text.replace(/[()]/g, '');
      if (isReadableText(cleanText)) {
        extractedText += processTextString(cleanText) + ' ';
      }
    }
  }
  
  // Method 3: Font and text positioning extraction
  const fontTextRegex = /\/F\d+\s+[\d.]+\s+Tf\s+[^(]*\(([^)]+)\)/g;
  let fontMatch;
  while ((fontMatch = fontTextRegex.exec(pdfText)) !== null) {
    const text = fontMatch[1];
    if (isReadableText(text)) {
      extractedText += processTextString(text) + ' ';
    }
  }
  
  return cleanExtractedText(extractedText);
}

function extractTextFromBinary(uint8Array: Uint8Array): string {
  let text = '';
  const chars = [];
  
  // Look for readable ASCII sequences
  for (let i = 0; i < uint8Array.length - 3; i++) {
    const byte = uint8Array[i];
    
    // Check for printable ASCII characters (32-126) and common extended chars
    if ((byte >= 32 && byte <= 126) || (byte >= 128 && byte <= 255)) {
      chars.push(String.fromCharCode(byte));
    } else if (chars.length > 3) {
      // Found a sequence of readable characters
      const sequence = chars.join('');
      if (isReadableText(sequence)) {
        text += sequence + ' ';
      }
      chars.length = 0;
    } else {
      chars.length = 0;
    }
  }
  
  return cleanExtractedText(text);
}

function processTextString(text: string): string {
  return text
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r') 
    .replace(/\\t/g, '\t')
    .replace(/\\\\/g, '\\')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\(\d{3})/g, (_, octal) => String.fromCharCode(parseInt(octal, 8)))
    .trim();
}

function isReadableText(text: string): boolean {
  if (text.length < 2) return false;
  
  // Check if text contains readable characters (letters, numbers, common punctuation)
  const readableChars = text.match(/[a-zA-ZÀ-ÿ0-9\s.,!?;:()\-'"]/g) || [];
  const readableRatio = readableChars.length / text.length;
  
  return readableRatio > 0.6 && /[a-zA-ZÀ-ÿ]/.test(text);
}

function cleanExtractedText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s\u00C0-\u017F.,!?;:()\-'"]/g, '')
    .replace(/(.)\1{4,}/g, '$1') // Remove repeated characters
    .trim();
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