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

  // Fetch year range (min and max years)
  const yearRangeQuery = useQuery({
    queryKey: ["year-range"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("year")
        .not("year", "is", null)
        .order("year", { ascending: true })
        .limit(1);

      const { data: maxData, error: maxError } = await supabase
        .from("documents")
        .select("year")
        .not("year", "is", null)
        .order("year", { ascending: false })
        .limit(1);

      if (error || maxError) throw error || maxError;
      
      const minYear = data?.[0]?.year || new Date().getFullYear() - 50;
      const maxYear = maxData?.[0]?.year || new Date().getFullYear();

      return { minYear, maxYear };
    },
  });

  return {
    categories: categoriesQuery.data || [],
    courtTypes: courtTypesQuery.data || [],
    jurisdictionLevels: jurisdictionLevelsQuery.data || [],
    documentTypes: documentTypesQuery.data || [],
    yearRange: yearRangeQuery.data || { minYear: new Date().getFullYear() - 50, maxYear: new Date().getFullYear() },
    isLoading:
      categoriesQuery.isLoading ||
      courtTypesQuery.isLoading ||
      jurisdictionLevelsQuery.isLoading ||
      documentTypesQuery.isLoading ||
      yearRangeQuery.isLoading,
    isError:
      categoriesQuery.isError ||
      courtTypesQuery.isError ||
      jurisdictionLevelsQuery.isError ||
      documentTypesQuery.isError ||
      yearRangeQuery.isError,
  };
};
