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
  
  // Step 3: Convert ALL Arabic presentation forms to canonical base forms
  // This ensures proper contextual ligatures by the browser's text rendering engine
  const presentationToBase: Record<string, string> = {
    // Heh presentation forms → ه (U+0647)
    '\uFEEB': '\u0647', '\uFEEC': '\u0647', '\uFEED': '\u0647', '\uFEEE': '\u0647',
    '\uFBA4': '\u0647', '\uFBA5': '\u0647',
    '\uFB6A': '\u0647', '\uFB6B': '\u0647', '\uFB6C': '\u0647', '\uFB6D': '\u0647',
    // Feh presentation forms → ف (U+0641)
    '\uFED1': '\u0641', '\uFED2': '\u0641', '\uFED3': '\u0641', '\uFED4': '\u0641',
    // Qaf presentation forms → ق (U+0642)
    '\uFED5': '\u0642', '\uFED6': '\u0642', '\uFED7': '\u0642', '\uFED8': '\u0642',
    // Persian/Urdu characters to Arabic equivalents
    '\u06A9': '\u0643', '\u06AF': '\u0643',  // ک گ → ك
    '\u06CC': '\u064A', '\u06D2': '\u064A',  // ی ے → ي
    '\u06C1': '\u0647', '\u06BE': '\u0647',  // ہ ھ → ه
  };
  
  for (const [from, to] of Object.entries(presentationToBase)) {
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