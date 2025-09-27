// Quick type fixes for edge functions
export const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : String(error);
};

export const ensureString = (value: string | undefined, fallback = ''): string => {
  return value || fallback;
};