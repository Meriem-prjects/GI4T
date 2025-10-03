import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSearchFilters = () => {
  // Fetch categories (legal domains)
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch court types
  const courtTypesQuery = useQuery({
    queryKey: ["court-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("court_types")
        .select("*")
        .order("name");

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch jurisdiction levels
  const jurisdictionLevelsQuery = useQuery({
    queryKey: ["jurisdiction-levels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jurisdiction_levels")
        .select("*")
        .order("level_order");

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch document types
  const documentTypesQuery = useQuery({
    queryKey: ["document-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("document_types")
        .select("*")
        .order("name");

      if (error) throw error;
      return data || [];
    },
  });

  return {
    categories: categoriesQuery.data || [],
    courtTypes: courtTypesQuery.data || [],
    jurisdictionLevels: jurisdictionLevelsQuery.data || [],
    documentTypes: documentTypesQuery.data || [],
    isLoading:
      categoriesQuery.isLoading ||
      courtTypesQuery.isLoading ||
      jurisdictionLevelsQuery.isLoading ||
      documentTypesQuery.isLoading,
    isError:
      categoriesQuery.isError ||
      courtTypesQuery.isError ||
      jurisdictionLevelsQuery.isError ||
      documentTypesQuery.isError,
  };
};
