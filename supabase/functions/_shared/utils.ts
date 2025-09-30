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
  
  return sanitized;
};