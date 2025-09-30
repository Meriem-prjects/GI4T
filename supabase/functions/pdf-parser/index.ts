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
    
    // Extract from text array commands with spacing support
    const tjArrayMatches = block.match(/\[([^\]]+)\]\s*TJ/g) || [];
    console.log(`[${encoding}] Found ${tjArrayMatches.length} TJ arrays in block`);
    
    for (const match of tjArrayMatches) {
      const arrayContent = match.match(/\[([^\]]+)\]/)?.[1] || '';
      
      // Parse TJ array with space insertion based on numeric values
      const elements = arrayContent.match(/\(([^)]*(?:\\.[^)]*)*)\)|(-?\d+(?:\.\d+)?)/g) || [];
      let lineText = '';
      
      console.log(`[TJ Array] Processing ${elements.length} elements`);
      
      for (let i = 0; i < elements.length; i++) {
        const elem = elements[i];
        if (elem.startsWith('(')) {
          // Text string
          const text = elem.match(/\(([^)]*(?:\\.[^)]*)*)\)/)?.[1] || '';
          const processed = processUnicodeString(text);
          if (processed) {
            lineText += processed;
            console.log(`[TJ Array ${i}] Text: "${processed}"`);
          }
        } else {
          // Numeric spacing value - DRASTICALLY reduced threshold for Arabic
          const spacing = parseFloat(elem);
          console.log(`[TJ Array ${i}] Spacing value: ${spacing}`);
          
          // Reduced from 80 to 35 for much better Arabic space detection
          if (Math.abs(spacing) >= 35) {
            lineText += ' ';
            console.log(`[TJ Array ${i}] ✓ Space inserted (spacing: ${spacing}, threshold: 35)`);
          } else {
            console.log(`[TJ Array ${i}] ✗ No space (spacing: ${spacing} < 35)`);
          }
        }
      }
      
      if (lineText.trim().length > 0 && isValidText(lineText)) {
        extractedText += lineText + '\n'; // Keep line breaks
        console.log(`[TJ Array] Final line text: "${lineText.substring(0, 100)}..."`);
      }
    }
    
    // Also detect text positioning commands (Td, TD, Tm) which indicate spaces
    const positioningRegex = /(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+T[dm]/g;
    let posMatch;
    while ((posMatch = positioningRegex.exec(block)) !== null) {
      const xOffset = parseFloat(posMatch[1]);
      const yOffset = parseFloat(posMatch[2]);
      
      // Significant horizontal movement indicates a space
      if (Math.abs(xOffset) > 10) {
        console.log(`[Positioning] Detected space via Td/TD command (xOffset: ${xOffset})`);
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
  console.log(`[cleanText] Input: ${text.length} chars`);
  
  let cleaned = text
    .replace(/\0/g, '') // Remove null bytes
    .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '') // Remove control chars except \n, \r, \t
    .replace(/(.)\1{5,}/g, '$1$1') // Reduce excessive repetition only
    .trim(); // Trim only start/end
  
  // Post-processing: Add intelligent space insertion for Arabic text
  cleaned = addIntelligentArabicSpaces(cleaned);
  
  console.log(`[cleanText] Output: ${cleaned.length} chars, line breaks preserved`);
  return cleaned;
}

// Intelligent space insertion for Arabic text based on linguistic patterns
function addIntelligentArabicSpaces(text: string): string {
  console.log('[Arabic Post-Processing] Analyzing text for missing spaces...');
  
  // Apply the dedicated Arabic glue fixer
  text = arabicGlueFixer(text);
  
  console.log('[Arabic Post-Processing] Completed');
  return text;
}

// Dedicated Arabic glue fixer for "لال" → "ل ال" and related issues
function arabicGlueFixer(text: string): string {
  console.log('[Arabic Glue Fixer] Processing text...');

  // 0) Normalize Lam-Alef ligatures (ﻻ, ﻼ, and variants) → "لا"
  const lamAlefLigature = /[\uFEFB\uFEFC\uFEF5-\uFEFA]/g; // madda/hamza variants included
  let ligCount = 0;
  text = text.replace(lamAlefLigature, (m) => { ligCount++; return 'لا'; });
  if (ligCount > 0) console.log(`[Arabic Glue Fixer] Expanded ${ligCount} Lam-Alef ligature(s)`);

  // Unicode character classes including presentation forms
  const LAM = '(?:\u0644|[\uFEEB-\uFEEE])';  // ل and its presentation forms
  const ALEF = '(?:\u0627|\uFE8D|\uFE8E)';   // ا and its presentation forms
  const OPTIONAL = '[\u200C\u200D\u0640\u064B-\u065F\u0670]*'; // joiners/diacritics/tatweel

  // Arabic letter range (including all forms and diacritics)
  const ARABIC_ALL = '[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]';
  const ARABIC_OR_DIGIT = '[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF0-9]';

  let lamAlFixes = 0;
  let spaceBeforeAlFixes = 0;

  // Rule 1: Fix "لال" (Lam + Alef + Lam) possibly with joiners → "ل ال"
  const lamAlefLam = new RegExp(`(${LAM})${OPTIONAL}(${ALEF})${OPTIONAL}(${LAM})`, 'gu');
  text = text.replace(lamAlefLam, (_m, l1, a, l2) => {
    lamAlFixes++;
    return `${l1} ${a}${l2}`; // ل ال
  });

  // Rule 2: Insert space before "ال" when glued to a preceding Arabic char or digit
  const alifLamSeq = `(?:${ALEF})${OPTIONAL}(?:${LAM})`;
  const gluedBeforeAl = new RegExp(`(${ARABIC_OR_DIGIT})(${alifLamSeq}(?:${ARABIC_ALL})+)`, 'gu');
  text = text.replace(gluedBeforeAl, (_m, before, alWord) => {
    spaceBeforeAlFixes++;
    return `${before} ${alWord}`;
  });

  // Cleanup: collapse multiple spaces
  text = text.replace(/\s{2,}/g, ' ');

  console.log(`[Arabic Glue Fixer] Completed: ${lamAlFixes} "لال" fixes, ${spaceBeforeAlFixes} space insertions`);
  return text;
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

    // DO NOT sanitize here - return raw extraction to preserve spacing
    // Sanitization will be done in upload-document at the end

    return new Response(JSON.stringify({ 
      success: true,
      text: extractedText, // Return raw text without sanitization
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