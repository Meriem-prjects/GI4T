// Arabic text utilities for normalization and detection

// Arabic Presentation Forms-B (U+FE70-U+FEFF) to base character mapping
const presentationFormsMap: Record<number, string> = {
  // Alef variations
  0xFE8D: 'ا', 0xFE8E: 'ا',
  // Ba variations
  0xFE8F: 'ب', 0xFE90: 'ب', 0xFE91: 'ب', 0xFE92: 'ب',
  // Ta variations
  0xFE95: 'ت', 0xFE96: 'ت', 0xFE97: 'ت', 0xFE98: 'ت',
  // Tha variations
  0xFE99: 'ث', 0xFE9A: 'ث', 0xFE9B: 'ث', 0xFE9C: 'ث',
  // Jeem variations
  0xFE9D: 'ج', 0xFE9E: 'ج', 0xFE9F: 'ج', 0xFEA0: 'ج',
  // Hha variations
  0xFEA1: 'ح', 0xFEA2: 'ح', 0xFEA3: 'ح', 0xFEA4: 'ح',
  // Kha variations
  0xFEA5: 'خ', 0xFEA6: 'خ', 0xFEA7: 'خ', 0xFEA8: 'خ',
  // Dal
  0xFEA9: 'د', 0xFEAA: 'د',
  // Thal
  0xFEAB: 'ذ', 0xFEAC: 'ذ',
  // Ra
  0xFEAD: 'ر', 0xFEAE: 'ر',
  // Zay
  0xFEAF: 'ز', 0xFEB0: 'ز',
  // Seen variations
  0xFEB1: 'س', 0xFEB2: 'س', 0xFEB3: 'س', 0xFEB4: 'س',
  // Sheen variations
  0xFEB5: 'ش', 0xFEB6: 'ش', 0xFEB7: 'ش', 0xFEB8: 'ش',
  // Sad variations
  0xFEB9: 'ص', 0xFEBA: 'ص', 0xFEBB: 'ص', 0xFEBC: 'ص',
  // Dad variations
  0xFEBD: 'ض', 0xFEBE: 'ض', 0xFEBF: 'ض', 0xFEC0: 'ض',
  // Tah variations
  0xFEC1: 'ط', 0xFEC2: 'ط', 0xFEC3: 'ط', 0xFEC4: 'ط',
  // Zah variations
  0xFEC5: 'ظ', 0xFEC6: 'ظ', 0xFEC7: 'ظ', 0xFEC8: 'ظ',
  // Ain variations
  0xFEC9: 'ع', 0xFECA: 'ع', 0xFECB: 'ع', 0xFECC: 'ع',
  // Ghain variations
  0xFECD: 'غ', 0xFECE: 'غ', 0xFECF: 'غ', 0xFED0: 'غ',
  // Fa variations
  0xFED1: 'ف', 0xFED2: 'ف', 0xFED3: 'ف', 0xFED4: 'ف',
  // Qaf variations
  0xFED5: 'ق', 0xFED6: 'ق', 0xFED7: 'ق', 0xFED8: 'ق',
  // Kaf variations
  0xFED9: 'ك', 0xFEDA: 'ك', 0xFEDB: 'ك', 0xFEDC: 'ك',
  // Lam variations
  0xFEDD: 'ل', 0xFEDE: 'ل', 0xFEDF: 'ل', 0xFEE0: 'ل',
  // Meem variations
  0xFEE1: 'م', 0xFEE2: 'م', 0xFEE3: 'م', 0xFEE4: 'م',
  // Noon variations
  0xFEE5: 'ن', 0xFEE6: 'ن', 0xFEE7: 'ن', 0xFEE8: 'ن',
  // Heh variations (ALL FORMS)
  0xFEE9: 'ه', 0xFEEA: 'ه', 0xFEEB: 'ه', 0xFEEC: 'ه',
  0xFBA4: 'ه', 0xFBA5: 'ه', 0xFBA6: 'ه', 0xFBA7: 'ه', 
  0xFBA8: 'ه', 0xFBA9: 'ه',
  // Waw variations
  0xFEED: 'و', 0xFEEE: 'و',
  // Ya variations
  0xFEEF: 'ي', 0xFEF0: 'ي', 0xFEF1: 'ي', 0xFEF2: 'ي', 0xFEF3: 'ي', 0xFEF4: 'ي',
  // Hamza variations
  0xFE80: 'ء',
  // Alef with Madda
  0xFE81: 'آ', 0xFE82: 'آ',
  // Alef with Hamza above
  0xFE83: 'أ', 0xFE84: 'أ',
  // Waw with Hamza
  0xFE85: 'ؤ', 0xFE86: 'ؤ',
  // Alef with Hamza below
  0xFE87: 'إ', 0xFE88: 'إ',
  // Ya with Hamza
  0xFE89: 'ئ', 0xFE8A: 'ئ', 0xFE8B: 'ئ', 0xFE8C: 'ئ',
  // Ta Marbuta
  0xFE93: 'ة', 0xFE94: 'ة',
  // Lam-Alef ligatures
  0xFEF5: 'لا', 0xFEF6: 'لا', 0xFEF7: 'لأ', 0xFEF8: 'لأ',
  0xFEF9: 'لإ', 0xFEFA: 'لإ', 0xFEFB: 'لآ', 0xFEFC: 'لآ',
  // Heh Goal/Doachashmee forms (U+FBAA-U+FBAD) - terminal Heh variations
  0xFBAA: 'ه', 0xFBAB: 'ه', 0xFBAC: 'ه', 0xFBAD: 'ه',
  // Yeh Barree forms (U+FBAE-U+FBAF)
  0xFBAE: 'ي', 0xFBAF: 'ي',
  // Alef Maksura variations
  0xFBE8: 'ى', 0xFBE9: 'ى'
};

/**
 * Converts Arabic Presentation Forms-B to base characters
 */
function convertPresentationForms(text: string): string {
  let result = '';
  for (const char of text) {
    const code = char.charCodeAt(0);
    // Extended range: FB50-FDFF (Arabic Presentation Forms-A) + FE70-FEFF (Forms-B)
    if ((code >= 0xFB50 && code <= 0xFDFF) || (code >= 0xFE70 && code <= 0xFEFF)) {
      result += presentationFormsMap[code] || char;
    } else {
      result += char;
    }
  }
  return result;
}

/**
 * Separates glued Arabic words using linguistic patterns (for sanitizeArabicTextFrontend)
 */
const separateGluedArabicWordsFrontend = (text: string): string => {
  let result = text;
  
  // Define combined Arabic range (standard + presentation forms)
  const ARABIC_RANGE = '[\u0600-\u06FF\uFE70-\uFEFF]';
  
  // Pattern 1: Separate Arabic definite article ال when glued to next word
  result = result.replace(new RegExp(`(${ARABIC_RANGE})(ال${ARABIC_RANGE})`, 'g'), '$1 $2');
  
  // Pattern 2: Separate common prepositions (ل، في، من، إلى، على، ب) glued to words
  result = result.replace(new RegExp(`(${ARABIC_RANGE})(ل${ARABIC_RANGE}{2,})`, 'g'), '$1 $2');
  result = result.replace(new RegExp(`(${ARABIC_RANGE})(في${ARABIC_RANGE}{2,})`, 'g'), '$1 $2');
  result = result.replace(new RegExp(`(${ARABIC_RANGE})(من${ARABIC_RANGE}{2,})`, 'g'), '$1 $2');
  result = result.replace(new RegExp(`(${ARABIC_RANGE})(إلى${ARABIC_RANGE}{2,})`, 'g'), '$1 $2');
  result = result.replace(new RegExp(`(${ARABIC_RANGE})(على${ARABIC_RANGE}{2,})`, 'g'), '$1 $2');
  result = result.replace(new RegExp(`(${ARABIC_RANGE})(ب${ARABIC_RANGE}{3,})`, 'g'), '$1 $2');
  
  // Pattern 3: Separate ALL numbers (not just years) from Arabic words
  result = result.replace(new RegExp(`(${ARABIC_RANGE})(\\d+)`, 'g'), '$1 $2');
  result = result.replace(new RegExp(`(\\d+)(${ARABIC_RANGE})`, 'g'), '$1 $2');
  
  // Pattern 4: Force space around punctuation
  result = result.replace(new RegExp(`(${ARABIC_RANGE})([(){}\\[\\]«»"""',،:;؛\\-–—])`, 'g'), '$1 $2');
  result = result.replace(new RegExp(`([(){}\\[\\]«»"""',،:;؛\\-–—])(${ARABIC_RANGE})`, 'g'), '$1 $2');
  
  // Pattern 5: Separate when Arabic word ends and another starts with common patterns
  result = result.replace(/([\u0621-\u064A\uFE70-\uFEFF][\u064B-\u0652]?[\u0621-\u064A\uFE70-\uFEFF])(ال[\u0621-\u064A\uFE70-\uFEFF])/g, '$1 $2');
  
  // Pattern 6: Separate لسنة (li-sanat = "for the year") when glued
  result = result.replace(new RegExp(`(${ARABIC_RANGE})(لسنة)`, 'g'), '$1 $2');
  
  // Pattern 7: Separate when we have multiple capital-like patterns (e.g., القضاء الإداري)
  result = result.replace(/([\u0621-\u064A\uFE70-\uFEFF]{4,})(ال[\u0621-\u064A\uFE70-\uFEFF]{4,})/g, '$1 $2');
  
  // Pattern 8: Add space between long glued Arabic blocks (6+ letters each)
  result = result.replace(/([\u0621-\u064A\uFE70-\uFEFF]{6,})([\u0621-\u064A\uFE70-\uFEFF]{6,})/g, '$1 $2');
  
  // NEW Pattern 9: Intelligent word boundary detection using common endings and beginnings
  const WORD_ENDINGS = ['ة', 'ي', 'ن', 'م', 'ه', 'ا', 'ك', 'ت'];
  const WORD_BEGINNINGS = ['ال', 'و', 'ب', 'ل', 'في', 'من', 'إلى', 'على'];
  
  for (const ending of WORD_ENDINGS) {
    for (const beginning of WORD_BEGINNINGS) {
      const pattern = new RegExp(`(${ending})(${beginning})`, 'g');
      result = result.replace(pattern, '$1 $2');
    }
  }
  
  // NEW Pattern 10: Improve punctuation spacing
  result = result.replace(new RegExp(`\\.([${ARABIC_RANGE}])`, 'g'), '. $1');
  result = result.replace(new RegExp(`([${ARABIC_RANGE}])-([${ARABIC_RANGE}])`, 'g'), '$1 - $2');
  
  // Final: normalize spaces around punctuation
  result = result.replace(/\s*([،:;؛])\s*/g, '$1 ');
  result = result.replace(/\s*([.!?])\s*/g, '$1 ');
  
  return result;
};

/**
 * Fixes bidirectional issues with parentheses in Arabic text
 * Uses Unicode control characters (RLM, FSI, PDI) to ensure correct RTL rendering
 * Prevents the BiDi algorithm from reordering words around neutral parentheses
 */
export const fixArabicParentheses = (text: string): string => {
  if (!text) return text;
  
  const RLM = '\u200F';  // Right-to-Left Mark
  const FSI = '\u2068';  // First Strong Isolate
  const PDI = '\u2069';  // Pop Directional Isolate
  
  let result = text;
  
  // First: Remove any existing RLM/FSI/PDI to prevent double-wrapping
  result = result.replace(/[\u200F\u2068\u2069]/g, '');
  
  // Fix reversed parentheses in RTL context: )text( → (text)
  result = result.replace(/\)([^()]+)\(/g, '($1)');
  
  // Wrap Arabic text in parentheses with isolates to prevent BiDi reordering
  // Match: (Arabic text) - uses FSI/PDI to isolate the content
  result = result.replace(
    /\(([^()]*[\u0600-\u06FF\uFE70-\uFEFF][^()]*)\)/g,
    `${RLM}(${FSI}$1${PDI})${RLM}`
  );
  
  // Also handle square brackets containing Arabic
  result = result.replace(
    /\[([^\[\]]*[\u0600-\u06FF\uFE70-\uFEFF][^\[\]]*)\]/g,
    `${RLM}[${FSI}$1${PDI}]${RLM}`
  );
  
  // Handle guillemets (French quotes) containing Arabic
  result = result.replace(
    /«([^«»]*[\u0600-\u06FF\uFE70-\uFEFF][^«»]*)»/g,
    `${RLM}«${FSI}$1${PDI}»${RLM}`
  );
  
  // Handle curly braces containing Arabic
  result = result.replace(
    /\{([^{}]*[\u0600-\u06FF\uFE70-\uFEFF][^{}]*)\}/g,
    `${RLM}{${FSI}$1${PDI}}${RLM}`
  );
  
  return result;
};

/**
 * Frontend Arabic sanitization matching OCR pipeline logic
 * Same logic as backend sanitizeArabicText in supabase/functions/_shared/utils.ts
 */
export const sanitizeArabicTextFrontend = (text: string | null | undefined): string => {
  if (!text) return '';
  
  // Step 0: Normalize ALL Unicode whitespace to standard space FIRST
  let sanitized = text.replace(/[\u00A0\u2000-\u200A\u202F\u205F\u3000\u200B-\u200F]/g, ' ');
  
  // Step 0.5: Convert Arabic Presentation Forms BEFORE NFKC
  sanitized = convertPresentationForms(sanitized);
  
  // Step 1: NFKC normalization
  sanitized = sanitized.normalize('NFKC');
  
  // Step 2: Strip control characters
  sanitized = sanitized
    .replace(/[\u200B-\u200F]/g, '')
    .replace(/\u0640/g, '');
  
  // Step 2.5: FIX DISCONNECTED HEH AT WORD END
  const HEH_WORD_END = '([\\u0621-\\u064A])[\\s\\u200B-\\u200F\\u2060]+(ه)(?=\\s|$|[.،؛:؟!])';
  sanitized = sanitized.replace(new RegExp(HEH_WORD_END, 'g'), '$1$2');
  
  const HEH_DIACRITIC_END = '([\\u0621-\\u064A])[\\s\\u200B-\\u200F\\u2060]+(ه[\\u064B-\\u0652]?)(?=\\s|$|[.،؛:؟!])';
  sanitized = sanitized.replace(new RegExp(HEH_DIACRITIC_END, 'g'), '$1$2');
  
  const HEH_PRONOUN = '([\\u0621-\\u064A])[\\s\\u200B-\\u200F\\u2060]+(ه[اموين])(?=\\s|$|[.،؛:؟!])';
  sanitized = sanitized.replace(new RegExp(HEH_PRONOUN, 'g'), '$1$2');
  
  // Step 3: Remap non-standard characters including ALL Heh variants
  const charMap: Record<string, string> = {
    '\u06A9': '\u0643', '\u06AF': '\u0643',
    '\u06CC': '\u064A', '\u06D2': '\u064A',
    '\u06C0': '\u0647', '\u06C1': '\u0647', '\u06C2': '\u0647',
    '\u06D5': '\u0647', '\u06BE': '\u0647',
    '\uFEE9': '\u0647', '\uFEEA': '\u0647', '\uFEEB': '\u0647', '\uFEEC': '\u0647',
    '\uFBAA': '\u0647', '\uFBAB': '\u0647', '\uFBAC': '\u0647', '\uFBAD': '\u0647',
  };
  
  for (const [from, to] of Object.entries(charMap)) {
    sanitized = sanitized.replace(new RegExp(from, 'g'), to);
  }
  
  // Step 4: Reorder diacritics
  sanitized = sanitized.replace(/([\u064B-\u0650\u0652])(\u0651)/g, '$2$1');
  
  // Step 4.5: FIX CHADDA (Shadda ّ U+0651) SPACING ISSUES
  const SPACE_CLASS = '[\\s\\u00A0\\u2000-\\u200A\\u202F\\u205F\\u3000]';
  
  sanitized = sanitized.replace(new RegExp(`([\\u0621-\\u064A\\u0647])${SPACE_CLASS}+(\\u0651)([\\u0621-\\u064A\\u0647])`, 'g'), '$1$2$3');
  sanitized = sanitized.replace(/([\u0621-\u064A]+)\s+(\u0651)\s+([\u0621-\u064A]+)/g, '$1$2 $3');
  sanitized = sanitized.replace(/([\u0621-\u064A])\s+(\u0651)([\u0621-\u064A])/g, '$1$2$3');
  sanitized = sanitized.replace(/([\u0621-\u064A])\s+(\u0651)/g, '$1$2');
  
  sanitized = sanitized.replace(new RegExp(`([\\u0621-\\u064A\\u0647])${SPACE_CLASS}+(\\u0651)(\\s|$)`, 'g'), '$1$2$3');
  sanitized = sanitized.replace(/^(\s*)\u0651\s*/gm, '$1');
  sanitized = sanitized.replace(/(\s)\u0651(\s)/g, '$1');
  sanitized = sanitized.replace(new RegExp(`([\\u0621-\\u064A\\u0647])${SPACE_CLASS}+(\\u0651)`, 'g'), '$1$2');
  sanitized = sanitized.replace(/\u0651{2,}/g, '\u0651');
  
  // OCR Pattern 4: Final Heh variants normalization
  const finalHehVariants = /[\uFBAA-\uFBAD\uFEE9-\uFEEC](?=\s|$)/g;
  sanitized = sanitized.replace(finalHehVariants, 'ه');
  
  // OCR Pattern 5: Numbers glued to words
  sanitized = sanitized.replace(/([\u0621-\u064A])(\d)/g, '$1 $2');
  sanitized = sanitized.replace(/(\d)([\u0621-\u064A])/g, '$1 $2');
  
  // OCR Pattern 6: Orphan Chadda at word start
  sanitized = sanitized.replace(/(\s)\u0651([\u0621-\u064A])/g, '$1$2');
  
  // Special case: عال ّ → عالٍ
  sanitized = sanitized.replace(/عال[\s]*ّ/g, 'عالٍ');
  
  // Fix RTL parentheses: )text( → (text)
  sanitized = sanitized.replace(/\)([^()]+)\(/g, '($1)');
  
  // Pattern G: Words glued with "في"
  sanitized = sanitized.replace(/([\u0621-\u064A]{3,})(في)([\u0621-\u064A]{3,})/g, '$1 $2 $3');
  
  // Pattern H: Missing space before opening quotation mark
  sanitized = sanitized.replace(/([\u0621-\u064A\u064B-\u0652])(["«])([\u0621-\u064A])/g, '$1 $2$3');
  
  // Pattern I: Words ending with ّها or ّه followed immediately by another word
  sanitized = sanitized.replace(/([\u0651][هھ]ا?)([\u0621-\u064A]{3,})/g, '$1 $2');
  
  // Step 5: DEGLUE PASS - Fix broken intra-word spaces
  sanitized = sanitized.replace(/ا\s+ل/g, 'ال');
  sanitized = sanitized.replace(/ع\s*[\u200B-\u200F\u2060]?\s*ل/g, 'عل');
  sanitized = sanitized.replace(/ج\s*[\u200B-\u200F\u2060]?\s*ا/g, 'جا');
  sanitized = sanitized.replace(/ب\s*[\u200B-\u200F\u2060]?\s*ا/g, 'با');
  sanitized = sanitized.replace(/ب\s+ال/g, 'بال');
  
  // Remove spaces between letter and diacritics
  sanitized = sanitized.replace(/([\u0621-\u064A])\s+([\u064B-\u0652\u0670])/g, '$1$2');
  
  // NEW: Remove spaces inside quotation marks
  sanitized = sanitized.replace(/"\s+/g, '"');
  sanitized = sanitized.replace(/\s+"/g, '"');
  sanitized = sanitized.replace(/«\s+/g, '«');
  sanitized = sanitized.replace(/\s+»/g, '»');
  
  // NEW: Fix specific OCR patterns
  sanitized = sanitized.replace(/الأ\s+و/g, 'الأو');
  sanitized = sanitized.replace(/الإ\s+ع/g, 'الإع');
  sanitized = sanitized.replace(/أ\s+([حرنملتك])/g, 'أ$1');
  sanitized = sanitized.replace(/إ\s+([حرنملتك])/g, 'إ$1');
  
  // Fix common broken patterns
  sanitized = sanitized.replace(/ا\s*ل\s*([\u0621-\u064A])/g, 'ال$1');
  
  // Pattern: single spaces within 3-6 letter Arabic words
  sanitized = sanitized.replace(/([\u0621-\u064A])\s+([\u0621-\u064A])\s+([\u0621-\u064A])\s+([\u0621-\u064A])/g, '$1$2$3$4');
  sanitized = sanitized.replace(/([\u0621-\u064A])\s+([\u0621-\u064A])\s+([\u0621-\u064A])/g, '$1$2$3');
  
  // NOTE: Step 6 (separateGluedArabicWordsFrontend) removed - it was breaking correctly formatted Arabic text
  // The backend OCR uses separation for raw OCR output, but frontend should NOT re-apply it on clean text
  // Step 7: Clean orphan diacritics at word boundaries
  sanitized = sanitized.replace(/\s+[\u064B-\u0652\u0670]+\s+/g, ' ');
  
  // Step 8: Final cleanup - compact multiple spaces
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  // Step 9: Fix BiDi issues with parentheses
  sanitized = fixArabicParentheses(sanitized);
  
  return sanitized;
};

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
    // ALL Heh (ه) variants → Standard Arabic Heh (U+0647)
    // Presentation Forms-B
    '\uFEE9': '\u0647',  // ﻩ isolated → ه
    '\uFEEA': '\u0647',  // ﻪ final → ه
    '\uFEEB': '\u0647',  // ﻫ initial → ه
    '\uFEEC': '\u0647',  // ﻬ medial → ه
    // Heh Doachashmee forms
    '\uFBAA': '\u0647',  // isolated → ه
    '\uFBAB': '\u0647',  // final → ه
    '\uFBAC': '\u0647',  // initial → ه
    '\uFBAD': '\u0647',  // medial → ه
    // Other Heh variants
    '\u06C0': '\u0647',  // Heh with Yeh above → ه
    '\u06C1': '\u0647',  // ہ Heh goal → ه
    '\u06D5': '\u0647',  // Ae → ه
    '\u06BE': '\u0647',  // ھ Heh Doachashmee → ه
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
 * Fix Heh (ه) variants - converts all presentation forms to standard Arabic Heh
 * This ensures the "ه" character displays properly connected/closed
 * ONLY modifies Heh variants, does NOT touch any other characters
 */
export const fixHehVariants = (text: string | null | undefined): string => {
  if (!text) return '';
  
  let fixed = text;
  
  // Convert ALL Heh presentation forms to standard Arabic Heh (U+0647)
  const hehVariants: Record<string, string> = {
    '\uFEE9': '\u0647', // ﻩ isolated → ه
    '\uFEEA': '\u0647', // ﻪ final → ه
    '\uFEEB': '\u0647', // ﻫ initial → ه
    '\uFEEC': '\u0647', // ﻬ medial → ه
    '\uFBAA': '\u0647', // Heh Doachashmee isolated → ه
    '\uFBAB': '\u0647', // Heh Doachashmee final → ه
    '\uFBAC': '\u0647', // Heh Doachashmee initial → ه
    '\uFBAD': '\u0647', // Heh Doachashmee medial → ه
    '\u06C0': '\u0647', // Heh with Yeh above → ه
    '\u06C1': '\u0647', // Heh goal → ه
    '\u06D5': '\u0647', // Ae → ه
    '\u06BE': '\u0647', // Heh Doachashmee → ه
  };
  
  for (const [from, to] of Object.entries(hehVariants)) {
    fixed = fixed.replace(new RegExp(from, 'g'), to);
  }
  
  return fixed;
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