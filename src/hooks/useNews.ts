import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface News {
  id: string;
  title: string;
  title_ar: string | null;
  excerpt: string;
  excerpt_ar: string | null;
  content: string | null;
  content_ar: string | null;
  category: string;
  tags: string[] | null;
  tags_ar: string[] | null;
  image_url: string | null;
  read_time: number | null;
  is_featured: boolean | null;
  is_published: boolean | null;
  published_at: string | null;
}

export const usePublishedNews = (category?: string) => {
  return useQuery({
    queryKey: ['news', 'published', category],
    queryFn: async () => {
      let query = supabase
        .from('news')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });
      
      if (category && category !== 'all') {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as News[];
    }
  });
};

export const useNewsCategoryCounts = () => {
  return useQuery({
    queryKey: ['news', 'category-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news')
        .select('category')
        .eq('is_published', true);
      
      if (error) throw error;
      
      const counts: Record<string, number> = { all: 0 };
      data?.forEach(item => {
        counts.all++;
        counts[item.category] = (counts[item.category] || 0) + 1;
      });
      
      return counts;
    }
  });
};

export const useFeaturedNews = () => {
  return useQuery({
    queryKey: ['news', 'featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('is_published', true)
        .eq('is_featured', true)
        .order('published_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data as News | null;
    }
  });
};

export const useNewsById = (id: string | undefined) => {
  return useQuery({
    queryKey: ['news', 'detail', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('id', id)
        .eq('is_published', true)
        .single();
      
      if (error) throw error;
      return data as News;
    },
    enabled: !!id
  });
};
