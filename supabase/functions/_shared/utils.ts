// Shared utility functions for edge functions
export const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : String(error);
};

export const ensureString = (value: string | undefined | null, fallback = ''): string => {
  return value ?? fallback;
};

export const fixParentheses = (text: string): string => {
  // Inverse les parenthèses : ( devient ) et ) devient (
  return text.replace(/\(/g, '###TEMP###').replace(/\)/g, '(').replace(/###TEMP###/g, ')');
};