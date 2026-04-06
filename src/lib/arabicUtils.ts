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
  // Lam-Alef ligatures (ALL FORMS)
  0xFEF5: 'لا', 0xFEF6: 'لا', 0xFEF7: 'لأ', 0xFEF8: 'لأ',
  0xFEF9: 'لإ', 0xFEFA: 'لإ', 0xFEFB: 'لآ', 0xFEFC: 'لآ',
  // More Arabic Presentation Forms-A (Common ligatures)
  0xFB50: 'ٱ', 0xFB51: 'ٱ',
  0xFB52: 'ب', 0xFB53: 'ب', 0xFB54: 'ب', 0xFB55: 'ب',
  0xFB7A: 'چ', 0xFB7B: 'چ', 0xFB7C: 'چ', 0xFB7D: 'چ',
  0xFB8A: 'ژ', 0xFB8B: 'ژ',
  0xFB8E: 'ک', 0xFB8F: 'ک', 0xFB90: 'ک', 0xFB91: 'ک',
  0xFB92: 'گ', 0xFB93: 'گ', 0xFB94: 'گ', 0xFB95: 'گ',
  0xFBD3: 'ڭ', 0xFBD4: 'ڭ', 0xFBD5: 'ڭ', 0xFBD6: 'ڭ',
  0xFBFC: 'ی', 0xFBFD: 'ی', 0xFBFE: 'ی', 0xFBFF: 'ی',
  // Common multi-character ligatures in Forms-A
  0xFD3E: '(', 0xFD3F: ')', // Ornate parentheses
  0xFDF2: 'الله',
  0xFDFB: 'جل جلاله',
  // Heh Goal/Doachashmee forms (U+FBAA-U+FBAD) - terminal Heh variations
  0xFBAA: 'ه', 0xFBAB: 'ه', 0xFBAC: 'ه', 0xFBAD: 'ه',
  // Yeh Barree forms (U+FBAE-U+FBAF)
  0xFBAE: 'ي', 0xFBAF: 'ي',
  // Alef Maksura variations
  0xFBE8: 'ى', 0xFBE9: 'ى'
};

/**
 * STRIP DIACRITICS
 * Removes all Arabic diacritics (Harakat) to allow standard regex matching.
 */
export const stripArabicDiacritics = (text: string): string => {
  return text.replace(/[\u064B-\u0652\u0670\u0651]/g, '');
};

/**
 * LINGUISTIC REPAIR HAMMER
 * Aggressively resolves pattern-based fusions and invisible character issues.
 */
const linguisticRepairHammer = (text: string): string => {
  let result = text;
  const ARABIC_CHAR = '[\u0621-\u064A]';

  // 1. Invisible character absolute removal
  result = result.replace(/[\u00AD\u200B-\u200F\u2060\u202A-\u202E]/g, '');

  // 2. Structural Judicial Splitter
  // [Word]لل[Word] -> [Word] لل[Word]
  result = result.replace(new RegExp(`(${ARABIC_CHAR}{2,})(لل)(${ARABIC_CHAR}{2,})`, 'g'), '$1 $2$3');

  // [Word]ال[Word] -> [Word] ال[Word]
  result = result.replace(new RegExp(`(${ARABIC_CHAR}{2,})(ال)(${ARABIC_CHAR}{2,})`, 'g'), '$1 $2$3');

  // High frequency legal fusions — prepositions and conjunctions
  result = result.replace(new RegExp(`(${ARABIC_CHAR}{2,})(لوضع)`, 'g'), '$1 $2');
  result = result.replace(new RegExp(`(${ARABIC_CHAR}{2,})(مخالف)`, 'g'), '$1 $2');
  result = result.replace(new RegExp(`(${ARABIC_CHAR}{2,})(قابل)`, 'g'), '$1 $2');
  result = result.replace(new RegExp(`(${ARABIC_CHAR}{2,})(بمشمولات)`, 'g'), '$1 $2');
  result = result.replace(new RegExp(`(${ARABIC_CHAR}{2,})(بالنظر)`, 'g'), '$1 $2');

  // Fusions with common prepositions (في، من، على، إلى، عن، بين)
  result = result.replace(new RegExp(`(${ARABIC_CHAR}{3,})(في)(${ARABIC_CHAR}{3,})`, 'g'), '$1 $2 $3');
  result = result.replace(new RegExp(`(${ARABIC_CHAR}{3,})(من)(${ARABIC_CHAR}{3,})`, 'g'), '$1 $2 $3');
  result = result.replace(new RegExp(`(${ARABIC_CHAR}{3,})(على)(${ARABIC_CHAR}{3,})`, 'g'), '$1 $2 $3');
  result = result.replace(new RegExp(`(${ARABIC_CHAR}{3,})(إلى)(${ARABIC_CHAR}{3,})`, 'g'), '$1 $2 $3');
  result = result.replace(new RegExp(`(${ARABIC_CHAR}{3,})(عن)(${ARABIC_CHAR}{3,})`, 'g'), '$1 $2 $3');
  result = result.replace(new RegExp(`(${ARABIC_CHAR}{3,})(بين)(${ARABIC_CHAR}{3,})`, 'g'), '$1 $2 $3');

  // Fusions with conjunctions (و، أو، ثم، أن، إن)
  result = result.replace(new RegExp(`(${ARABIC_CHAR}{3,})(و)(ال${ARABIC_CHAR}{2,})`, 'g'), '$1 $2$3');
  result = result.replace(new RegExp(`(${ARABIC_CHAR}{3,})(أو)(${ARABIC_CHAR}{3,})`, 'g'), '$1 $2 $3');
  result = result.replace(new RegExp(`(${ARABIC_CHAR}{3,})(ثم)(${ARABIC_CHAR}{3,})`, 'g'), '$1 $2 $3');

  // Fusions after ta marbuta (ة) — very common OCR fusion
  result = result.replace(new RegExp(`(ة)(${ARABIC_CHAR}{3,})`, 'g'), '$1 $2');

  // Fusions after hamza (ء)
  result = result.replace(new RegExp(`(ء)([^ال]${ARABIC_CHAR}{2,})`, 'g'), '$1 $2');

  // 3. Contextual Rejoiner (Anti-splitting)
  result = result.replace(/بالت\s+الي/g, 'بالتالي');
  result = result.replace(/بال\s+تالي/g, 'بالتالي');
  result = result.replace(/ال\s+تدخل/g, 'التدخل');
  result = result.replace(/ال\s+إدارية/g, 'الإدارية');
  result = result.replace(/ال\s+محكمة/g, 'المحكمة');
  result = result.replace(/ال\s+قضاء/g, 'القضاء');
  result = result.replace(/ال\s+دستور/g, 'الدستور');
  result = result.replace(/ال\s+حكومة/g, 'الحكومة');
  result = result.replace(/ال\s+قانون/g, 'القانون');
  result = result.replace(/بناء\s+على/g, 'بناء على');

  // 4. Ta marbuta / Ha correction at end of common legal words
  // المحكمه → المحكمة
  result = result.replace(/المحكمه(?=\s|$|[.،؛:؟!])/g, 'المحكمة');
  result = result.replace(/الحكومه(?=\s|$|[.،؛:؟!])/g, 'الحكومة');
  result = result.replace(/الإداريه(?=\s|$|[.،؛:؟!])/g, 'الإدارية');
  result = result.replace(/القانونيه(?=\s|$|[.،؛:؟!])/g, 'القانونية');
  result = result.replace(/الدستوريه(?=\s|$|[.،؛:؟!])/g, 'الدستورية');
  result = result.replace(/المنظومه(?=\s|$|[.،؛:؟!])/g, 'المنظومة');
  result = result.replace(/الشرعيه(?=\s|$|[.،؛:؟!])/g, 'الشرعية');
  result = result.replace(/العامه(?=\s|$|[.،؛:؟!])/g, 'العامة');
  result = result.replace(/الخاصه(?=\s|$|[.،؛:؟!])/g, 'الخاصة');

  return result;
};

/**
 * Converts Arabic Presentation Forms-B to base characters
 */
function convertPresentationForms(text: string): string {
  let result = '';
  for (const char of text) {
    const code = char.charCodeAt(0);
    if ((code >= 0xFB50 && code <= 0xFDFF) || (code >= 0xFE70 && code <= 0xFEFF)) {
      result += presentationFormsMap[code] || char;
    } else {
      result += char;
    }
  }
  return result;
}

/**
 * Separates glued Arabic words using linguistic patterns
 */
const separateGluedArabicWordsFrontend = (text: string): string => {
  let result = text;
  const ARABIC_RANGE = '[\u0600-\u06FF\uFE70-\uFEFF]';

  result = result.replace(new RegExp(`(${ARABIC_RANGE})(\\d+)`, 'g'), '$1 $2');
  result = result.replace(new RegExp(`(\\d+)(${ARABIC_RANGE})`, 'g'), '$1 $2');
  result = result.replace(new RegExp(`(${ARABIC_RANGE})([(){}\\[\\]«»"""',،:;؛\\-–—])`, 'g'), '$1 $2');
  result = result.replace(new RegExp(`([(){}\\[\\]«»"""',.,:;؛\\-–—])(${ARABIC_RANGE})`, 'g'), '$1 $2');

  const whitelist = [
    // Court and institution fusions
    { from: /المحكمةالإدارية/g, to: 'المحكمة الإدارية' },
    { from: /بالمحكمةالإدارية/g, to: 'بالمحكمة الإدارية' },
    { from: /المحكمةالابتدائية/g, to: 'المحكمة الابتدائية' },
    { from: /محكمةالتعقيب/g, to: 'محكمة التعقيب' },
    { from: /محكمةالاستئناف/g, to: 'محكمة الاستئناف' },
    { from: /وزارةالداخلية/g, to: 'وزارة الداخلية' },
    { from: /بمشمولاتوزارةالداخلية/g, to: 'بمشمولات وزارة الداخلية' },
    { from: /وزارةالعدل/g, to: 'وزارة العدل' },
    { from: /المجلسالدستوري/g, to: 'المجلس الدستوري' },
    { from: /المحكمةالدستورية/g, to: 'المحكمة الدستورية' },
    // Legal concept fusions
    { from: /الإقامةالجبرية/g, to: 'الإقامة الجبرية' },
    { from: /الدستورالتونسي/g, to: 'الدستور التونسي' },
    { from: /التدخللوضع/g, to: 'التدخل لوضع' },
    { from: /قابلللنقاش/g, to: 'قابل للنقاش' },
    { from: /مخالفللدستور/g, to: 'مخالف للدستور' },
    { from: /القضاءالإداري/g, to: 'القضاء الإداري' },
    { from: /القانونالإداري/g, to: 'القانون الإداري' },
    { from: /القانونالدستوري/g, to: 'القانون الدستوري' },
    { from: /الحقوقالأساسية/g, to: 'الحقوق الأساسية' },
    { from: /حقوقالإنسان/g, to: 'حقوق الإنسان' },
    { from: /لحقوقالإنسان/g, to: 'لحقوق الإنسان' },
    { from: /الحريةالشخصية/g, to: 'الحرية الشخصية' },
    { from: /حريةالتنقل/g, to: 'حرية التنقل' },
    { from: /حريةالتعبير/g, to: 'حرية التعبير' },
    { from: /الإعلانالعالمي/g, to: 'الإعلان العالمي' },
    { from: /العهدالدولي/g, to: 'العهد الدولي' },
    { from: /الميثاقالإفريقي/g, to: 'الميثاق الإفريقي' },
    // Common verb/noun + preposition fusions
    { from: /قرارصادر/g, to: 'قرار صادر' },
    { from: /حكمصادر/g, to: 'حكم صادر' },
    { from: /طعنبالاستئناف/g, to: 'طعن بالاستئناف' },
    { from: /طعنبالتعقيب/g, to: 'طعن بالتعقيب' },
    // Numeric patterns
    { from: /لسنة(\d+)/g, to: 'لسنة $1' },
    { from: /الفصل(\d+)/g, to: 'الفصل $1' },
    { from: /المادة(\d+)/g, to: 'المادة $1' },
    { from: /العدد(\d+)/g, to: 'العدد $1' },
    // Country/place fusions
    { from: /تونسّالحقّ/g, to: 'تونسّ الحقّ' },
    { from: /تونسالحق/g, to: 'تونس الحق' },
    // Common correction
    { from: /بالإصافة/g, to: 'بالإضافة' },
  ];

  for (const entry of whitelist) {
    result = result.replace(entry.from, entry.to);
  }

  return result;
};

/**
 * Fixes bidirectional issues with parentheses
 */
export const fixArabicParentheses = (text: string): string => {
  if (!text) return text;
  const RLM = '\u200F'; const FSI = '\u2068'; const PDI = '\u2069';
  let result = text.replace(/[\u200F\u2068\u2069]/g, '');
  result = result.replace(/\)([^()]+)\(/g, '($1)');
  result = result.replace(/\(([^()]*[\u0600-\u06FF\uFE70-\uFEFF][^()]*)\)/g, `${RLM}(${FSI}$1${PDI})${RLM}`);
  result = result.replace(/\[([^\[\]]*[\u0600-\u06FF\uFE70-\uFEFF][^\[\]]*)\]/g, `${RLM}[${FSI}$1${PDI}]${RLM}`);
  result = result.replace(/«([^«»]*[\u0600-\u06FF\uFE70-\uFEFF][^«»]*)»/g, `${RLM}«${FSI}$1${PDI}»${RLM}`);
  result = result.replace(/\{([^{}]*[\u0600-\u06FF\uFE70-\uFEFF][^{}]*)\}/g, `${RLM}{${FSI}$1${PDI}}${RLM}`);
  return result;
};

/**
 * GOLD STANDARD Arabic Sanitization
 */
export const sanitizeArabicTextFrontend = (text: string | null | undefined): string => {
  if (!text) return '';

  let sanitized = text.replace(/[\u00A0\u2000-\u200A\u202F\u205F\u3000\u200B-\u200F\u2060\uFEFF]/g, ' ');
  sanitized = convertPresentationForms(sanitized);
  sanitized = sanitized.normalize('NFKC');

  // NUCLEAR OPTION: Strip diacritics to allow precision matching
  sanitized = stripArabicDiacritics(sanitized);

  // Hard Hammer Pass 1
  sanitized = linguisticRepairHammer(sanitized);

  sanitized = fixHehVariants(sanitized);

  // Safe Deglue
  sanitized = sanitized.replace(/ا\s+ل/g, 'ال');
  sanitized = sanitized.replace(/ال\s+([\u0621-\u064A])/g, 'ال$1');
  sanitized = sanitized.replace(/ب\s+ال/g, 'بال');
  sanitized = sanitized.replace(/ل\s+ل/g, 'لل');

  sanitized = separateGluedArabicWordsFrontend(sanitized);

  // Hard Hammer Pass 2 (Final Polish)
  sanitized = linguisticRepairHammer(sanitized);

  sanitized = fixArabicParentheses(sanitized);
  sanitized = sanitized.replace(/\s+/g, ' ').trim();

  return sanitized;
};

export const normalizeArabicForDisplay = (text: string): string => sanitizeArabicTextFrontend(text);
export const normalizeArabicText = (text: string): string => sanitizeArabicTextFrontend(text);
export const isArabicText = (text: string): boolean => {
  if (!text) return false;
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
};

export const handleArabicInput = (value: string): string => {
  if (!value) return value;
  return value.replace(/ا\s+ل/g, 'ال').replace(/ال\s+([ب-ي])/g, 'ال$1');
};

export const fixHehVariants = (text: string | null | undefined): string => {
  if (!text) return '';
  let fixed = text;
  const hehVariants: Record<string, string> = {
    '\uFEE9': '\u0647', '\uFEEA': '\u0647', '\uFEEB': '\u0647', '\uFEEC': '\u0647',
    '\uFBAA': '\u0647', '\uFBAB': '\u0647', '\uFBAC': '\u0647', '\uFBAD': '\u0647',
    '\u06C0': '\u0647', '\u06C1': '\u0647', '\u06D5': '\u0647', '\u06BE': '\u0647',
  };
  for (const [from, to] of Object.entries(hehVariants)) fixed = fixed.replace(new RegExp(from, 'g'), to);
  return fixed;
};

export const getArabicClasses = (text: string): string => isArabicText(text) ? 'arabic-text' : '';
export const getTextDirection = (text: string): 'ltr' | 'rtl' => isArabicText(text) ? 'rtl' : 'ltr';
