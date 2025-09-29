// Arabic text utilities for normalization and detection

/**
 * Removes isolated shadda (ّ) that appears as separate characters
 * Only removes shadda not preceded by an Arabic character
 */
export const removeIsolatedShadda = (text: string): string => {
  if (!text) return text;
  // Arabic character ranges including Presentation Forms
  const arabicCharRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  // Remove shadda (U+0651) that is not preceded by an Arabic character
  return text.replace(/(^|[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF])\u0651/g, '$1');
};

/**
 * Sanitizes Arabic input by normalizing and removing isolated shadda
 * Preserves Presentation Forms like 'ﮫ' while cleaning up text pollution
 */
export const sanitizeArabicInput = (text: string): string => {
  if (!text) return text;
  // Use NFC normalization (not NFKC to preserve Presentation Forms)
  const normalized = text.normalize('NFC');
  // Remove only isolated shadda
  return removeIsolatedShadda(normalized);
};

/**
 * Normalizes Arabic text using Unicode NFC normalization
 * This ensures consistent encoding and rendering of Arabic characters
 */
export const normalizeArabicText = (text: string): string => {
  if (!text) return text;
  return text.normalize('NFC');
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