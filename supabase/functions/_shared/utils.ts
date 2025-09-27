// Shared utility functions for edge functions
export const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : String(error);
};

export const ensureString = (value: string | undefined | null, fallback = ''): string => {
  return value ?? fallback;
};

export const fixParentheses = (text: string): string => {
  // Utilise une regex pour inverser toutes les parenthèses
  return text.replace(/[()]/g, (match) => {
    return match === '(' ? ')' : '(';
  });
};