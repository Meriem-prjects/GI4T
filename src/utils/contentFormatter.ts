// Utility functions for formatting and stripping content
import { normalizeArabicText, isArabicText, fixHehVariants, normalizeArabicForDisplay } from '@/lib/arabicUtils';
import { marked } from 'marked';

// Configured for the new Markdown storage format:
//   - GFM (lists, autolinks, tables)
//   - Soft line breaks become <br> so the formatting users see in the
//     WYSIWYG editor survives the round-trip.
marked.setOptions({ gfm: true, breaks: true });

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
  // If so, return it as-is to avoid double transformation
  const hasHtmlStructure = /<(?:p|div|h[1-6]|br|strong|em|ul|ol|li|span|table|tr|td|th)[^>]*>/i.test(processedContent);

  if (hasHtmlStructure && !processedContent.includes('class="page-break"')) {
    // Content is already HTML formatted, just return after Arabic normalization
    return processedContent;
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

        // Check if inner content already has HTML structure. If so, don't re-process it
        // which would wrap it in extra <p> tags and break the existing structure.
        const innerHasHtml = /<(?:p|div|h[1-6]|br|strong|em|ul|ol|li|span|table|tr|td|th)[^>]*>/i.test(innerContent);

        // Check for page-separator at the beginning
        const separatorMatch = innerContent.match(/^(\s*<div[^>]*class="[^"]*page-separator[^"]*"[^>]*>[\s\S]*?<\/div>)([\s\S]*)$/i);

        if (separatorMatch) {
          const separator = separatorMatch[1];
          const pageContent = separatorMatch[2];
          const processedPageContent = innerHasHtml ? pageContent : processTextContent(pageContent);
          result += `${openTag}${separator}${processedPageContent}</div>`;
        } else {
          result += `${openTag}${innerHasHtml ? innerContent : processTextContent(innerContent)}</div>`;
        }
      }

      return result;
    }
  }

  // If the whole content has HTML structure, don't re-process it either
  if (hasHtmlStructure) {
    return processedContent;
  }

  // Markdown path — current storage format. Pre-split unusually long
  // single-line OCR blobs into paragraphs first (marked respects the
  // newlines we insert), then render via marked.
  let mdSource = processedContent;
  if (!/\n/.test(mdSource.trim()) && mdSource.trim().length > 400) {
    const paragraphs = smartSplitIntoParagraphs(mdSource);
    mdSource = paragraphs.join("\n\n");
  }
  return marked.parse(mdSource) as string;
};

/**
 * Split a long OCR-extracted block (single line, no paragraphs) into
 * readable paragraphs using sentence boundaries and section markers.
 *
 * Heuristics (applied in order):
 *  1. Break before roman/arabic section numbers at a word boundary:
 *     " 1. ", " 2. ", " I. ", " II. ", " A. ", " B. ", " الأول ", " ثانيا "
 *  2. Break before hard keywords: Introduction, Conclusion, Section, Chapitre, etc.
 *  3. Group sentences into chunks of ~4 sentences for prose flow.
 */
const smartSplitIntoParagraphs = (text: string): string[] => {
  const trimmed = text.trim();
  if (!trimmed) return [];

  // Already has paragraph breaks? leave it alone.
  if (/\n\s*\n/.test(trimmed) || /\n/.test(trimmed)) {
    return trimmed.split(/\n+/).map((s) => s.trim()).filter(Boolean);
  }

  // Short enough to fit comfortably in one paragraph
  if (trimmed.length < 400) return [trimmed];

  // Step 1: Insert paragraph breaks BEFORE section markers and hard keywords
  let marked = trimmed;

  // French structural keywords
  const frKeywords = [
    "Introduction",
    "Conclusion",
    "Section \\d",
    "Chapitre \\d",
    "Partie \\d",
    "Titre \\d",
  ];
  for (const kw of frKeywords) {
    marked = marked.replace(new RegExp(`(?<=\\. |\\? |\\! |» |: )(${kw})\\b`, "g"), "\n\n$1");
  }

  // Section numbers: " 1. " or " A. " or " I. " etc. (word boundary + number + dot + space)
  marked = marked.replace(
    /(?<=[a-zA-Zà-ÿ؀-ۿ\.\)»:]\s)(\d{1,2}\.\s+[A-ZÀ-Ÿ؀-ۿ])/g,
    "\n\n$1",
  );
  marked = marked.replace(
    /(?<=[a-zA-Zà-ÿ؀-ۿ\.\)»:]\s)([IVX]{1,4}\.\s+[A-ZÀ-Ÿ؀-ۿ])/g,
    "\n\n$1",
  );

  // Split on explicit double newlines
  const rough = marked.split(/\n\n+/).map((s) => s.trim()).filter(Boolean);

  // Step 2: For each chunk still too long, split by sentence groups.
  const paragraphs: string[] = [];
  const sentenceGroupSize = 4;
  for (const chunk of rough) {
    if (chunk.length < 600) {
      paragraphs.push(chunk);
      continue;
    }
    // Match sentences ending with punctuation + optional quote/paren + space + next capital.
    // Support Arabic punctuation (؟ ؛ .) as well.
    const sentences = chunk.match(/[^.!?؟]+[.!?؟]+["»')\]]*\s?/g) ?? [chunk];
    for (let i = 0; i < sentences.length; i += sentenceGroupSize) {
      paragraphs.push(
        sentences
          .slice(i, i + sentenceGroupSize)
          .join("")
          .trim(),
      );
    }
  }
  return paragraphs.filter(Boolean);
};

// Helper function to process text content with markdown-like formatting
const processTextContent = (content: string): string => {
  if (!content) return '';

  // If the whole block has no line breaks, try to split it intelligently.
  const normalized = content.replace(/\r\n/g, "\n");
  const hasAnyBreak = /\n/.test(normalized);

  if (!hasAnyBreak && normalized.trim().length > 400) {
    const paragraphs = smartSplitIntoParagraphs(normalized);
    return paragraphs.map((p) => `<p>${p}</p>`).join("\n");
  }

  // Split content into lines to process line-by-line
  const lines = normalized.split('\n');

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