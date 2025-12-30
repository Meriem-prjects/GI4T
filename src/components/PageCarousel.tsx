import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

interface PageCarouselProps {
  content: string;
  language: 'fr' | 'ar';
}

const PageCarousel: React.FC<PageCarouselProps> = ({ content, language }) => {
  const isRTL = language === 'ar';
  
  // Parse pages from content with page-break markers
  const individualPages = React.useMemo(() => {
    // Use a more flexible pattern that matches page-break divs regardless of attribute order
    // First, find all opening div tags with class="page-break"
    const pageBreakPattern = /<div[^>]*class="[^"]*page-break[^"]*"[^>]*>/gi;
    const matches = [...content.matchAll(pageBreakPattern)];
    
    console.log('PageCarousel: Found', matches.length, 'page-break divs');
    
    if (matches.length > 0) {
      const pages: Array<{ pageNumber: number; content: string }> = [];
      
      for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        const fullTag = match[0];
        
        // Extract page number from the tag (data-page attribute can be anywhere in the tag)
        const pageNumMatch = fullTag.match(/data-page="(\d+)"/i);
        const pageNumber = pageNumMatch ? parseInt(pageNumMatch[1]) : i + 1;
        
        const startIndex = match.index! + fullTag.length;
        
        // Find end: either next page-break or end of content
        let endIndex: number;
        if (i + 1 < matches.length) {
          endIndex = matches[i + 1].index!;
        } else {
          endIndex = content.length;
        }
        
        // Extract content between this page-break start and next (or end)
        let pageContent = content.slice(startIndex, endIndex);
        
        // Remove the closing div at the end
        pageContent = pageContent.replace(/\s*<\/div>\s*$/, '').trim();
        
        // Remove page-separator div at the beginning
        pageContent = pageContent.replace(/^\s*<div[^>]*class="[^"]*page-separator[^"]*"[^>]*>[\s\S]*?<\/div>\s*/gi, '').trim();
        
        // Debug log
        console.log(`PageCarousel: Page ${pageNumber} - content length: ${pageContent.length}`);
        
        pages.push({ pageNumber, content: pageContent });
      }
      
      return pages;
    }
    
    // Fallback: try splitting by page-separator divs
    const separatorRegex = /<div[^>]*class="[^"]*page-separator[^"]*"[^>]*>/gi;
    const parts = content.split(separatorRegex).filter(p => p.trim());
    
    if (parts.length > 1) {
      return parts.map((part, index) => ({
        pageNumber: index + 1,
        content: part.replace(/<\/div>\s*$/, '').trim()
      }));
    }
    
    // No page breaks found, return full content as single page
    return [{ pageNumber: 1, content }];
  }, [content]);

  // Group pages by 2 for optimized space
  const pages = React.useMemo(() => {
    const grouped: Array<{ pageNumbers: number[]; pages: typeof individualPages }> = [];
    for (let i = 0; i < individualPages.length; i += 2) {
      const pair = individualPages.slice(i, i + 2);
      grouped.push({
        pageNumbers: pair.map(p => p.pageNumber),
        pages: pair
      });
    }
    return grouped;
  }, [individualPages]);

  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: false,
    direction: isRTL ? 'rtl' : 'ltr',
    align: 'center'
  });
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  // If only one slide (1-2 pages), render without carousel
  if (pages.length === 1) {
    return (
      <div className="space-y-6">
        {pages[0].pages.map((page) => (
          <div 
            key={page.pageNumber}
            className={`document-content space-y-4 ${isRTL ? 'text-right' : ''}`}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {pages[0].pages.length > 1 && (
              <div className={`page-number-badge mb-4 pb-3 border-b border-border/50 ${isRTL ? 'text-right' : 'text-left'}`}>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {isRTL ? `صفحة ${page.pageNumber}` : `Page ${page.pageNumber}`}
                </span>
              </div>
            )}
            <div dangerouslySetInnerHTML={{ __html: page.content }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="page-carousel-container">
      {/* Header with navigation */}
      <div className={`page-carousel-header flex items-center justify-between mb-4 p-3 bg-muted/50 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={isRTL ? scrollNext : scrollPrev}
          disabled={isRTL ? !canScrollNext : !canScrollPrev}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="mx-2">{isRTL ? 'التالي' : 'Précédent'}</span>
        </Button>
        
        <span className="text-sm font-medium text-muted-foreground">
          {isRTL 
            ? `${pages[currentIndex]?.pageNumbers.join('-')} من ${individualPages.length} صفحات`
            : `Pages ${pages[currentIndex]?.pageNumbers.join('-')} / ${individualPages.length}`
          }
        </span>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={isRTL ? scrollPrev : scrollNext}
          disabled={isRTL ? !canScrollPrev : !canScrollNext}
        >
          <span className="mx-2">{isRTL ? 'السابق' : 'Suivant'}</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Carousel viewport */}
      <div className="page-carousel-viewport overflow-hidden" ref={emblaRef} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="page-carousel-container flex">
          {pages.map((slideGroup, slideIndex) => (
            <div 
              key={slideIndex} 
              className="page-carousel-slide flex-shrink-0 w-full px-1"
            >
              <div 
                className={`page-frame border border-border rounded-lg p-4 md:p-5 bg-card shadow-sm min-h-[400px] ${isRTL ? 'text-right' : ''}`}
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                {/* Render both pages in this slide */}
                {slideGroup.pages.map((page, pageIdx) => (
                  <div key={page.pageNumber} className={pageIdx > 0 ? 'mt-8 pt-6 border-t-2 border-dashed border-border/50' : ''}>
                    {/* Page number indicator */}
                    <div className={`page-number-badge mb-4 pb-3 border-b border-border/50 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {isRTL ? `صفحة ${page.pageNumber}` : `Page ${page.pageNumber}`}
                      </span>
                    </div>
                    
                    {/* Page content */}
                    <div 
                      className="document-content space-y-4"
                      dangerouslySetInnerHTML={{ __html: page.content }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination dots */}
      <div className="page-carousel-dots flex justify-center gap-2 mt-6">
        {pages.map((_, index) => {
          // En RTL, inverser l'index pour que le point actif commence à droite
          const displayIndex = isRTL ? (pages.length - 1 - index) : index;
          const isActive = displayIndex === currentIndex;
          
          return (
            <button
              key={index}
              onClick={() => scrollTo(displayIndex)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                isActive 
                  ? 'bg-primary scale-125' 
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              aria-label={`Go to page ${displayIndex + 1}`}
            />
          );
        })}
      </div>

      {/* Swipe hint for mobile */}
      <p className="text-center text-xs text-muted-foreground mt-4 md:hidden">
        {isRTL ? '← اسحب للتنقل بين الصفحات →' : '← Faites glisser pour naviguer →'}
      </p>
    </div>
  );
};

// Helper function to check if content has page breaks
export const hasPageBreaks = (content: string): boolean => {
  if (!content) return false;
  return content.includes('class="page-break"') || 
         content.includes("class='page-break'") ||
         content.includes('class="page-separator"') ||
         content.includes("class='page-separator'");
};

export default PageCarousel;
