// Arabic text utilities for normalization and detection

/**
 * Normalizes Arabic text using NFKC normalization plus cleanup
 * - Uses NFKC to convert presentation forms to base characters
 * - Strips control characters (ZWJ, ZWNJ, LRM, RLM, tatweel)
 * - Remaps non-standard Arabic characters (Persian kaf/yeh, alternate heh)
 * - Reorders diacritics (Shadda before vowel marks)
 * - Fixes broken intra-word spaces (deglue pass)
 * - Separates glued words using linguistic patterns
 */
export const normalizeArabicText = (text: string): string => {
  if (!text) return text;
  
  // Step 1: NFKC normalization (converts presentation forms to base forms)
  let normalized = text.normalize('NFKC');
  
  // Step 2: Strip problematic control characters
  normalized = normalized
    .replace(/[\u200B-\u200F]/g, '') // ZWSP, ZWNJ, ZWJ, LRM, RLM, etc.
    .replace(/\u0640/g, '');          // Arabic Tatweel
  
  // Step 3: Remap non-standard Arabic characters to standard forms
  const charMap: Record<string, string> = {
    // Persian/Urdu Kaf → Arabic Kaf
    '\u06A9': '\u0643',  // ک → ك
    '\u06AF': '\u0643',  // گ → ك
    // Persian/Urdu Yeh → Arabic Yeh
    '\u06CC': '\u064A',  // ی → ي
    '\u06D2': '\u064A',  // ے → ي
    // Alternate Heh forms → Arabic Heh
    '\u06C1': '\u0647',  // ہ → ه
    '\u06BE': '\u0647',  // ھ → ه
    '\uFEEB': '\u0647',  // ﻫ → ه (presentation form)
    '\uFEEC': '\u0647',  // ﻬ → ه (presentation form)
  };
  
  for (const [from, to] of Object.entries(charMap)) {
    normalized = normalized.replace(new RegExp(from, 'g'), to);
  }
  
  // Step 4: Reorder diacritics (Shadda \u0651 should come before vowel marks)
  // Match: vowel mark followed by shadda, then swap them
  normalized = normalized.replace(/([\u064B-\u0650\u0652])(\u0651)/g, '$2$1');
  
  // Step 5: DEGLUE PASS - Fix broken intra-word spaces
  // Extended space class to capture all Unicode spaces, control characters, and Bidi markers
  const SPACE_CLASS = '[\\s\\u00A0\\u200B-\\u200F\\u2060\\u2066-\\u2069\\u061C\\u202A-\\u202E\\u202C\\u00AD\\u2000-\\u200A\\u202F\\u205F\\u3000\\uFEFF]+';
  
  // Join broken "ا ل" back to "ال" (captures even Bidi markers like ALM, isolates, etc.)
  normalized = normalized.replace(new RegExp(`ا${SPACE_CLASS}ل`, 'g'), 'ال');
  
  // Remove spaces/controls between letter and diacritics
  normalized = normalized.replace(new RegExp(`([\\u0621-\\u064A])${SPACE_CLASS}([\\u064B-\\u0652\\u0670])`, 'g'), '$1$2');
  
  // Fix common broken patterns like "ا لع ا رض" -> "العارض"
  // Pattern: broken definite article at start (with extended space detection)
  const SPACE_CLASS_OPTIONAL = SPACE_CLASS.replace('+', '*');
  normalized = normalized.replace(
    new RegExp(`ا${SPACE_CLASS_OPTIONAL}ل${SPACE_CLASS_OPTIONAL}([\\u0621-\\u064A])`, 'g'), 
    'ال$1'
  );
  
  // Pattern: single spaces within 3-6 letter Arabic words (likely broken words)
  normalized = normalized.replace(/([\u0621-\u064A])\s+([\u0621-\u064A])\s+([\u0621-\u064A])\s+([\u0621-\u064A])/g, '$1$2$3$4');
  normalized = normalized.replace(/([\u0621-\u064A])\s+([\u0621-\u064A])\s+([\u0621-\u064A])/g, '$1$2$3');
  
  // Step 6: Separate glued Arabic words
  normalized = separateGluedArabicWords(normalized);
  
  // Step 7: Clean orphan diacritics at word boundaries
  normalized = normalized.replace(/\s+[\u064B-\u0652\u0670]+\s+/g, ' ');
  
  // Step 8: Final cleanup - compact multiple spaces
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  return normalized;
};

/**
 * Separates glued Arabic words using linguistic patterns
 * Detects transitions between Arabic words and common patterns
 */
const separateGluedArabicWords = (text: string): string => {
  let result = text;
  
  // Pattern 1: Separate Arabic definite article ال when glued to next word
  result = result.replace(/([\u0600-\u06FF])(ال[\u0600-\u06FF])/g, '$1 $2');
  
  // Pattern 2: Separate common prepositions (including ب)
  result = result.replace(/([\u0600-\u06FF])(ل[\u0600-\u06FF]{2,})/g, '$1 $2');
  result = result.replace(/([\u0600-\u06FF])(في[\u0600-\u06FF]{2,})/g, '$1 $2');
  result = result.replace(/([\u0600-\u06FF])(من[\u0600-\u06FF]{2,})/g, '$1 $2');
  result = result.replace(/([\u0600-\u06FF])(إلى[\u0600-\u06FF]{2,})/g, '$1 $2');
  result = result.replace(/([\u0600-\u06FF])(على[\u0600-\u06FF]{2,})/g, '$1 $2');
  result = result.replace(/([\u0600-\u06FF])(ب[\u0600-\u06FF]{3,})/g, '$1 $2');
  
  // Pattern 3: Separate ALL numbers from Arabic words
  result = result.replace(/([\u0600-\u06FF])(\d+)/g, '$1 $2');
  result = result.replace(/(\d+)([\u0600-\u06FF])/g, '$1 $2');
  
  // Pattern 4: Force space around punctuation
  result = result.replace(/([\u0600-\u06FF])([(){}\[\]«»"""',،:;؛\-–—])/g, '$1 $2');
  result = result.replace(/([(){}\[\]«»"""',،:;؛\-–—])([\u0600-\u06FF])/g, '$1 $2');
  
  // Pattern 5: Separate definite article patterns
  result = result.replace(/([\u0621-\u064A][\u064B-\u0652]?[\u0621-\u064A])(ال[\u0621-\u064A])/g, '$1 $2');
  
  // Pattern 6: Separate لسنة
  result = result.replace(/([\u0600-\u06FF])(لسنة)/g, '$1 $2');
  
  // Pattern 7: Separate long sequences
  result = result.replace(/([\u0621-\u064A]{4,})(ال[\u0621-\u064A]{4,})/g, '$1 $2');
  
  // Pattern 8: Add space between long glued blocks
  result = result.replace(/([\u0621-\u064A]{6,})([\u0621-\u064A]{6,})/g, '$1 $2');
  
  // Final: normalize spaces around punctuation
  result = result.replace(/\s*([،:;؛])\s*/g, '$1 ');
  result = result.replace(/\s*([.!?])\s*/g, '$1 ');
  
  return result;
};

/**
 * Detects if text contains Arabic characters
 * Extended to cover all Arabic blocks including presentation forms
 */
export const isArabicText = (text: string): boolean => {
  if (!text) return false;
  // Arabic Unicode ranges:
  // \u0600-\u06FF (Arabic)
  // \u0750-\u077F (Arabic Supplement)
  // \u08A0-\u08FF (Arabic Extended-A)
  // \uFB50-\uFDFF (Arabic Presentation Forms-A)
  // \uFE70-\uFEFF (Arabic Presentation Forms-B)
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicRegex.test(text);
};

/**
 * Automatically applies Arabic CSS classes and direction based on content
 */
export const getArabicClasses = (text: string): string => {
  if (isArabicText(text)) {
    return 'arabic-text';
  }
  return '';
};

/**
 * Gets the appropriate direction for text content
 */
export const getTextDirection = (text: string): 'ltr' | 'rtl' => {
  return isArabicText(text) ? 'rtl' : 'ltr';
};