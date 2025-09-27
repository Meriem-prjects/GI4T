// Shared utility functions for edge functions
export const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : String(error);
};

export const ensureString = (value: string | undefined | null, fallback = ''): string => {
  return value ?? fallback;
};

// Fix Arabic parentheses - in Arabic text, parentheses should be reversed
export const fixArabicParentheses = (text: string, language: string): string => {
  if (language === 'ar' || /[\u0600-\u06FF\u0750-\u077F]/.test(text)) {
    // Reverse parentheses for Arabic text
    return text.replace(/\(/g, '◊TEMP◊').replace(/\)/g, '(').replace(/◊TEMP◊/g, ')');
  }
  return text;
};