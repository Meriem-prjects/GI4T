// Arabic text utilities for normalization and detection

/**
 * Normalizes Arabic text using Unicode NFC normalization
 * This ensures consistent encoding and rendering of Arabic characters
 */
export const normalizeArabicText = (text: string, options: {
  removeTatweel?: boolean;
  removeInvisibleChars?: boolean;
  removePresentationForms?: boolean;
} = {}): string => {
  if (!text) return text;
  
  const {
    removeTatweel = true,
    removeInvisibleChars = false,
    removePresentationForms = true
  } = options;
  
  let normalized = text.normalize('NFC');
  
  // Remove tatweel (Arabic kashida/elongation character)
  if (removeTatweel) {
    normalized = normalized.replace(/\u0640/g, '');
  }
  
  // Remove invisible characters (ZWNJ, ZWJ) - optional as they can be meaningful
  if (removeInvisibleChars) {
    normalized = normalized.replace(/[\u200C\u200D]/g, '');
  }
  
  // Remove Presentation Forms (U+FE70–U+FEFF) from old editors, but keep BOM (FEFF) removal optional
  if (removePresentationForms) {
    normalized = normalized.replace(/[\uFE70-\uFEFC]/g, '');
  }
  
  return normalized;
};

/**
 * Detects if text contains Arabic characters
 */
export const isArabicText = (text: string): boolean => {
  if (!text) return false;
  // Arabic Unicode range: \u0600-\u06FF (Arabic block) + \u0750-\u077F (Arabic Supplement)
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F]/;
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