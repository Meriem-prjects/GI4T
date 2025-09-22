/**
 * Utility functions for URL slug generation and resolution
 */

/**
 * Creates a URL-friendly slug from a text string
 */
export const createSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Creates category slug from category name
 */
export const createCategorySlug = (categoryName: string): string => {
  return createSlug(categoryName);
};

/**
 * Creates document slug from document title
 */
export const createDocumentSlug = (documentTitle: string): string => {
  return createSlug(documentTitle);
};

/**
 * Creates full document URL path
 */
export const createDocumentPath = (categoryName: string, documentTitle: string): string => {
  const categorySlug = createCategorySlug(categoryName);
  const documentSlug = createDocumentSlug(documentTitle);
  return `/observatoire/droits-fondamentaux/${categorySlug}/${documentSlug}`;
};

/**
 * Creates category URL path
 */
export const createCategoryPath = (categoryName: string): string => {
  const categorySlug = createCategorySlug(categoryName);
  return `/observatoire/droits-fondamentaux/${categorySlug}`;
};