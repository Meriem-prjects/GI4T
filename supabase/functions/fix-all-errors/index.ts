// This file contains rapid fixes for all remaining TypeScript errors
import { getErrorMessage } from "../_shared/utils.ts";

// For pdf-ocr-batch - ensure jobId is always string
export function ensureJobId(jobId: string | undefined | null): string {
  return jobId || crypto.randomUUID();
}

// For pdf-parser and others - safe error handling
export function safeErrorHandler(error: unknown): string {
  return getErrorMessage(error);
}

// Type-safe document access
export function safeDocumentAccess(document: any): string {
  return document?.content || '';
}