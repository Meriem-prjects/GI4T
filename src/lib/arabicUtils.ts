// Arabic text utilities for normalization and detection

/**
 * Conservative Arabic text sanitization (matches backend behavior)
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
  };
  
  for (const [from, to] of Object.entries(minimalCharMap)) {
    sanitized = sanitized.replace(new RegExp(from, 'g'), to);
  }
  
  return sanitized;
};

/**
 * Arabic spell checker for spacing issues
 * Corrects common Arabic spacing errors like "المشكلالقانوني" → "المشكل القانوني"
 * Should only be used on explicit user action (e.g., "Nettoyer l'arabe" button)
 */
export const arabicSpellChecker = (text: string): string => {
  if (!text || !isArabicText(text)) return text;
  
  let corrected = text;
  let corrections = 0;
  
  // Pattern 1: ال + word + ال + word (e.g., "المشكلالقانوني" → "المشكل القانوني")
  const pattern1Regex = /(ال[\u0621-\u064A]+)(ال[\u0621-\u064A]+)/g;
  corrected = corrected.replace(pattern1Regex, (match, p1, p2) => {
    corrections++;
    return `${p1} ${p2}`;
  });
  
  // Pattern 2: word + ال + word (e.g., "الحلالمقدّم" → "الحل المقدّم")
  const pattern2Regex = /([\u0621-\u064A]+)(ال[\u0621-\u064A]+)/g;
  corrected = corrected.replace(pattern2Regex, (match, p1, p2, offset) => {
    // Only apply if not at start of text and previous char is not a space
    if (offset > 0 && text[offset - 1] !== ' ') {
      corrections++;
      return `${p1} ${p2}`;
    }
    return match;
  });
  
  // Pattern 3: Multiple consecutive words without spaces (e.g., "القانونالمدنيالمغربي")
  const pattern3Regex = /(ال[\u0621-\u064A]+)(ال[\u0621-\u064A]+)(ال[\u0621-\u064A]+)/g;
  corrected = corrected.replace(pattern3Regex, (match, p1, p2, p3) => {
    corrections++;
    return `${p1} ${p2} ${p3}`;
  });
  
  if (corrections > 0) {
    console.log(`[arabicSpellChecker] Applied ${corrections} spacing corrections`);
  }
  
  return corrected;
};

/**
 * Aggressive normalization (deprecated, use sanitizeArabicText instead)
 * Kept for backward compatibility only
 */
export const normalizeArabicText = (text: string): string => {
  console.warn('[normalizeArabicText] DEPRECATED: Use sanitizeArabicText() instead');
  return sanitizeArabicText(text);
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