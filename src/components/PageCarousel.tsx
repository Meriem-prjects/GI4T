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
  const pages = React.useMemo(() => {
    // Try to split by page-break divs
    const pageBreakRegex = /<div[^>]*class="[^"]*page-break[^"]*"[^>]*data-page="(\d+)"[^>]*>([\s\S]*?)<\/div>(?=<div[^>]*class="[^"]*page-break|$)/gi;
    const matches = [...content.matchAll(pageBreakRegex)];
    
    if (matches.length > 0) {
      return matches.map((match, index) => ({
        pageNumber: parseInt(match[1]) || index + 1,
        content: match[2].replace(/<div[^>]*class="[^"]*page-separator[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '').trim()
      }));
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

  // If only one page, render without carousel
  if (pages.length === 1) {
    return (
      <div 
        className={`document-content space-y-6 ${isRTL ? 'text-right' : ''}`}
        dir={isRTL ? 'rtl' : 'ltr'}
        dangerouslySetInnerHTML={{ __html: pages[0].content }}
      />
    );
  }

  return (
    <div className="page-carousel-container">
      {/* Header with navigation */}
      <div className={`page-carousel-header flex items-center justify-between mb-4 p-3 bg-muted/50 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={scrollPrev}
          disabled={!canScrollPrev}
          className={isRTL ? 'flex-row-reverse' : ''}
        >
          {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          <span className="mx-2">{isRTL ? 'السابق' : 'Précédent'}</span>
        </Button>
        
        <span className="text-sm font-medium text-muted-foreground">
          {isRTL 
            ? `صفحة ${currentIndex + 1} من ${pages.length}`
            : `Page ${currentIndex + 1} / ${pages.length}`
          }
        </span>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={scrollNext}
          disabled={!canScrollNext}
          className={isRTL ? 'flex-row-reverse' : ''}
        >
          <span className="mx-2">{isRTL ? 'التالي' : 'Suivant'}</span>
          {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>

      {/* Carousel viewport */}
      <div className="page-carousel-viewport overflow-hidden" ref={emblaRef}>
        <div className={`page-carousel-container flex ${isRTL ? 'flex-row-reverse' : ''}`}>
          {pages.map((page, index) => (
            <div 
              key={page.pageNumber} 
              className="page-carousel-slide flex-shrink-0 w-full px-2"
            >
              <div 
                className={`page-frame border-2 border-border rounded-lg p-6 md:p-8 bg-card shadow-sm min-h-[400px] ${isRTL ? 'text-right' : ''}`}
                dir={isRTL ? 'rtl' : 'ltr'}
              >
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
            </div>
          ))}
        </div>
      </div>

      {/* Pagination dots */}
      <div className={`page-carousel-dots flex justify-center gap-2 mt-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
        {pages.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
              index === currentIndex 
                ? 'bg-primary scale-125' 
                : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
            }`}
            aria-label={`Go to page ${index + 1}`}
          />
        ))}
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
