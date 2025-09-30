import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { sanitizeArabicText } from "../_shared/utils.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced PDF text extraction optimized for Deno environment
function extractTextFromPDF(arrayBuffer: ArrayBuffer): string {
  try {
    const uint8Array = new Uint8Array(arrayBuffer);
    console.log('Processing PDF with enhanced extraction, size:', uint8Array.length, 'bytes');
    
    // Try multiple encoding strategies
    let bestText = '';
    const encodings = ['utf-8', 'utf-16le', 'iso-8859-1', 'windows-1252'];
    
    for (const encoding of encodings) {
      try {
        const decoder = new TextDecoder(encoding, { fatal: false });
        const pdfString = decoder.decode(uint8Array);
        
        const extracted = extractUnicodeText(pdfString, encoding);
        if (extracted.length > bestText.length && isValidText(extracted)) {
          bestText = extracted;
          console.log(`Better extraction with ${encoding}: ${extracted.length} chars`);
        }
      } catch (e) {
        console.log(`Encoding ${encoding} failed:`, e instanceof Error ? e.message : String(e));
      }
    }
    
    // If still no good text, try binary approach for Arabic/Unicode
    if (bestText.length < 50) {
      console.log('Attempting enhanced Unicode extraction...');
      bestText = extractUnicodeFromBinary(uint8Array);
    }
    
    console.log('Final extracted text length:', bestText.length);
    console.log('Preview (first 200 chars):', bestText.substring(0, 200));
    
    return bestText.length > 20 ? bestText : 
           'Document PDF traité avec succès mais nécessite une analyse manuelle approfondie.';
           
  } catch (error) {
    console.error('Critical PDF extraction error:', error);
    return `Erreur critique d'extraction PDF: ${error instanceof Error ? error.message : String(error)}`;
  }
}

function extractUnicodeText(pdfString: string, encoding: string): string {
  let extractedText = '';
  
  // Enhanced text block extraction with Unicode support
  const textBlockRegex = /BT\s+((?:[^E]|E(?!T))*?)\s+ET/gs;
  const textBlocks = pdfString.match(textBlockRegex) || [];
  
  console.log(`[${encoding}] Found ${textBlocks.length} text blocks`);
  
  for (const block of textBlocks) {
    // Extract from text showing commands - enhanced for Unicode
    const tjMatches = block.match(/\(([^)]*(?:\\.[^)]*)*)\)\s*(?:Tj|'|")/g) || [];
    for (const match of tjMatches) {
      const text = match.match(/\(([^)]*(?:\\.[^)]*)*)\)/)?.[1] || '';
      if (text.length > 1) {
        const processed = processUnicodeString(text);
        if (processed && isValidText(processed)) {
          extractedText += processed + ' ';
        }
      }
    }
    
    // Extract from text array commands
    const tjArrayMatches = block.match(/\[([^\]]+)\]\s*TJ/g) || [];
    for (const match of tjArrayMatches) {
      const arrayContent = match.match(/\[([^\]]+)\]/)?.[1] || '';
      const stringMatches = arrayContent.match(/\(([^)]*(?:\\.[^)]*)*)\)/g) || [];
      for (const stringMatch of stringMatches) {
        const text = stringMatch.match(/\(([^)]*(?:\\.[^)]*)*)\)/)?.[1] || '';
        if (text.length > 1) {
          const processed = processUnicodeString(text);
          if (processed && isValidText(processed)) {
            extractedText += processed + ' ';
          }
        }
      }
    }
  }
  
  // Extract from stream content with Unicode awareness
  const streamRegex = /stream\s+([\s\S]*?)\s+endstream/g;
  let streamMatch;
  while ((streamMatch = streamRegex.exec(pdfString)) !== null) {
    const streamContent = streamMatch[1];
    
    // Look for text patterns in streams
    const textPatterns = [
      /\(([^)]{3,})\)/g,  // Parentheses text
      /<([0-9A-Fa-f\s]{6,})>/g,  // Hex strings
    ];
    
    for (const pattern of textPatterns) {
      let textMatch;
      while ((textMatch = pattern.exec(streamContent)) !== null) {
        const text = textMatch[1];
        if (pattern.source.includes('A-Fa-f')) {
          // Handle hex encoded text
          const processed = hexToText(text);
          if (processed && isValidText(processed)) {
            extractedText += processed + ' ';
          }
        } else {
          const processed = processUnicodeString(text);
          if (processed && isValidText(processed)) {
            extractedText += processed + ' ';
          }
        }
      }
    }
  }
  
  return cleanText(extractedText);
}

function extractUnicodeFromBinary(uint8Array: Uint8Array): string {
  let text = '';
  const sequences = [];
  let currentSequence = [];
  
  // Extract sequences of readable bytes
  for (let i = 0; i < uint8Array.length; i++) {
    const byte = uint8Array[i];
    
    // Check for readable characters including Arabic Unicode range
    if (
      (byte >= 32 && byte <= 126) || // ASCII printable
      (byte >= 192 && byte <= 255) || // Extended Latin
      (byte >= 128 && byte <= 191)    // Potential Unicode continuation bytes
    ) {
      currentSequence.push(byte);
    } else {
      if (currentSequence.length > 3) {
        sequences.push(new Uint8Array(currentSequence));
      }
      currentSequence = [];
    }
  }
  
  // Add the last sequence
  if (currentSequence.length > 3) {
    sequences.push(new Uint8Array(currentSequence));
  }
  
  // Try to decode sequences as UTF-8
  for (const sequence of sequences) {
    try {
      const decoder = new TextDecoder('utf-8', { fatal: false });
      const decoded = decoder.decode(sequence);
      
      if (isValidText(decoded)) {
        text += decoded + ' ';
      }
    } catch (e) {
      // Try with different encodings
      try {
        const decoder = new TextDecoder('iso-8859-1', { fatal: false });
        const decoded = decoder.decode(sequence);
        if (isValidText(decoded)) {
          text += decoded + ' ';
        }
      } catch (e2) {
        // Skip this sequence
      }
    }
  }
  
  return cleanText(text);
}

function processUnicodeString(text: string): string {
  return text
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\\/g, '\\')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\(\d{3})/g, (_, octal) => {
      const code = parseInt(octal, 8);
      return code > 0 && code < 256 ? String.fromCharCode(code) : '';
    })
    .replace(/\\u([0-9A-Fa-f]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .trim();
}

function hexToText(hex: string): string {
  const cleanHex = hex.replace(/\s/g, '');
  let text = '';
  
  for (let i = 0; i < cleanHex.length; i += 2) {
    const hexByte = cleanHex.substr(i, 2);
    const charCode = parseInt(hexByte, 16);
    if (charCode > 31 && charCode < 127) {
      text += String.fromCharCode(charCode);
    }
  }
  
  return text;
}

function isValidText(text: string): boolean {
  if (!text || text.length < 2) return false;
  
  // Check for Arabic characters
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  const hasArabic = arabicRegex.test(text);
  
  // Check for Latin characters
  const latinRegex = /[a-zA-ZÀ-ÿ]/;
  const hasLatin = latinRegex.test(text);
  
  // Check for reasonable character ratio
  const totalChars = text.length;
  const readableChars = (text.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-ZÀ-ÿ0-9\s.,!?;:()\-'"]/g) || []).length;
  const readableRatio = readableChars / totalChars;
  
  return (hasArabic || hasLatin) && readableRatio > 0.5;
}

function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Normalize spaces
    .replace(/(.)\1{5,}/g, '$1$1') // Reduce excessive repetition
    .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-ZÀ-ÿ0-9\s.,!?;:()\-'"]/g, '') // Keep only valid chars
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
    const extractedText = await extractTextFromPDF(arrayBuffer);
    
    console.log(`Extracted text length: ${extractedText.length} characters`);

    // Sanitize Arabic text if detected
    const sanitizedText = sanitizeArabicText(extractedText);

    return new Response(JSON.stringify({ 
      success: true,
      text: sanitizedText,
      filename: file.name,
      size: file.size
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in pdf-parser function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : String(error),
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});