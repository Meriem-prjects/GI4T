import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface JurisdictionLevel {
  id: string;
  name: string;
  name_ar?: string;
  description?: string;
  description_ar?: string;
  level_order: number;
  created_at: string;
  updated_at: string;
}

export const useJurisdictionLevels = () => {
  return useQuery({
    queryKey: ['jurisdiction-levels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jurisdiction_levels')
        .select('*')
        .order('level_order');
      
      if (error) throw error;
      return data as JurisdictionLevel[];
    }
  });
};

export const useCreateJurisdictionLevel = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (jurisdictionLevel: Omit<JurisdictionLevel, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('jurisdiction_levels')
        .insert([jurisdictionLevel])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jurisdiction-levels'] });
      toast({
        title: "Succès",
        description: "Niveau de juridiction créé avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Erreur lors de la création du niveau de juridiction.",
        variant: "destructive",
      });
    }
  });
};

export const useUpdateJurisdictionLevel = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<JurisdictionLevel> & { id: string }) => {
      const { data, error } = await supabase
        .from('jurisdiction_levels')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jurisdiction-levels'] });
      toast({
        title: "Succès",
        description: "Niveau de juridiction modifié avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Erreur lors de la modification du niveau de juridiction.",
        variant: "destructive",
      });
    }
  });
};

export const useDeleteJurisdictionLevel = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('jurisdiction_levels')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jurisdiction-levels'] });
      toast({
        title: "Succès",
        description: "Niveau de juridiction supprimé avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression du niveau de juridiction.",
        variant: "destructive",
      });
    }
  });
};