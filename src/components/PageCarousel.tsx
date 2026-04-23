import React from 'react';

interface PageCarouselProps {
  content: string;
  language: 'fr' | 'ar';
}

/**
 * Renders a multi-page document content as one continuous scrollable
 * column. No pagination, no carousel, no dots, no page labels — pages
 * are simply separated by extra vertical spacing.
 */
const PageCarousel: React.FC<PageCarouselProps> = ({ content, language }) => {
  const isRTL = language === 'ar';

  // Parse pages from the content (split on page-break divs).
  // Strip all "PAGE N" separator labels anywhere in the content.
  const stripPageSeparators = (html: string): string =>
    html.replace(
      /<div[^>]*class="[^"]*page-separator[^"]*"[^>]*>[\s\S]*?<\/div>/gi,
      '',
    );

  const pages = React.useMemo(() => {
    const pageBreakPattern = /<div[^>]*class="[^"]*page-break[^"]*"[^>]*>/gi;
    const matches = [...content.matchAll(pageBreakPattern)];

    if (matches.length === 0) {
      // No page-break markers: return the whole content as one page,
      // with any orphan page-separator labels removed.
      return [stripPageSeparators(content)];
    }

    const result: string[] = [];
    for (let i = 0; i < matches.length; i++) {
      const start = matches[i].index! + matches[i][0].length;
      const end = i + 1 < matches.length ? matches[i + 1].index! : content.length;
      let pageContent = content.slice(start, end);
      pageContent = pageContent.replace(/\s*<\/div>\s*$/, '').trim();
      pageContent = stripPageSeparators(pageContent).trim();
      if (pageContent) result.push(pageContent);
    }
    return result;
  }, [content]);

  return (
    <div
      className={`document-content space-y-10 w-full ${isRTL ? 'text-right' : ''}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {pages.map((html, idx) => (
        <div
          key={idx}
          className={idx > 0 ? 'pt-10 border-t border-dashed border-border/40' : ''}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ))}
    </div>
  );
};

// Helper function to check if content has page breaks
export const hasPageBreaks = (content: string): boolean => {
  if (!content) return false;
  return (
    content.includes('class="page-break"') ||
    content.includes("class='page-break'") ||
    content.includes('class="page-separator"') ||
    content.includes("class='page-separator'")
  );
};

export default PageCarousel;
