// Arabic text utilities for normalization and detection

/**
 * Normalizes Arabic text using NFKC normalization plus cleanup
 * - Uses NFKC to convert presentation forms to base characters
 * - Strips control characters (ZWJ, ZWNJ, LRM, RLM, tatweel)
 * - Remaps non-standard Arabic characters (Persian kaf/yeh, alternate heh)
 * - Reorders diacritics (Shadda before vowel marks)
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
  
  return normalized;
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