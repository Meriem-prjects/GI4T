import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface FAQItem {
  id: string;
  question: string;
  question_ar: string | null;
  answer: string;
  answer_ar: string | null;
  category: string;
  category_ar: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useFAQItems = (activeOnly = true) => {
  return useQuery({
    queryKey: ['faq-items', activeOnly],
    queryFn: async () => {
      let query = supabase
        .from('faq_items')
        .select('*')
        .order('category')
        .order('display_order');
      
      if (activeOnly) {
        query = query.eq('is_active', true);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as FAQItem[];
    }
  });
};

export const useCreateFAQItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (item: Omit<FAQItem, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('faq_items')
        .insert(item)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faq-items'] });
      toast({
        title: "Question ajoutée",
        description: "La question a été ajoutée avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la question",
        variant: "destructive",
      });
      console.error(error);
    }
  });
};

export const useUpdateFAQItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...item }: Partial<FAQItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('faq_items')
        .update(item)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faq-items'] });
      toast({
        title: "Question modifiée",
        description: "La question a été modifiée avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier la question",
        variant: "destructive",
      });
      console.error(error);
    }
  });
};

export const useDeleteFAQItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('faq_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faq-items'] });
      toast({
        title: "Question supprimée",
        description: "La question a été supprimée avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la question",
        variant: "destructive",
      });
      console.error(error);
    }
  });
};
