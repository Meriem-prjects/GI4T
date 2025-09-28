import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface DocumentCategory {
  id: string;
  document_id: string;
  category_id: string;
  created_at: string;
}

export const useDocumentCategories = (documentId?: string) => {
  return useQuery({
    queryKey: ["document-categories", documentId],
    queryFn: async () => {
      if (!documentId) return [];
      
      const { data, error } = await supabase
        .from("document_categories")
        .select("*")
        .eq("document_id", documentId);

      if (error) throw error;
      return data as DocumentCategory[];
    },
    enabled: !!documentId,
  });
};

export const useUpdateDocumentCategories = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ documentId, categoryIds }: { documentId: string; categoryIds: string[] }) => {
      // First, delete existing relations
      const { error: deleteError } = await supabase
        .from("document_categories")
        .delete()
        .eq("document_id", documentId);

      if (deleteError) throw deleteError;

      // Then, insert new relations
      if (categoryIds.length > 0) {
        const inserts = categoryIds.map(categoryId => ({
          document_id: documentId,
          category_id: categoryId
        }));

        const { data, error: insertError } = await supabase
          .from("document_categories")
          .insert(inserts)
          .select();

        if (insertError) throw insertError;
        return data;
      }
      
      return [];
    },
    onSuccess: (_, { documentId }) => {
      queryClient.invalidateQueries({ queryKey: ["document-categories", documentId] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (error) => {
      console.error('Error updating document categories:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les catégories du document.",
        variant: "destructive",
      });
    },
  });
};