// Arabic text utilities for normalization and detection

/**
 * Lightweight normalization for display purposes (titles, keywords, short fields)
 * - Preserves Alif variants (إ/أ/آ/ٱ) for proper display
 * - Removes invisible characters and converts special spaces
 * - Reorders diacritics
 * - Minimal "ا ل" → "ال" correction
 * - Does NOT apply aggressive word separation heuristics
 */
export const normalizeArabicForDisplay = (text: string): string => {
  if (!text) return text;
  
  // Step 1: NFKC normalization (converts presentation forms to base forms)
  let normalized = text.normalize('NFKC');
  
  // Step 2: Strip problematic control characters
  normalized = normalized
    .replace(/[\u200B-\u200F]/g, '') // ZWSP, ZWNJ, ZWJ, LRM, RLM, etc.
    .replace(/\u0640/g, '')          // Arabic Tatweel
    .replace(/[\u00A0\u202F\u2000-\u200A\u2060\uFEFF]/g, ' '); // Convert special spaces to regular space
  
  // Step 3: Remap non-standard Arabic characters EXCEPT Alif variants (preserve إ/أ/آ/ٱ)
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
    // NOTE: Alif variants are NOT mapped here to preserve them
  };
  
  for (const [from, to] of Object.entries(charMap)) {
    normalized = normalized.replace(new RegExp(from, 'g'), to);
  }
  
  // Step 4: Reorder diacritics (Shadda \u0651 should come before vowel marks)
  normalized = normalized.replace(/([\u064B-\u0650\u0652])(\u0651)/g, '$2$1');
  
  // Step 5: Comprehensive spacing fixes for common Arabic patterns
  
  // Fix "ا ل" → "ال" (definite article)
  normalized = normalized.replace(/ا\s*[\u200B-\u200F\u2060]?\s*ل/g, 'ال');
  
  // Fix "ل ل" → "لل" (double lam)
  normalized = normalized.replace(/ل\s+ل/g, 'لل');
  
  // Fix "ع ل" → "عل"
  normalized = normalized.replace(/ع\s*[\u200B-\u200F\u2060]?\s*ل/g, 'عل');
  
  // Fix "ج ا" → "جا"
  normalized = normalized.replace(/ج\s*[\u200B-\u200F\u2060]?\s*ا/g, 'جا');
  
  // Fix "ب ا" → "با" (ba + alif)
  normalized = normalized.replace(/ب\s*[\u200B-\u200F\u2060]?\s*ا/g, 'با');
  
  // Fix "ب ال" → "بال" (preposition + definite article)
  normalized = normalized.replace(/ب\s+ال/g, 'بال');
  
  // Fix spaces after definite article "ال " before a word
  normalized = normalized.replace(/\bال\s+([ب-ي])/g, 'ال$1');
  
  // Fix broken words - common patterns where space appears in middle of word
  // Fix "ش ف" → "شف" (common in المستشفى)
  normalized = normalized.replace(/ش\s+ف/g, 'شف');
  
  // Fix "المستش فيات" → "المستشفيات"
  normalized = normalized.replace(/المستش\s+فيات/g, 'المستشفيات');
  
  // Fix missing spaces between words that are glued (look for definite article without space)
  // "العلاجالمجاني" → "العلاج المجاني"
  normalized = normalized.replace(/([\u0621-\u064Aء-ي])ال([ب-ي])/g, '$1 ال$2');
  
  // Remove spaces between letter and diacritics
  normalized = normalized.replace(/([\u0621-\u064A])\s+([\u064B-\u0652\u0670])/g, '$1$2');
  
  // Step 6: Clean orphan diacritics at word boundaries
  normalized = normalized.replace(/\s+[\u064B-\u0652\u0670]+\s+/g, ' ');
  
  // Step 7: Final cleanup - compact multiple spaces
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  return normalized;
};

/**
 * Full normalization for long paragraphs/content
 * - Uses NFKC normalization and character remapping
 * - Applies aggressive word separation ONLY for long text
 * - Unifies Alif variants to ا for search/indexing
 */
export const normalizeArabicText = (text: string): string => {
  if (!text) return text;
  
  // Step 1: NFKC normalization (converts presentation forms to base forms)
  let normalized = text.normalize('NFKC');
  
  // Step 2: Strip problematic control characters
  normalized = normalized
    .replace(/[\u200B-\u200F]/g, '') // ZWSP, ZWNJ, ZWJ, LRM, RLM, etc.
    .replace(/\u0640/g, '')          // Arabic Tatweel
    .replace(/[\u00A0\u202F\u2000-\u200A\u2060\uFEFF]/g, ' '); // Convert special spaces to regular space
  
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
    // Alif variants → Standard Alif (for search/indexing)
    '\u0622': '\u0627',  // آ → ا
    '\u0623': '\u0627',  // أ → ا
    '\u0625': '\u0627',  // إ → ا
    '\u0671': '\u0627',  // ٱ → ا
  };
  
  for (const [from, to] of Object.entries(charMap)) {
    normalized = normalized.replace(new RegExp(from, 'g'), to);
  }
  
  // Step 4: Reorder diacritics (Shadda \u0651 should come before vowel marks)
  normalized = normalized.replace(/([\u064B-\u0650\u0652])(\u0651)/g, '$2$1');
  
  // Step 5: DEGLUE PASS - Fix broken intra-word spaces
  normalized = normalized.replace(/[اإأآٱ]\s*[\u200B-\u200F\u2060]?[\s\u00A0\u202F\u2000-\u200A]*ل/g, 'ال');

  // Step 5.1: Fix broken "ع ل" → "عل" (Ayn + space + Lam)
  normalized = normalized.replace(/ع\s*[\u200B-\u200F\u2060]?[\s\u00A0\u202F\u2000-\u200A]*ل/g, 'عل');

  // Step 5.2: Fix broken "ج ا" → "جا" (Jim + space + Alif)
  normalized = normalized.replace(/ج\s*[\u200B-\u200F\u2060]?[\s\u00A0\u202F\u2000-\u200A]*ا/g, 'جا');
  
  // Step 5.3: Fix broken "ب ا" → "با" (Ba + space + Alif)
  normalized = normalized.replace(/ب\s*[\u200B-\u200F\u2060]?[\s\u00A0\u202F\u2000-\u200A]*ا/g, 'با');
  
  // Step 5.4: Fix "ب ال" → "بال" (Ba + space + definite article)
  normalized = normalized.replace(/ب\s*[\u200B-\u200F\u2060]?[\s\u00A0\u202F\u2000-\u200A]*ال/g, 'بال');
  
  // Step 5.5: Fix "ب ال" followed by another Arabic letter
  normalized = normalized.replace(/ب\s*[\u200B-\u200F\u2060]?[\s\u00A0\u202F\u2000-\u200A]*ال\s*([\u0621-\u064A])/g, 'بال$1');
  
  // Remove spaces between letter and diacritics
  normalized = normalized.replace(/([\u0621-\u064A])\s+([\u064B-\u0652\u0670])/g, '$1$2');
  
  // Fix common broken patterns
  normalized = normalized.replace(/[اإأآٱ]\s*[\u200B-\u200F\u2060]?[\s\u00A0\u202F\u2000-\u200A]*ل\s*([\u0621-\u064A])/g, 'ال$1');

  // Step 5.2: Fix "ع ل" followed by another Arabic letter
  normalized = normalized.replace(/ع\s*[\u200B-\u200F\u2060]?[\s\u00A0\u202F\u2000-\u200A]*ل\s*([\u0621-\u064A])/g, 'عل$1');

  // Step 5.3: Fix "ج ا" followed by another Arabic letter
  normalized = normalized.replace(/ج\s*[\u200B-\u200F\u2060]?[\s\u00A0\u202F\u2000-\u200A]*ا\s*([\u0621-\u064A])/g, 'جا$1');
  
  // Pattern: single spaces within 3-6 letter Arabic words (likely broken words)
  normalized = normalized.replace(/([\u0621-\u064A])\s+([\u0621-\u064A])\s+([\u0621-\u064A])\s+([\u0621-\u064A])/g, '$1$2$3$4');
  normalized = normalized.replace(/([\u0621-\u064A])\s+([\u0621-\u064A])\s+([\u0621-\u064A])/g, '$1$2$3');
  
  // Step 6: Separate glued Arabic words ONLY for long text or text with structure
  const hasStructure = normalized.length > 80 || /[\n،:؛.!?]/.test(normalized);
  if (hasStructure) {
    normalized = separateGluedArabicWords(normalized);
  }
  
  // Step 7: Clean orphan diacritics at word boundaries
  normalized = normalized.replace(/\s+[\u064B-\u0652\u0670]+\s+/g, ' ');
  
  // Step 8: Final cleanup - compact multiple spaces
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  return normalized;
};

/**
 * Separates glued Arabic words using linguistic patterns
 * Detects transitions between Arabic words and common patterns
 */
const separateGluedArabicWords = (text: string): string => {
  let result = text;
  
  // Pattern 1: Separate Arabic definite article ال when glued to next word
  result = result.replace(/([\u0600-\u06FF])(ال[\u0600-\u06FF])/g, '$1 $2');
  
  // Pattern 2: Separate common prepositions (including ب)
  result = result.replace(/([\u0600-\u06FF])(ل[\u0600-\u06FF]{2,})/g, '$1 $2');
  result = result.replace(/([\u0600-\u06FF])(في[\u0600-\u06FF]{2,})/g, '$1 $2');
  result = result.replace(/([\u0600-\u06FF])(من[\u0600-\u06FF]{2,})/g, '$1 $2');
  result = result.replace(/([\u0600-\u06FF])(إلى[\u0600-\u06FF]{2,})/g, '$1 $2');
  result = result.replace(/([\u0600-\u06FF])(على[\u0600-\u06FF]{2,})/g, '$1 $2');
  result = result.replace(/([\u0600-\u06FF])(ب[\u0600-\u06FF]{3,})/g, '$1 $2');
  
  // Pattern 3: Separate ALL numbers from Arabic words
  result = result.replace(/([\u0600-\u06FF])(\d+)/g, '$1 $2');
  result = result.replace(/(\d+)([\u0600-\u06FF])/g, '$1 $2');
  
  // Pattern 4: Force space around punctuation
  result = result.replace(/([\u0600-\u06FF])([(){}\[\]«»"""',،:;؛\-–—])/g, '$1 $2');
  result = result.replace(/([(){}\[\]«»"""',،:;؛\-–—])([\u0600-\u06FF])/g, '$1 $2');
  
  // Pattern 5: Separate definite article patterns
  result = result.replace(/([\u0621-\u064A][\u064B-\u0652]?[\u0621-\u064A])(ال[\u0621-\u064A])/g, '$1 $2');
  
  // Pattern 6: Separate لسنة
  result = result.replace(/([\u0600-\u06FF])(لسنة)/g, '$1 $2');
  
  // Pattern 7: Separate long sequences
  result = result.replace(/([\u0621-\u064A]{4,})(ال[\u0621-\u064A]{4,})/g, '$1 $2');
  
  // Pattern 8: Add space between long glued blocks
  result = result.replace(/([\u0621-\u064A]{6,})([\u0621-\u064A]{6,})/g, '$1 $2');
  
  // Final: normalize spaces around punctuation
  result = result.replace(/\s*([،:;؛])\s*/g, '$1 ');
  result = result.replace(/\s*([.!?])\s*/g, '$1 ');
  
  return result;
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
 * Lightweight real-time Arabic input handler
 * Fixes "ا ل" → "ال" during typing for better UX
 */
export const handleArabicInput = (value: string): string => {
  if (!value) return value;
  
  // Real-time correction: join broken "ا ل" back to "ال"
  let corrected = value.replace(/ا\s+ل/g, 'ال');
  
  // Real-time correction: join broken "ل ل" back to "لل"
  corrected = corrected.replace(/ل\s+ل/g, 'لل');
  
  // Real-time correction: join broken "ع ل" back to "عل"
  corrected = corrected.replace(/ع\s+ل/g, 'عل');
  
  // Real-time correction: join broken "ج ا" back to "جا"
  corrected = corrected.replace(/ج\s+ا/g, 'جا');
  
  // Real-time correction: join broken "ب ا" back to "با"
  corrected = corrected.replace(/ب\s+ا/g, 'با');
  
  // Real-time correction: join "ب ال" to "بال"
  corrected = corrected.replace(/ب\s+ال/g, 'بال');
  
  // Real-time correction: join broken "ش ف" back to "شف"
  corrected = corrected.replace(/ش\s+ف/g, 'شف');
  
  // Fix spaces after definite article
  corrected = corrected.replace(/\bال\s+([ب-ي])/g, 'ال$1');
  
  // Fix glued words with definite article
  corrected = corrected.replace(/([\u0621-\u064Aء-ي])ال([ب-ي])/g, '$1 ال$2');
  
  return corrected;
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