import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

export interface DocumentType {
  id: string;
  name: string;
  name_ar?: string | null;
  description?: string | null;
  description_ar?: string | null;
  created_at: string;
}

export const useDocumentTypes = () => {
  return useQuery({
    queryKey: ["document-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("document_types")
        .select("*")
        .order("name");

      if (error) {
        throw new Error(error.message);
      }

      return data as DocumentType[];
    },
  });
};

export const useCreateDocumentType = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (documentType: Omit<DocumentType, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("document_types")
        .insert(documentType)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document-types"] });
      toast({
        title: "Succès",
        description: "Type de fiche créé avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la création: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateDocumentType = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DocumentType> & { id: string }) => {
      const { data, error } = await supabase
        .from("document_types")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document-types"] });
      toast({
        title: "Succès",
        description: "Type de fiche modifié avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la modification: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteDocumentType = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("document_types")
        .delete()
        .eq("id", id);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document-types"] });
      toast({
        title: "Succès",
        description: "Type de fiche supprimé avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la suppression: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};