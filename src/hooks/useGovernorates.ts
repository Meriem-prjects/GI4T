import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Governorate } from "@/types/events";
import { tunisiaGovernorates } from "@/data/tunisiaGovernorates";

export const useGovernorates = () => {
  const { data: governorates, isLoading, error } = useQuery({
    queryKey: ['governorates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('governorates')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      
      // Si la table est vide, retourner les données statiques
      if (!data || data.length === 0) {
        return tunisiaGovernorates;
      }
      
      return data as unknown as Governorate[];
    },
  });

  return {
    governorates: governorates || tunisiaGovernorates,
    isLoading,
    error,
  };
};
