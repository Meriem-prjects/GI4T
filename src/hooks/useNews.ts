import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { News, NewsFormData, NewsFilters } from "@/types/news";

export const useNews = (filters?: NewsFilters) => {
  const { data: news, isLoading, error } = useQuery({
    queryKey: ['news', filters],
    queryFn: async () => {
      let query = supabase
        .from('news')
        .select('*')
        .order('published_at', { ascending: false });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.is_published !== undefined) {
        query = query.eq('is_published', filters.is_published);
      }

      if (filters?.is_featured !== undefined) {
        query = query.eq('is_featured', filters.is_featured);
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,title_ar.ilike.%${filters.search}%,excerpt.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as News[];
    }
  });

  return { news: news || [], isLoading, error };
};

export const useNewsAdmin = (filters?: NewsFilters) => {
  const { data: news, isLoading, error } = useQuery({
    queryKey: ['news-admin', filters],
    queryFn: async () => {
      let query = supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.is_published !== undefined) {
        query = query.eq('is_published', filters.is_published);
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,title_ar.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as News[];
    }
  });

  return { news: news || [], isLoading, error };
};

export const useNewsMutations = () => {
  const queryClient = useQueryClient();

  const createNews = useMutation({
    mutationFn: async (data: NewsFormData) => {
      const { data: result, error } = await supabase
        .from('news')
        .insert({
          title: data.title,
          title_ar: data.title_ar || null,
          excerpt: data.excerpt,
          excerpt_ar: data.excerpt_ar || null,
          content: data.content || null,
          content_ar: data.content_ar || null,
          category: data.category,
          tags: data.tags || [],
          tags_ar: data.tags_ar || [],
          image_url: data.image_url || null,
          read_time: data.read_time || 5,
          is_featured: data.is_featured || false,
          is_published: data.is_published ?? true,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      queryClient.invalidateQueries({ queryKey: ['news-admin'] });
      toast.success("Actualité créée avec succès");
    },
    onError: (error) => {
      console.error('Error creating news:', error);
      toast.error("Erreur lors de la création de l'actualité");
    }
  });

  const updateNews = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<NewsFormData> }) => {
      const { data: result, error } = await supabase
        .from('news')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      queryClient.invalidateQueries({ queryKey: ['news-admin'] });
      toast.success("Actualité mise à jour avec succès");
    },
    onError: (error) => {
      console.error('Error updating news:', error);
      toast.error("Erreur lors de la mise à jour de l'actualité");
    }
  });

  const deleteNews = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      queryClient.invalidateQueries({ queryKey: ['news-admin'] });
      toast.success("Actualité supprimée avec succès");
    },
    onError: (error) => {
      console.error('Error deleting news:', error);
      toast.error("Erreur lors de la suppression de l'actualité");
    }
  });

  return { createNews, updateNews, deleteNews };
};

export const useNewsCategoryCounts = () => {
  const { data: counts, isLoading } = useQuery({
    queryKey: ['news-category-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news')
        .select('category')
        .eq('is_published', true);

      if (error) throw error;

      const categoryCounts: Record<string, number> = {};
      data.forEach(item => {
        categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
      });

      return categoryCounts;
    }
  });

  return { counts: counts || {}, isLoading };
};
