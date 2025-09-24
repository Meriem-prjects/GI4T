import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CourtType {
  id: string;
  name: string;
  name_ar?: string;
  description?: string;
  description_ar?: string;
  type: 'civil' | 'administratif';
  created_at: string;
  updated_at: string;
}

export const useCourtTypes = () => {
  return useQuery({
    queryKey: ['court-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('court_types')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as CourtType[];
    }
  });
};

export const useCreateCourtType = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (courtType: Omit<CourtType, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('court_types')
        .insert([courtType])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['court-types'] });
      toast({
        title: "Succès",
        description: "Type de tribunal créé avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Erreur lors de la création du type de tribunal.",
        variant: "destructive",
      });
    }
  });
};

export const useUpdateCourtType = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CourtType> & { id: string }) => {
      const { data, error } = await supabase
        .from('court_types')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['court-types'] });
      toast({
        title: "Succès",
        description: "Type de tribunal modifié avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Erreur lors de la modification du type de tribunal.",
        variant: "destructive",
      });
    }
  });
};

export const useDeleteCourtType = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('court_types')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['court-types'] });
      toast({
        title: "Succès",
        description: "Type de tribunal supprimé avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression du type de tribunal.",
        variant: "destructive",
      });
    }
  });
};