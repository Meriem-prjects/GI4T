import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface UsefulAddress {
  id: string;
  name: string;
  name_ar: string;
  address: string;
  address_ar: string;
  phone: string;
  category: string;
  category_ar: string;
  governorate_id?: string;
  latitude?: number;
  longitude?: number;
  email?: string;
  hours?: string;
  hours_ar?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  governorates?: {
    id: string;
    name: string;
    name_ar: string;
  };
}

export const useUsefulAddresses = (isPublic = false) => {
  const queryClient = useQueryClient();

  const { data: addresses, isLoading, error } = useQuery({
    queryKey: ['useful-addresses', isPublic],
    queryFn: async () => {
      let query = supabase
        .from('useful_addresses')
        .select('*, governorates(id, name, name_ar)')
        .order('name', { ascending: true });

      if (isPublic) {
        query = query.eq('is_published', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as UsefulAddress[];
    },
  });

  const createAddress = useMutation({
    mutationFn: async (newAddress: Omit<UsefulAddress, 'id' | 'created_at' | 'updated_at' | 'governorates'>) => {
      const { data, error } = await supabase
        .from('useful_addresses')
        .insert(newAddress)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['useful-addresses'] });
      toast({
        title: "Adresse créée",
        description: "L'adresse a été ajoutée avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateAddress = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<UsefulAddress> & { id: string }) => {
      const { data, error } = await supabase
        .from('useful_addresses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['useful-addresses'] });
      toast({
        title: "Adresse modifiée",
        description: "L'adresse a été mise à jour avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteAddress = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('useful_addresses')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['useful-addresses'] });
      toast({
        title: "Adresse supprimée",
        description: "L'adresse a été supprimée avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const togglePublish = useMutation({
    mutationFn: async ({ id, is_published }: { id: string; is_published: boolean }) => {
      const { data, error } = await supabase
        .from('useful_addresses')
        .update({ is_published })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['useful-addresses'] });
      toast({
        title: "Statut modifié",
        description: "Le statut de publication a été mis à jour.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    addresses: addresses || [],
    isLoading,
    error,
    createAddress,
    updateAddress,
    deleteAddress,
    togglePublish,
  };
};
