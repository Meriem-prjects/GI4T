import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DocumentSearchFilters {
  query?: string;
  courtType?: string;
  yearFrom?: string;
  yearTo?: string;
  categories?: string[];
  jurisdictionLevel?: string;
  documentType?: string;
  sortBy?: "recent" | "relevance";
  page?: number;
  pageSize?: number;
  useAI?: boolean; // Enable AI semantic search
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
  primaryCategory?: {
    id: string;
    name: string;
    name_ar?: string;
    color?: string;
  };
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
        yearFrom,
        yearTo,
        categories,
        jurisdictionLevel,
        documentType,
        sortBy = "recent",
        page = 1,
        pageSize = 10,
        useAI = false,
      } = filters;

      // If AI search is enabled and query exists, use AI semantic search
      if (useAI && query && query.trim()) {
        try {
          const { data, error } = await supabase.functions.invoke('ai-semantic-search', {
            body: {
              query,
              filters: {
                courtType,
                yearFrom,
                yearTo,
                jurisdictionLevel,
                documentType,
              },
              limit: pageSize,
            },
          });

          if (error) {
            console.error('AI search error:', error);
            // Fall back to traditional search
            throw error;
          }

          return {
            results: data.results || [],
            total: data.total || 0,
            page,
            pageSize,
            totalPages: Math.ceil((data.total || 0) / pageSize),
            aiPowered: true,
          };
        } catch (error) {
          console.error('AI search failed, falling back to traditional search:', error);
          // Continue with traditional search below
        }
      }

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
        .eq("published", true); // Only show published documents

      // Text search - search in title, summary, keywords
      if (query && query.trim()) {
        queryBuilder = queryBuilder.or(
          `title.ilike.%${query}%,summary.ilike.%${query}%,title_ar.ilike.%${query}%,summary_ar.ilike.%${query}%,keywords.cs.{${query}},keywords_ar.cs.{${query}}`
        );
      }

      // Court type filter
      if (courtType && courtType !== "all") {
        queryBuilder = queryBuilder.or(
          `court.ilike.%${courtType}%,court_category.ilike.%${courtType}%,court_category_type.ilike.%${courtType}%`
        );
      }

      // Year range filters
      if (yearFrom) {
        queryBuilder = queryBuilder.gte("year", parseInt(yearFrom));
      }
      if (yearTo) {
        queryBuilder = queryBuilder.lte("year", parseInt(yearTo));
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
        data?.map((doc: any) => {
          const categories = doc.document_categories
            ?.map((dc: any) => dc.categories)
            .filter(Boolean) || [];
          
          return {
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
            categories,
            primaryCategory: categories[0] || null,
          };
        }) || [];

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
        aiPowered: false,
      };
    },
  });
};
