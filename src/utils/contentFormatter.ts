// Utility functions for formatting and stripping content
import { sanitizeArabicInput, normalizeArabicText, isArabicText } from '@/lib/arabicUtils';

/**
 * Converts simple text formatting markers to HTML for display
 */
export const renderFormattedContent = (content: string): string => {
  if (!content) return '';
  
  // Sanitize Arabic content for consistent rendering
  const sanitizedContent = sanitizeArabicInput(content);
  
  // Split content into lines to process line-by-line
  const lines = sanitizedContent.split('\n');
  
  const processedLines = lines.map(line => {
    // Process headings (must be at start of line)
    if (line.match(/^###\s+(.+)/)) {
      return line.replace(/^###\s+(.+)/, '<h3>$1</h3>');
    }
    if (line.match(/^##\s+(.+)/)) {
      return line.replace(/^##\s+(.+)/, '<h2>$1</h2>');
    }
    if (line.match(/^#\s+(.+)/)) {
      return line.replace(/^#\s+(.+)/, '<h1>$1</h1>');
    }
    
    // Process inline formatting (bold and italic)
    let processedLine = line;
    
    // Bold: **text** - simple approach, process bold first
    processedLine = processedLine.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    // Italic: *text* - simple approach, but avoid already processed bold text
    // Split by <strong> tags to avoid processing inside them
    const parts = processedLine.split(/(<strong>.*?<\/strong>)/);
    processedLine = parts.map(part => {
      if (part.startsWith('<strong>')) {
        return part; // Don't process inside strong tags
      }
      return part.replace(/\*(.+?)\*/g, '<em>$1</em>');
    }).join('');
    
    // If line becomes a heading, don't wrap in paragraph
    if (processedLine.startsWith('<h1>') || processedLine.startsWith('<h2>') || processedLine.startsWith('<h3>')) {
      return processedLine;
    }
    
    // Wrap non-empty lines in paragraphs, preserve empty lines as breaks
    if (processedLine.trim() === '') {
      return '<br>';
    }
    
    return `<p>${processedLine}</p>`;
  });
  
  return processedLines.join('\n');
};

/**
 * Strips HTML tags and converts back to simple text format (reverse of renderFormattedContent)
 */
export const stripFormattedContent = (htmlContent: string): string => {
  if (!htmlContent) return '';
  
  let content = htmlContent;
  
  // Convert headings back to markers
  content = content.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1');
  content = content.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1');
  content = content.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1');
  
  // Convert formatting back to markers
  content = content.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  content = content.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  
  // Convert paragraphs and breaks back to line breaks
  content = content.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n');
  content = content.replace(/<br\s*\/?>/gi, '\n');
  
  // Clean up extra whitespace but preserve intentional line breaks
  content = content.replace(/\n{3,}/g, '\n\n');
  
  return content.trim();
};

/**
 * Simple content formatter that only normalizes line breaks (for backward compatibility)
 */
export const formatContent = (content: string): string => {
  // Normalize Arabic text and line breaks
  const normalized = normalizeArabicText(content);
  return normalized.replace(/\r\n/g, '\n');
};