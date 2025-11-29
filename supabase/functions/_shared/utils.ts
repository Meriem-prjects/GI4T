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
 * - Fixes broken intra-word spaces (deglue pass)
 * - Separates glued words using linguistic patterns
 */
export const sanitizeArabicText = (text: string | null | undefined): string => {
  if (!text) return '';
  
  // Step 0: Fix common OCR errors first
  let sanitized = fixArabicOCRErrors(text);
  
  // Step 1: NFKC normalization
  sanitized = sanitized.normalize('NFKC');
  
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
  
  // Step 5: DEGLUE PASS - Fix broken intra-word spaces
  // Join broken "ا ل" back to "ال"
  sanitized = sanitized.replace(/ا\s+ل/g, 'ال');
  
  // Join broken "ع ل" back to "عل" (Ayn + space + Lam)
  sanitized = sanitized.replace(/ع\s*[\u200B-\u200F\u2060]?\s*ل/g, 'عل');
  
  // Join broken "ج ا" back to "جا" (Jim + space + Alif)
  sanitized = sanitized.replace(/ج\s*[\u200B-\u200F\u2060]?\s*ا/g, 'جا');
  
  // Join broken "ب ا" back to "با" (Ba + space + Alif)
  sanitized = sanitized.replace(/ب\s*[\u200B-\u200F\u2060]?\s*ا/g, 'با');
  
  // Join broken "ب ال" to "بال" (Ba + space + definite article)
  sanitized = sanitized.replace(/ب\s+ال/g, 'بال');
  
  // Remove spaces between letter and diacritics
  sanitized = sanitized.replace(/([\u0621-\u064A])\s+([\u064B-\u0652\u0670])/g, '$1$2');
  
  // Fix common broken patterns like "ا لع ا رض" -> "العارض"
  // Pattern: broken definite article at start
  sanitized = sanitized.replace(/ا\s*ل\s*([\u0621-\u064A])/g, 'ال$1');
  
  // Pattern: single spaces within 3-6 letter Arabic words (likely broken words)
  // Match: Arabic letter, space, 1-5 more (letter + optional space) combos
  sanitized = sanitized.replace(/([\u0621-\u064A])\s+([\u0621-\u064A])\s+([\u0621-\u064A])\s+([\u0621-\u064A])/g, '$1$2$3$4');
  sanitized = sanitized.replace(/([\u0621-\u064A])\s+([\u0621-\u064A])\s+([\u0621-\u064A])/g, '$1$2$3');
  
  // Step 6: Separate glued Arabic words
  sanitized = separateGluedArabicWords(sanitized);
  
  // Step 7: Clean orphan diacritics at word boundaries
  sanitized = sanitized.replace(/\s+[\u064B-\u0652\u0670]+\s+/g, ' ');
  
  // Step 8: Final cleanup - compact multiple spaces
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  return sanitized;
};

/**
 * Fixes common OCR misrecognitions for Arabic text
 */
export const fixArabicOCRErrors = (text: string): string => {
  let result = text;
  
  // Fix Lam-Alif ligatures that are sometimes misrecognized
  const ligatureFixes: [RegExp, string][] = [
    [/ﻻ/g, 'لا'],           // Ligature Lam-Alif
    [/ﻷ/g, 'لأ'],           // Ligature Lam-Alif Hamza
    [/ﻹ/g, 'لإ'],           // Ligature Lam-Alif Hamza below
    [/ﻵ/g, 'لآ'],           // Ligature Lam-Alif Madda
  ];
  
  for (const [pattern, replacement] of ligatureFixes) {
    result = result.replace(pattern, replacement);
  }
  
  // Remove zero-width characters and control characters
  result = result.replace(/[\u200B-\u200F\u202A-\u202E\uFEFF]/g, '');
  
  // Normalize different space types to standard space
  result = result.replace(/[\u00A0\u2000-\u200A\u202F\u205F\u3000]/g, ' ');
  
  return result;
};

/**
 * Separates glued Arabic words using linguistic patterns
 * Enhanced with new rules for better word separation
 */
const separateGluedArabicWords = (text: string): string => {
  let result = text;
  
  // RÈGLE 1: Séparer après Taa Marbouta (ة) suivie d'une lettre arabe (sauf ال)
  // Exemple: "حرّيةتكوين" → "حرّية تكوين"
  result = result.replace(/(ة)([\u0621-\u064A](?!ل))/g, '$1 $2');
  
  // RÈGLE 2: Séparer le Waw conjonctif (و) entre deux mots longs
  // Exemple: "الأحزابو" → "الأحزاب و"
  result = result.replace(/([\u0621-\u064A]{2,})(و)([\u0621-\u064A]{2,})/g, '$1 $2 $3');
  
  // RÈGLE 3: Séparer avant ال (article défini) quand précédé d'un mot sans espace
  // Exemple: "القضاءالدّستوري" → "القضاء الدّستوري"
  result = result.replace(/([\u0621-\u064A]{3,})(ال[\u0621-\u064A]{2,})/g, '$1 $2');
  
  // RÈGLE 4: Séparer après ي final suivi d'un mot (sauf si shadda suit)
  // Exemple: "الدّستوريو" → "الدّستوري و"
  result = result.replace(/(ي)([\u0621-\u064A](?!ّ))/g, '$1 $2');
  
  // RÈGLE 5: Séparer les mots composés avec أ (Alif Hamza) initial
  // Exemple: "الجمعيّاتأو" → "الجمعيّات أو"
  result = result.replace(/([\u0621-\u064A]{3,})(أ[\u0621-\u064A]{1,})/g, '$1 $2');
  
  // Pattern 1: Separate Arabic definite article ال when glued to next word
  // Match: Arabic letters followed by ال followed by Arabic letters
  result = result.replace(/([\u0600-\u06FF])(ال[\u0600-\u06FF])/g, '$1 $2');
  
  // Pattern 2: Separate common prepositions (ل، في، من، إلى، على، ب) glued to words
  result = result.replace(/([\u0600-\u06FF])(ل[\u0600-\u06FF]{2,})/g, '$1 $2');
  result = result.replace(/([\u0600-\u06FF])(في[\u0600-\u06FF]{2,})/g, '$1 $2');
  result = result.replace(/([\u0600-\u06FF])(من[\u0600-\u06FF]{2,})/g, '$1 $2');
  result = result.replace(/([\u0600-\u06FF])(إلى[\u0600-\u06FF]{2,})/g, '$1 $2');
  result = result.replace(/([\u0600-\u06FF])(على[\u0600-\u06FF]{2,})/g, '$1 $2');
  result = result.replace(/([\u0600-\u06FF])(ب[\u0600-\u06FF]{3,})/g, '$1 $2');
  
  // Pattern 3: Separate ALL numbers (not just years) from Arabic words
  result = result.replace(/([\u0600-\u06FF])(\d+)/g, '$1 $2');
  result = result.replace(/(\d+)([\u0600-\u06FF])/g, '$1 $2');
  
  // Pattern 4: Force space around punctuation
  result = result.replace(/([\u0600-\u06FF])([(){}\[\]«»"""',،:;؛\-–—])/g, '$1 $2');
  result = result.replace(/([(){}\[\]«»"""',،:;؛\-–—])([\u0600-\u06FF])/g, '$1 $2');
  
  // Pattern 5: Separate when Arabic word ends and another starts with common patterns
  // Detect: consonant + vowel + consonant + ال (definite article start)
  result = result.replace(/([\u0621-\u064A][\u064B-\u0652]?[\u0621-\u064A])(ال[\u0621-\u064A])/g, '$1 $2');
  
  // Pattern 6: Separate لسنة (li-sanat = "for the year") when glued
  result = result.replace(/([\u0600-\u06FF])(لسنة)/g, '$1 $2');
  
  // Pattern 7: Separate when we have multiple capital-like patterns (e.g., القضاء الإداري)
  // Detect sequences of 4+ Arabic letters followed by ال followed by 4+ letters
  result = result.replace(/([\u0621-\u064A]{4,})(ال[\u0621-\u064A]{4,})/g, '$1 $2');
  
  // RÈGLE 6: Mots très longs (>12 caractères sans espaces) - probablement collés
  result = result.replace(/(\b[\u0621-\u064A]{12,}\b)/g, (match) => {
    // Chercher des points de séparation naturels
    let separated = match;
    separated = separated.replace(/(ة)([\u0621-\u064A])/g, '$1 $2');
    separated = separated.replace(/([\u0621-\u064A]{3,})(و)([\u0621-\u064A]{3,})/g, '$1 $2 $3');
    return separated;
  });
  
  // Final: normalize spaces around punctuation
  result = result.replace(/\s*([،:;؛])\s*/g, '$1 ');
  result = result.replace(/\s*([.!?])\s*/g, '$1 ');
  
  return result;
};