// Arabic text utilities for normalization and detection

/**
 * Conservative Arabic text sanitization (matches backend approach)
 * - Uses NFD normalization (preserves visual display)
 * - Keeps ZWJ, ZWNJ, tatweel (essential for Arabic ligatures)
 * - Only removes BOM and truly unnecessary control characters
 * - Minimal character remapping (only Persian variants)
 */
export const sanitizeArabicText = (text: string): string => {
  if (!text) return text;
  
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
  };
  
  for (const [from, to] of Object.entries(minimalCharMap)) {
    sanitized = sanitized.replace(new RegExp(from, 'g'), to);
  }
  
  return sanitized;
};

/**
 * Fixes common Arabic spacing issues
 * Specifically targets "لال" → "ل ال" and glued "ال" patterns
 */
export const arabicGlueFixer = (text: string): string => {
  if (!text) return text;
  
  // Normalize any Lam-Alef ligatures to separated form first
  const ligatureMap: Record<string, string> = {
    '\uFEFB': 'لا', // ﻻ → لا
    '\uFEFC': 'لا', // ﻼ → لا
    '\uFEF7': 'لأ', // ﻷ → لأ
    '\uFEF8': 'لأ', // ﻸ → لأ
    '\uFEF9': 'لإ', // ﻹ → لإ
    '\uFEFA': 'لإ', // ﻺ → لإ
    '\uFEF5': 'لآ', // ﻵ → لآ
    '\uFEF6': 'لآ', // ﻶ → لآ
  };
  
  let fixed = text;
  for (const [ligature, expanded] of Object.entries(ligatureMap)) {
    fixed = fixed.replace(new RegExp(ligature, 'g'), expanded);
  }
  
  // Define character classes for matching
  const LAM = '[\\u0644\\uFEEB-\\uFEEE]'; // Lam and its presentation forms
  const ALEF = '[\\u0627\\uFE8D\\uFE8E]'; // Alef and its presentation forms
  const OPTIONAL = '[\\u200C\\u200D\\u0640\\u064B-\\u065F\\u0670]*'; // ZWJ, ZWNJ, tatweel, diacritics
  const ARABIC_ALL = '[\\u0600-\\u06FF\\u0750-\\u077F\\u08A0-\\u08FF\\uFB50-\\uFDFF\\uFE70-\\uFEFF]';
  const ARABIC_OR_DIGIT = '[\\u0600-\\u06FF\\u0750-\\u077F\\u08A0-\\u08FF\\uFB50-\\uFDFF\\uFE70-\\uFEFF\\u0660-\\u0669]';
  
  // Alif-Lam sequence (ال with optional diacritics/joiners between)
  const alifLamSeq = `${ALEF}${OPTIONAL}${LAM}`;
  
  // Rule 1: Fix "لال" → "ل ال" (Lam + Alef + Lam → Lam + space + Alef + Lam)
  const rule1Regex = new RegExp(`(${LAM})${OPTIONAL}(${ALEF})${OPTIONAL}(${LAM})`, 'gu');
  const beforeRule1 = fixed;
  fixed = fixed.replace(rule1Regex, '$1 $2$3');
  if (fixed !== beforeRule1) {
    console.log(`[arabicGlueFixer] Rule 1 (لال → ل ال): ${(beforeRule1.match(rule1Regex) || []).length} fixes`);
  }
  
  // Rule 2: Add space before "ال" if glued to preceding Arabic character or digit
  // Match: (Arabic char or digit)(ال + word)
  const rule2Regex = new RegExp(`(${ARABIC_OR_DIGIT})(${alifLamSeq}(?:${ARABIC_ALL})+)`, 'gu');
  const beforeRule2 = fixed;
  fixed = fixed.replace(rule2Regex, '$1 $2');
  if (fixed !== beforeRule2) {
    console.log(`[arabicGlueFixer] Rule 2 (wordال → word ال): ${(beforeRule2.match(rule2Regex) || []).length} fixes`);
  }
  
  // Clean up any multiple spaces created
  fixed = fixed.replace(/\s{2,}/g, ' ');
  
  return fixed;
};

/**
 * Full Arabic text normalization (sanitization + spacing fixes)
 * This is the main function to use for client-side Arabic text processing
 */
export const normalizeArabicText = (text: string): string => {
  if (!text) return text;
  return arabicGlueFixer(sanitizeArabicText(text));
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
