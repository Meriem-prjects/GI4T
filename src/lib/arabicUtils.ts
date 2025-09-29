// Arabic text utilities for normalization and detection

/**
 * Normalizes Arabic text using Unicode normalization and cleans problematic characters
 * This ensures consistent encoding and rendering of Arabic characters
 */
export const normalizeArabicText = (text: string): string => {
  if (!text) return text;
  
  // First normalize using NFKC then NFC for best compatibility
  let normalized = text.normalize('NFKC').normalize('NFC');
  
  // Remove tatweel (Arabic tatweel U+0640)
  normalized = normalized.replace(/\u0640/g, '');
  
  // Remove ZWJ/ZWNJ characters that can cause rendering issues
  normalized = normalized.replace(/[\u200C\u200D]/g, '');
  
  // Remove isolated shadda (when it appears as a separate character)
  // Pattern 1: shadda at start or end of words (with whitespace)
  normalized = normalized.replace(/(^|\s)\u0651(?=\s|$)/g, '$1');
  
  // Pattern 2: shadda not attached to Arabic letters
  normalized = normalized.replace(/(?<![\u0600-\u06FF\u0750-\u077F])\u0651(?![\u0600-\u06FF\u0750-\u077F])/g, '');
  
  // Remove Arabic Presentation Forms that can cause incorrect rendering
  normalized = normalized.replace(/[\uFE70-\uFEFC]/g, (char) => {
    // Convert common presentation forms back to base characters
    const presentationMap: { [key: string]: string } = {
      '\uFE8D': '\u0627', // ALEF
      '\uFE8E': '\u0627', // ALEF
      '\uFEDF': '\u0647', // HEH
      '\uFEE0': '\u0647', // HEH
    };
    return presentationMap[char] || '';
  });
  
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