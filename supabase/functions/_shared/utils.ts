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
  };
  
  for (const [from, to] of Object.entries(minimalCharMap)) {
    sanitized = sanitized.replace(new RegExp(from, 'g'), to);
  }
  
  return sanitized;
};

/**
 * Arabic spell checker - fixes common spacing errors
 * Targets patterns like "المشكلالقانوني" → "المشكل القانوني"
 */
export const arabicSpellChecker = (text: string | null | undefined): string => {
  if (!text) return '';
  
  let corrected = text;
  let correctionCount = 0;
  
  // Pattern 1: "ال" followed by word, then directly another "ال" word without space
  // Example: "المشكلالقانوني" → "المشكل القانوني"
  const pattern1 = /(ال[\u0600-\u06FF]+)(ال[\u0600-\u06FF]+)/g;
  corrected = corrected.replace(pattern1, (match, word1, word2) => {
    correctionCount++;
    return `${word1} ${word2}`;
  });
  
  // Pattern 2: Word ending with common suffixes directly followed by "ال" word
  // Example: "الحلالمقدّم" → "الحل المقدّم"
  const pattern2 = /([\u0600-\u06FF]+)(ال[\u0600-\u06FF]+)/g;
  corrected = corrected.replace(pattern2, (match, word1, word2, offset) => {
    // Only add space if there's actually a missing space (not already spaced)
    const prevChar = offset > 0 ? text[offset - 1] : '';
    const nextCharAfterMatch = offset + match.length < text.length ? text[offset + match.length] : '';
    
    // Check if this looks like a glued word (no space before or after)
    if (prevChar !== ' ' && prevChar !== '\n' && prevChar !== '' && 
        word2.startsWith('ال') && word1.length > 2) {
      correctionCount++;
      return `${word1} ${word2}`;
    }
    return match;
  });
  
  // Pattern 3: Multiple consecutive "ال" words without spaces
  // Example: "القانونالمدنيالمغربي" → "القانون المدني المغربي"
  const pattern3 = /(\u0627\u0644[\u0600-\u06FF]{2,})(\u0627\u0644[\u0600-\u06FF]{2,})/g;
  let previousCorrected = '';
  while (previousCorrected !== corrected) {
    previousCorrected = corrected;
    corrected = corrected.replace(pattern3, (match, word1, word2) => {
      correctionCount++;
      return `${word1} ${word2}`;
    });
  }
  
  if (correctionCount > 0) {
    console.log(`Arabic spell checker: applied ${correctionCount} corrections`);
  }
  
  return corrected;
};