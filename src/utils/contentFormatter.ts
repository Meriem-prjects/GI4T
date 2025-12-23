// Utility functions for formatting and stripping content
import { normalizeArabicText, isArabicText, fixHehVariants, normalizeArabicForDisplay } from '@/lib/arabicUtils';

/**
 * Converts simple text formatting markers to HTML for display
 * Also fixes Arabic Heh (ه) variants for proper display
 * 
 * IMPORTANT: If content already contains HTML tags, it returns as-is
 * (after Arabic normalization) to avoid double transformation
 */
export const renderFormattedContent = (content: string): string => {
  if (!content) return '';
  
  // First, normalize Arabic text to connect disconnected letters (e.g., "فـقـه" → "فقه")
  let processedContent = normalizeArabicForDisplay(content);
  
  // Then fix Heh variants
  processedContent = fixHehVariants(processedContent);
  
  // Check if content already contains HTML structure tags
  // If so, apply automatic formatting enhancements before returning
  const hasHtmlStructure = /<(?:p|div|h[1-6]|br|strong|em|ul|ol|li|span|table|tr|td|th)[^>]*>/i.test(processedContent);
  
  if (hasHtmlStructure && !processedContent.includes('class="page-break"')) {
    // Content is already HTML formatted, apply automatic styling enhancements
    return applyAutoFormatting(processedContent);
  }
  // Check if content contains page-break divs - use index-based extraction for nested div support
  if (processedContent.includes('class="page-break"') || processedContent.includes("class='page-break'")) {
    const pageBreakPattern = /<div[^>]*class="[^"]*page-break[^"]*"[^>]*>/gi;
    const matches = [...processedContent.matchAll(pageBreakPattern)];
    
    if (matches.length > 0) {
      let result = '';
      
      for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        const openTag = match[0];
        const startIndex = match.index! + openTag.length;
        
        // Find end: either next page-break start or end of content
        let endIndex: number;
        if (i + 1 < matches.length) {
          endIndex = matches[i + 1].index!;
        } else {
          endIndex = processedContent.length;
        }
        
        // Extract content between this page-break and the next
        let innerContent = processedContent.slice(startIndex, endIndex);
        
        // Remove only the closing </div> at the very end (for this page-break container)
        innerContent = innerContent.replace(/\s*<\/div>\s*$/, '');
        
        // Check for page-separator at the beginning
        const separatorMatch = innerContent.match(/^(\s*<div[^>]*class="[^"]*page-separator[^"]*"[^>]*>[\s\S]*?<\/div>)([\s\S]*)$/i);
        
        if (separatorMatch) {
          const separator = separatorMatch[1];
          const pageContent = separatorMatch[2];
          result += `${openTag}${separator}${processTextContent(pageContent)}</div>`;
        } else {
          result += `${openTag}${processTextContent(innerContent)}</div>`;
        }
      }
      
      return result;
    }
  }
  
  return processTextContent(processedContent);
};

/**
 * Apply automatic formatting enhancements to HTML content:
 * - First paragraph becomes a styled title
 * - Keywords line gets bold styling
 * - Legal citations get special formatting
 */
const applyAutoFormatting = (content: string): string => {
  if (!content) return '';
  
  let formattedContent = content;
  let isFirstParagraphStyled = false;
  
  // 1. Style the first paragraph as a title (if it's not already a heading or special line)
  const firstParagraphMatch = formattedContent.match(/^(\s*)(<p[^>]*>)([\s\S]*?)(<\/p>)/i);
  if (firstParagraphMatch) {
    const [fullMatch, whitespace, openTag, innerContent, closeTag] = firstParagraphMatch;
    const trimmedContent = innerContent.trim();
    // Only style as title if it doesn't already have formatting, is substantial, and is not a keyword/reference line
    const isSpecialLine = /^(الكلمات المفاتيح|Mots[- ]?clés|Keywords?|المراجع|Bibliographie|Références|References|الكاتب|المؤلف|Auteur|Author)/i.test(trimmedContent);
    if (!/<(strong|h[1-6]|em)/i.test(innerContent) && trimmedContent.length > 10 && !isSpecialLine) {
      const styledTitle = `${whitespace}<p class="auto-title">${innerContent}</p>`;
      formattedContent = formattedContent.replace(fullMatch, styledTitle);
      isFirstParagraphStyled = true;
    }
  }
  
  // 2. Style keywords line - improved regex for Arabic format "الكلمات المفاتيح : ..."
  formattedContent = formattedContent.replace(
    /<p[^>]*>([\s\S]*?)(الكلمات\s*المفاتيح|Mots[- ]?clés|Keywords?)(\s*:\s*|\s*–\s*|\s*-\s*|\s*)([\s\S]*?)<\/p>/gi,
    (match, before, keyword, separator, keywords) => {
      // If there's content before the keyword, keep original
      if (before.trim().length > 0) return match;
      return `<p class="auto-keywords"><strong>${keyword}${separator}</strong>${keywords}</p>`;
    }
  );
  
  // 3. Style bibliography/references line
  formattedContent = formattedContent.replace(
    /<p[^>]*>([\s\S]*?)(المراجع|Bibliographie|Références|References)(\s*:\s*|\s*–\s*|\s*-\s*|\s*)([\s\S]*?)<\/p>/gi,
    (match, before, label, separator, refContent) => {
      if (before.trim().length > 0) return match;
      return `<p class="auto-bibliography"><strong>${label}${separator}</strong>${refContent}</p>`;
    }
  );
  
  // 4. Style author line (Arabic: الكاتب/المؤلف, French: Auteur)
  formattedContent = formattedContent.replace(
    /<p[^>]*>([\s\S]*?)(الكاتب|المؤلف|Auteur|Author)(\s*:\s*|\s*–\s*|\s*-\s*|\s*)([\s\S]*?)<\/p>/gi,
    (match, before, label, separator, authorName) => {
      if (before.trim().length > 0) return match;
      return `<p class="auto-author"><strong>${label}${separator}</strong><em>${authorName}</em></p>`;
    }
  );
  
  return formattedContent;
};

// Helper function to process text content with markdown-like formatting
const processTextContent = (content: string): string => {
  if (!content) return '';
  
  // Split content into lines to process line-by-line
  const lines = content.split('\n');
  
  const processedLines = lines.map(line => {
    // Skip HTML tags (divs, etc.)
    if (line.trim().startsWith('<div') || line.trim().startsWith('</div')) {
      return line;
    }
    
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
    
    // Bold: **text**
    processedLine = processedLine.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    // Italic: *text*
    const parts = processedLine.split(/(<strong>.*?<\/strong>)/);
    processedLine = parts.map(part => {
      if (part.startsWith('<strong>')) {
        return part;
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
  // Only normalize line breaks - content is already normalized by the editor
  return content.replace(/\r\n/g, '\n');
};