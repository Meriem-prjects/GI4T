// Arabic text utilities for normalization and detection

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