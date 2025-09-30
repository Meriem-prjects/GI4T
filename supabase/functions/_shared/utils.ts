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
 * - Keeps ZWJ, ZWNJ, tatweel (essential for Arabic ligatures)
 * - Only removes BOM and truly unnecessary control characters
 * - Minimal character remapping (only Persian variants)
 */
export const sanitizeArabicText = (text: string | null | undefined): string => {
  if (!text) return '';
  
  // NFD normalization (gentle, preserves display)
  let sanitized = text.normalize('NFD');
  
  // Remove only BOM and some unnecessary control characters
  sanitized = sanitized
    .replace(/\uFEFF/g, '') // BOM
    .replace(/[\u200E\u200F]/g, ''); // LRM/RLM only (keep ZWJ/ZWNJ)
  
  // Minimal selective conversion of problematic presentation forms
  const minimalCharMap: Record<string, string> = {
    '\u06A9': '\u0643', // Persian Kaf → Arabic Kaf
    '\u06CC': '\u064A', // Persian Yeh → Arabic Yeh
    '\uFB6B': '\u0647', // ﮫ → ه (HEH presentation form)
    '\uFEEB': '\u0647', // ﻫ → ه (HEH initial form)
    '\uFEEC': '\u0647', // ﻬ → ه (HEH medial form)
  };
  
  for (const [from, to] of Object.entries(minimalCharMap)) {
    sanitized = sanitized.replace(new RegExp(from, 'g'), to);
  }
  
  return sanitized;
};