// Shared utility functions for edge functions
export const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : String(error);
};

export const ensureString = (value: string | undefined | null, fallback = ''): string => {
  return value ?? fallback;
};

/**
 * Sanitizes Arabic text using NFKC normalization plus cleanup
 * - Converts presentation forms to base characters
 * - Strips control characters (ZWJ, ZWNJ, LRM, RLM, tatweel)
 * - Remaps non-standard Arabic characters to standard forms
 * - Reorders diacritics (Shadda before vowel marks)
 * - Separates glued words using linguistic patterns
 */
export const sanitizeArabicText = (text: string | null | undefined): string => {
  if (!text) return '';
  
  // Step 1: NFKC normalization
  let sanitized = text.normalize('NFKC');
  
  // Step 2: Strip control characters
  sanitized = sanitized
    .replace(/[\u200B-\u200F]/g, '')
    .replace(/\u0640/g, '');
  
  // Step 3: Remap non-standard characters
  const charMap: Record<string, string> = {
    '\u06A9': '\u0643', '\u06AF': '\u0643', // Persian Kaf → Arabic Kaf
    '\u06CC': '\u064A', '\u06D2': '\u064A', // Persian Yeh → Arabic Yeh
    '\u06C1': '\u0647', '\u06BE': '\u0647', // Alternate Heh → Arabic Heh
    '\uFEEB': '\u0647', '\uFEEC': '\u0647', // Heh presentation forms
  };
  
  for (const [from, to] of Object.entries(charMap)) {
    sanitized = sanitized.replace(new RegExp(from, 'g'), to);
  }
  
  // Step 4: Reorder diacritics
  sanitized = sanitized.replace(/([\u064B-\u0650\u0652])(\u0651)/g, '$2$1');
  
  // Step 5: Separate glued Arabic words
  sanitized = separateGluedArabicWords(sanitized);
  
  // Step 6: Clean orphan diacritics at word boundaries
  sanitized = sanitized.replace(/\s+[\u064B-\u0652\u0670]+\s+/g, ' ');
  
  return sanitized;
};

/**
 * Separates glued Arabic words using linguistic patterns
 * Detects transitions between Arabic words and common patterns
 */
const separateGluedArabicWords = (text: string): string => {
  let result = text;
  
  // Pattern 1: Separate Arabic definite article ال when glued to next word
  // Match: Arabic letters followed by ال followed by Arabic letters
  result = result.replace(/([\u0600-\u06FF])(ال[\u0600-\u06FF])/g, '$1 $2');
  
  // Pattern 2: Separate common prepositions (ل، في، من، إلى، على) glued to words
  result = result.replace(/([\u0600-\u06FF])(ل[\u0600-\u06FF]{2,})/g, '$1 $2');
  result = result.replace(/([\u0600-\u06FF])(في[\u0600-\u06FF]{2,})/g, '$1 $2');
  result = result.replace(/([\u0600-\u06FF])(من[\u0600-\u06FF]{2,})/g, '$1 $2');
  result = result.replace(/([\u0600-\u06FF])(إلى[\u0600-\u06FF]{2,})/g, '$1 $2');
  result = result.replace(/([\u0600-\u06FF])(على[\u0600-\u06FF]{2,})/g, '$1 $2');
  
  // Pattern 3: Separate year numbers (19XX, 20XX) glued to Arabic words
  result = result.replace(/([\u0600-\u06FF])((?:19|20)\d{2})/g, '$1 $2');
  result = result.replace(/((?:19|20)\d{2})([\u0600-\u06FF])/g, '$1 $2');
  
  // Pattern 4: Separate when Arabic word ends and another starts with common patterns
  // Detect: consonant + vowel + consonant + ال (definite article start)
  result = result.replace(/([\u0621-\u064A][\u064B-\u0652]?[\u0621-\u064A])(ال[\u0621-\u064A])/g, '$1 $2');
  
  // Pattern 5: Separate لسنة (li-sanat = "for the year") when glued
  result = result.replace(/([\u0600-\u06FF])(لسنة)/g, '$1 $2');
  
  // Pattern 6: Separate when we have multiple capital-like patterns (e.g., القضاء الإداري)
  // Detect sequences of 4+ Arabic letters followed by ال followed by 4+ letters
  result = result.replace(/([\u0621-\u064A]{4,})(ال[\u0621-\u064A]{4,})/g, '$1 $2');
  
  return result;
};