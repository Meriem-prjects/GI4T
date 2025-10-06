import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface KeywordFrequency {
  keyword: string;
  count: number;
}

export const useDocumentKeywords = (language: 'fr' | 'ar' = 'fr') => {
  return useQuery({
    queryKey: ['document-keywords', language],
    queryFn: async () => {
      const keywordField = language === 'ar' ? 'keywords_ar' : 'keywords';
      
      const { data, error } = await supabase
        .from('documents')
        .select(keywordField)
        .eq('published', true)
        .not(keywordField, 'is', null);

      if (error) throw error;

      // Flatten all keywords arrays and count frequency
      const keywordMap = new Map<string, number>();
      
      data?.forEach((doc: any) => {
        const keywords = doc[keywordField] || [];
        keywords.forEach((keyword: string) => {
          if (keyword && keyword.trim()) {
            const normalized = keyword.trim();
            keywordMap.set(normalized, (keywordMap.get(normalized) || 0) + 1);
          }
        });
      });

      // Convert to array and sort by frequency
      const sortedKeywords: KeywordFrequency[] = Array.from(keywordMap.entries())
        .map(([keyword, count]) => ({ keyword, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 50); // Top 50 most frequent keywords

      return sortedKeywords;
    },
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
  });
};
