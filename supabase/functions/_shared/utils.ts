// Shared utility functions for edge functions
export const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : String(error);
};

export const ensureString = (value: string | undefined | null, fallback = ''): string => {
  return value ?? fallback;
};

/**
 * Conservative Arabic text sanitization
 * - Uses NFD normalization (preserves visual display)
 * - Converts presentation forms to canonical base forms for proper ligatures
 * - Keeps ZWJ, ZWNJ, tatweel (essential for Arabic ligatures)
 * - Only removes BOM and truly unnecessary control characters
 */
export const sanitizeArabicText = (text: string | null | undefined): string => {
  if (!text) return '';
  
  // NFD normalization (gentle, preserves display)
  let sanitized = text.normalize('NFD');
  
  // Remove only BOM and some unnecessary control characters
  sanitized = sanitized
    .replace(/\uFEFF/g, '') // BOM
    .replace(/[\u200E\u200F]/g, ''); // LRM/RLM only (keep ZWJ/ZWNJ)
  
  // Convert ALL Arabic presentation forms to canonical base forms
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
    sanitized = sanitized.replace(new RegExp(from, 'g'), to);
  }
  
  return sanitized;
};