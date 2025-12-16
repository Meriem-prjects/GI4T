// Shared utility functions for edge functions
export const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : String(error);
};

export const ensureString = (value: string | undefined | null, fallback = ''): string => {
  return value ?? fallback;
};

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
  // Only apply when Heh is followed by space, punctuation, or end of string
  // This prevents affecting words like "فقيه" where Heh is naturally connected
  
  // Pattern: letter + space/invisible + ه + (space or end or punctuation)
  // "صياغت ه" → "صياغته"
  const HEH_WORD_END = '([\\u0621-\\u064A])[\\s\\u200B-\\u200F\\u2060]+(ه)(?=\\s|$|[.،؛:؟!])';
  sanitized = sanitized.replace(new RegExp(HEH_WORD_END, 'g'), '$1$2');
  
  // Also handle Heh with diacritics at word end
  // "صياغت هُ" → "صياغتهُ"
  const HEH_DIACRITIC_END = '([\\u0621-\\u064A])[\\s\\u200B-\\u200F\\u2060]+(ه[\\u064B-\\u0652]?)(?=\\s|$|[.،؛:؟!])';
  sanitized = sanitized.replace(new RegExp(HEH_DIACRITIC_END, 'g'), '$1$2');
  
  // Handle Heh with pronoun suffix (ها، هم، هن، هما)
  // "كلمت ها" → "كلمتها"
  const HEH_PRONOUN = '([\\u0621-\\u064A])[\\s\\u200B-\\u200F\\u2060]+(ه[اموين])(?=\\s|$|[.،؛:؟!])';
  sanitized = sanitized.replace(new RegExp(HEH_PRONOUN, 'g'), '$1$2');
  
  // Step 3: Remap non-standard characters including ALL Heh variants
  const charMap: Record<string, string> = {
    '\u06A9': '\u0643', '\u06AF': '\u0643', // Persian Kaf → Arabic Kaf
    '\u06CC': '\u064A', '\u06D2': '\u064A', // Persian Yeh → Arabic Yeh
    // ALL Heh variants → standard Heh (U+0647 ه)
    '\u06C0': '\u0647', // Heh with Yeh above (ۀ)
    '\u06C1': '\u0647', // Heh Goal (ہ)
    '\u06C2': '\u0647', // Heh Goal with Hamza above (ۂ)
    '\u06D5': '\u0647', // Ae (ە)
    '\u06BE': '\u0647', // Heh Doachashmee base
    '\uFEE9': '\u0647', // Heh isolated (ﻩ)
    '\uFEEA': '\u0647', // Heh final (ﻪ)
    '\uFEEB': '\u0647', // Heh initial (ﻫ)
    '\uFEEC': '\u0647', // Heh medial (ﻬ)
    '\uFBAA': '\u0647', // Heh Doachashmee isolated (ﮪ)
    '\uFBAB': '\u0647', // Heh Doachashmee final (ﮫ)
    '\uFBAC': '\u0647', // Heh Doachashmee initial (ﮬ)
    '\uFBAD': '\u0647', // Heh Doachashmee medial (ﮭ)
  };
  
  for (const [from, to] of Object.entries(charMap)) {
    sanitized = sanitized.replace(new RegExp(from, 'g'), to);
  }
  
  // Step 4: Reorder diacritics
  sanitized = sanitized.replace(/([\u064B-\u0650\u0652])(\u0651)/g, '$2$1');
  
  // Step 4.5: FIX CHADDA (Shadda ّ U+0651) SPACING ISSUES - Enhanced with comprehensive space class
  const SPACE_CLASS = '[\\s\\u00A0\\u2000-\\u200A\\u202F\\u205F\\u3000]';
  
  // Pattern A: Letter + space(s) + Chadda + Letter
  sanitized = sanitized.replace(new RegExp(`([\\u0621-\\u064A\\u0647])${SPACE_CLASS}+(\\u0651)([\\u0621-\\u064A\\u0647])`, 'g'), '$1$2$3');
  // === PRIORITY OCR-SPECIFIC CHADDA PATTERNS (must be first) ===
  
  // OCR Pattern 1: "الحق ّ النّقابي" → "الحقّ النّقابي" (word + space(s) + Chadda + space(s) + word)
  // Attach Chadda to preceding word, keep space before next word
  sanitized = sanitized.replace(/([\u0621-\u064A]+)\s+(\u0651)\s+([\u0621-\u064A]+)/g, '$1$2 $3');
  
  // OCR Pattern 2: "حر ّية" → "حرّية" (letter + space(s) + Chadda + letter, no space after)
  sanitized = sanitized.replace(/([\u0621-\u064A])\s+(\u0651)([\u0621-\u064A])/g, '$1$2$3');
  
  // OCR Pattern 3: Fallback - Chadda with space before it, attach to previous letter
  sanitized = sanitized.replace(/([\u0621-\u064A])\s+(\u0651)/g, '$1$2');
  
  // === GENERAL CHADDA PATTERNS ===
  
  // Pattern B: Letter + space(s) + Chadda at end → attach to letter
  sanitized = sanitized.replace(new RegExp(`([\\u0621-\\u064A\\u0647])${SPACE_CLASS}+(\\u0651)(\\s|$)`, 'g'), '$1$2$3');
  // Pattern C: Orphan Chadda at start → remove
  sanitized = sanitized.replace(/^(\s*)\u0651\s*/gm, '$1');
  sanitized = sanitized.replace(/(\s)\u0651(\s)/g, '$1');
  // Pattern E: Letter + any space + Chadda (no following letter) → Letter + Chadda
  sanitized = sanitized.replace(new RegExp(`([\\u0621-\\u064A\\u0647])${SPACE_CLASS}+(\\u0651)`, 'g'), '$1$2');
  // Pattern F: Multiple Chaddas → single Chadda
  sanitized = sanitized.replace(/\u0651{2,}/g, '\u0651');
  
  // === ADDITIONAL OCR-SPECIFIC PATTERNS ===
  
  // OCR Pattern 4: Final Heh variants normalization
  const finalHehVariants = /[\uFBAA-\uFBAD\uFEE9-\uFEEC](?=\s|$)/g;
  sanitized = sanitized.replace(finalHehVariants, 'ه');
  
  // OCR Pattern 5: Numbers glued to words (في10ديسمبر → في 10 ديسمبر)
  sanitized = sanitized.replace(/([\u0621-\u064A])(\d)/g, '$1 $2');
  sanitized = sanitized.replace(/(\d)([\u0621-\u064A])/g, '$1 $2');
  
  // OCR Pattern 6: Orphan Chadda at word start (cleanup any remaining cases)
  sanitized = sanitized.replace(/(\s)\u0651([\u0621-\u064A])/g, '$1$2');
  
  // Special case: عال ّ → عالٍ (defective noun pattern in Arabic)
  sanitized = sanitized.replace(/عال[\s]*ّ/g, 'عالٍ');
  
  // Fix RTL parentheses: )text( → (text)
  sanitized = sanitized.replace(/\)([^()]+)\(/g, '($1)');
  
  // Pattern G: Words glued with "في" (e.g., شخصفيالتّنقّل → شخص في التّنقّل)
  sanitized = sanitized.replace(/([\u0621-\u064A]{3,})(في)([\u0621-\u064A]{3,})/g, '$1 $2 $3');
  
  // Pattern H: Missing space before opening quotation mark (e.g., بأنّها"الحق → بأنّها "الحق)
  sanitized = sanitized.replace(/([\u0621-\u064A\u064B-\u0652])(["«])([\u0621-\u064A])/g, '$1 $2$3');
  
  // Pattern I: Words ending with ّها or ّه followed immediately by another word
  sanitized = sanitized.replace(/([\u0651][هھ]ا?)([\u0621-\u064A]{3,})/g, '$1 $2');
  
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
  
  // NEW: Remove spaces inside quotation marks
  sanitized = sanitized.replace(/"\s+/g, '"');  // Quote + space → Quote
  sanitized = sanitized.replace(/\s+"/g, '"');  // Space + quote → Quote
  sanitized = sanitized.replace(/«\s+/g, '«');  // French quotes
  sanitized = sanitized.replace(/\s+»/g, '»');
  
  // NEW: Fix specific OCR patterns
  // "الأ ولى" → "الأولى"
  sanitized = sanitized.replace(/الأ\s+و/g, 'الأو');
  // "الإ علان" → "الإعلان"
  sanitized = sanitized.replace(/الإ\s+ع/g, 'الإع');
  // More generic Hamza patterns
  sanitized = sanitized.replace(/أ\s+([حرنملتك])/g, 'أ$1');
  sanitized = sanitized.replace(/إ\s+([حرنملتك])/g, 'إ$1');
  
  // Fix common broken patterns like "ا لع ا رض" -> "العارض"
  // Pattern: broken definite article at start
  sanitized = sanitized.replace(/ا\s*ل\s*([\u0621-\u064A])/g, 'ال$1');
  
  // Pattern: single spaces within 3-6 letter Arabic words (likely broken words)
  // Match: Arabic letter, space, 1-5 more (letter + optional space) combos
  sanitized = sanitized.replace(/([\u0621-\u064A])\s+([\u0621-\u064A])\s+([\u0621-\u064A])\s+([\u0621-\u064A])/g, '$1$2$3$4');
  sanitized = sanitized.replace(/([\u0621-\u064A])\s+([\u0621-\u064A])\s+([\u0621-\u064A])/g, '$1$2$3');
  
  // Step 6: SEPARATE GLUED ARABIC WORDS - Enhanced with new patterns
  sanitized = separateGluedArabicWords(sanitized);
  
  // Step 6.5: Additional fused word patterns for common cases
  // Pattern: ة (ta marbuta) + word → add space (إقامةجيرة → إقامة جيرة)
  sanitized = sanitized.replace(/(ة)([\u0621-\u064A]{3,})/g, '$1 $2');
  // Pattern: ء (hamza) + word (not article) → add space (إجراءحدودي → إجراء حدودي)
  sanitized = sanitized.replace(/(ء)([^ال][\u0621-\u064A]{3,})/g, '$1 $2');
  // Pattern: ر (ra) + long word → add space (آخرداخل → آخر داخل)
  sanitized = sanitized.replace(/([\u0621-\u064A]ر)([\u0621-\u064A]{4,})/g, '$1 $2');
  // Pattern: ق (qaf) + long word → add space
  sanitized = sanitized.replace(/([\u0621-\u064A]ق)([\u0621-\u064A]{4,})/g, '$1 $2');
  
  // Step 7: Clean orphan diacritics at word boundaries
  sanitized = sanitized.replace(/\s+[\u064B-\u0652\u0670]+\s+/g, ' ');
  
  // Step 8: Final cleanup - compact multiple spaces
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  // Step 9: Fix BiDi issues with parentheses
  sanitized = fixArabicParentheses(sanitized);
  
  return sanitized;
};

/**
 * Light version of Arabic text sanitization - preserves original appearance
 * - Converts presentation forms to base characters (necessary for consistency)
 * - NFKC normalization (necessary for Unicode)
 * - Fixes Chadda spacing (essential)
 * - Fixes disconnected Heh at word end (essential)
 * - NO aggressive word separation (preserves PDF appearance)
 * - Only minimal deglue: "ا ل" → "ال"
 */
export const sanitizeArabicTextLight = (text: string | null | undefined): string => {
  if (!text) return '';
  
  // Step 0: Normalize ALL Unicode whitespace to standard space
  let sanitized = text.replace(/[\u00A0\u2000-\u200A\u202F\u205F\u3000\u200B-\u200F]/g, ' ');
  
  // Step 1: Convert Arabic Presentation Forms BEFORE NFKC
  sanitized = convertPresentationForms(sanitized);
  
  // Step 2: NFKC normalization
  sanitized = sanitized.normalize('NFKC');
  
  // Step 3: Strip control characters and tatweel
  sanitized = sanitized
    .replace(/[\u200B-\u200F]/g, '')
    .replace(/\u0640/g, '');
  
  // Step 4: Fix disconnected Heh at word end (essential for readability)
  const HEH_WORD_END = '([\\u0621-\\u064A])[\\s\\u200B-\\u200F\\u2060]+(ه)(?=\\s|$|[.،؛:؟!])';
  sanitized = sanitized.replace(new RegExp(HEH_WORD_END, 'g'), '$1$2');
  
  const HEH_DIACRITIC_END = '([\\u0621-\\u064A])[\\s\\u200B-\\u200F\\u2060]+(ه[\\u064B-\\u0652]?)(?=\\s|$|[.،؛:؟!])';
  sanitized = sanitized.replace(new RegExp(HEH_DIACRITIC_END, 'g'), '$1$2');
  
  const HEH_PRONOUN = '([\\u0621-\\u064A])[\\s\\u200B-\\u200F\\u2060]+(ه[اموين])(?=\\s|$|[.،؛:؟!])';
  sanitized = sanitized.replace(new RegExp(HEH_PRONOUN, 'g'), '$1$2');
  
  // Step 5: Remap non-standard characters including Heh variants
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
  
  // Step 6: Reorder diacritics (Shadda before vowel marks)
  sanitized = sanitized.replace(/([\u064B-\u0650\u0652])(\u0651)/g, '$2$1');
  
  // Step 7: Fix Chadda spacing issues (essential)
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
  
  // Step 8: MINIMAL deglue - only fix broken "ا ل" → "ال"
  sanitized = sanitized.replace(/ا\s+ل/g, 'ال');
  
  // Step 9: Remove spaces between letter and diacritics
  sanitized = sanitized.replace(/([\u0621-\u064A])\s+([\u064B-\u0652\u0670])/g, '$1$2');
  
  // Step 10: Final cleanup - compact multiple spaces
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  return sanitized;
};

/**
 * RAW Arabic text sanitization - 100% faithful to PDF
 * Only removes invisible control characters and normalizes whitespace
 * NO character conversion, NO normalization, NO pattern fixes
 * Use this for display to preserve exact PDF appearance
 */
export const sanitizeArabicTextRaw = (text: string | null | undefined): string => {
  if (!text) return '';
  
  // ONLY remove truly invisible control characters that don't affect rendering
  let sanitized = text
    .replace(/[\u200B\u2060\uFEFF]/g, '') // Zero-width chars only
    .replace(/[\u0000-\u001F\u007F]/g, ''); // ASCII control chars
  
  // Normalize multiple spaces to single space (but preserve line breaks)
  sanitized = sanitized.replace(/[^\S\n\r]+/g, ' ');
  
  // Trim lines but preserve structure
  sanitized = sanitized.split('\n').map(line => line.trim()).join('\n');
  
  return sanitized.trim();
};

/**
 * Arabic text sanitization for DISPLAY - converts Presentation Forms to base characters
 * This ensures Arabic letters connect properly when rendered by the browser
 * - Converts Presentation Forms-B (U+FE70-U+FEFF) to base Arabic (U+0600-U+06FF)
 * - Removes invisible control characters
 * - Normalizes whitespace
 * - Does NOT apply aggressive transformations (preserves PDF structure)
 */
export const sanitizeArabicForDisplay = (text: string | null | undefined): string => {
  if (!text) return '';
  
  // Step 1: Convert Presentation Forms-B to base Arabic characters
  // This is ESSENTIAL for proper letter connection in the browser
  let sanitized = convertPresentationForms(text);
  
  // Step 2: Remove truly invisible control characters including ZWNJ
  sanitized = sanitized
    .replace(/[\u200B\u200C\u2060\uFEFF]/g, '') // Zero-width chars + ZWNJ (U+200C) to allow letter connection
    .replace(/[\u0000-\u001F\u007F]/g, ''); // ASCII control chars
  
  // Step 3: Normalize multiple spaces to single space (preserve line breaks)
  sanitized = sanitized.replace(/[^\S\n\r]+/g, ' ');
  
  // Step 4: Trim lines but preserve structure
  sanitized = sanitized.split('\n').map(line => line.trim()).join('\n');
  
  return sanitized.trim();
};

/**
 * Separates glued Arabic words using linguistic patterns
 * Detects transitions between Arabic words and common patterns
 * Combined range: U+0600-U+06FF (Arabic) + U+FE70-U+FEFF (Presentation Forms)
 */
const separateGluedArabicWords = (text: string): string => {
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
  // Common word endings
  const WORD_ENDINGS = ['ة', 'ي', 'ن', 'م', 'ه', 'ا', 'ك', 'ت'];
  // Common word beginnings (articles, prepositions)
  const WORD_BEGINNINGS = ['ال', 'و', 'ب', 'ل', 'في', 'من', 'إلى', 'على'];
  
  for (const ending of WORD_ENDINGS) {
    for (const beginning of WORD_BEGINNINGS) {
      const pattern = new RegExp(`(${ending})(${beginning})`, 'g');
      result = result.replace(pattern, '$1 $2');
    }
  }
  
  // NEW Pattern 10: Improve punctuation spacing
  // Force space after period when followed by Arabic letter
  result = result.replace(new RegExp(`\\.([${ARABIC_RANGE}])`, 'g'), '. $1');
  // Separate hyphens glued between words
  result = result.replace(new RegExp(`([${ARABIC_RANGE}])-([${ARABIC_RANGE}])`, 'g'), '$1 - $2');
  
  // Final: normalize spaces around punctuation
  result = result.replace(/\s*([،:;؛])\s*/g, '$1 ');
  result = result.replace(/\s*([.!?])\s*/g, '$1 ');
  
  return result;
};