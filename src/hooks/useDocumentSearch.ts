import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DocumentSearchFilters {
  query?: string;
  courtType?: string;
  dateFrom?: string;
  dateTo?: string;
  categories?: string[];
  jurisdictionLevel?: string;
  documentType?: string;
  sortBy?: "recent" | "relevance";
  page?: number;
  pageSize?: number;
}

export interface DocumentSearchResult {
  id: string;
  title: string;
  title_ar?: string;
  case_number?: string;
  court?: string;
  court_ar?: string;
  year?: number;
  summary?: string;
  summary_ar?: string;
  keywords?: string[];
  keywords_ar?: string[];
  status: string;
  created_at: string;
  categories: Array<{
    id: string;
    name: string;
    name_ar?: string;
    color?: string;
  }>;
  document_type?: string;
  court_level?: string;
  court_category?: string;
}

export const useDocumentSearch = (filters: DocumentSearchFilters) => {
  return useQuery({
    queryKey: ["document-search", filters],
    queryFn: async () => {
      const {
        query,
        courtType,
        dateFrom,
        dateTo,
        categories,
        jurisdictionLevel,
        documentType,
        sortBy = "recent",
        page = 1,
        pageSize = 10,
      } = filters;

      // Start building the query - only published documents
      let queryBuilder = supabase
        .from("documents")
        .select(
          `
          id,
          title,
          title_ar,
          case_number,
          court,
          court_ar,
          year,
          summary,
          summary_ar,
          keywords,
          keywords_ar,
          status,
          created_at,
          document_type,
          court_level,
          court_category,
          document_categories (
            category_id,
            categories (
              id,
              name,
              name_ar,
              color
            )
          )
        `,
          { count: "exact" }
        )
        .eq("status", "processed"); // Only show published documents

      // Text search - search in title, summary, keywords
      if (query && query.trim()) {
        queryBuilder = queryBuilder.or(
          `title.ilike.%${query}%,summary.ilike.%${query}%,title_ar.ilike.%${query}%,summary_ar.ilike.%${query}%,keywords.cs.{${query}},keywords_ar.cs.{${query}}`
        );
      }

      // Court type filter
      if (courtType && courtType !== "all") {
        queryBuilder = queryBuilder.or(
          `court.ilike.%${courtType}%,court_category.ilike.%${courtType}%`
        );
      }

      // Date range filters
      if (dateFrom) {
        const yearFrom = new Date(dateFrom).getFullYear();
        queryBuilder = queryBuilder.gte("year", yearFrom);
      }
      if (dateTo) {
        const yearTo = new Date(dateTo).getFullYear();
        queryBuilder = queryBuilder.lte("year", yearTo);
      }

      // Jurisdiction level filter
      if (jurisdictionLevel && jurisdictionLevel !== "all") {
        queryBuilder = queryBuilder.ilike("court_level", `%${jurisdictionLevel}%`);
      }

      // Document type filter
      if (documentType && documentType !== "all") {
        queryBuilder = queryBuilder.eq("document_type_id", documentType);
      }

      // Sorting
      if (sortBy === "recent") {
        queryBuilder = queryBuilder.order("year", { ascending: false });
        queryBuilder = queryBuilder.order("created_at", { ascending: false });
      } else if (sortBy === "relevance" && query) {
        // For relevance, we'll order by created_at for now
        // In a production system, you'd use full-text search with ranking
        queryBuilder = queryBuilder.order("created_at", { ascending: false });
      }

      // Pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      queryBuilder = queryBuilder.range(from, to);

      const { data, error, count } = await queryBuilder;

      if (error) throw error;

      // Transform the data to match our interface
      const results: DocumentSearchResult[] =
        data?.map((doc: any) => ({
          id: doc.id,
          title: doc.title,
          title_ar: doc.title_ar,
          case_number: doc.case_number,
          court: doc.court,
          court_ar: doc.court_ar,
          year: doc.year,
          summary: doc.summary,
          summary_ar: doc.summary_ar,
          keywords: doc.keywords,
          keywords_ar: doc.keywords_ar,
          status: doc.status,
          created_at: doc.created_at,
          document_type: doc.document_type,
          court_level: doc.court_level,
          court_category: doc.court_category,
          categories:
            doc.document_categories
              ?.map((dc: any) => dc.categories)
              .filter(Boolean) || [],
        })) || [];

      // Apply category filter in memory (since it requires joining through document_categories)
      let filteredResults = results;
      if (categories && categories.length > 0) {
        filteredResults = results.filter((doc) =>
          doc.categories.some((cat) => categories.includes(cat.id))
        );
      }

      return {
        results: filteredResults,
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    },
  });
};
