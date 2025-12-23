import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DocumentByType {
  id: string;
  title: string;
  title_ar?: string;
  summary?: string;
  summary_ar?: string;
  author?: string;
  author_ar?: string;
  created_at: string;
  keywords?: string[];
  keywords_ar?: string[];
  document_type_id?: string;
  document_types?: {
    name: string;
    name_ar?: string;
  };
}

export const useDocumentsByType = (documentTypeName: string) => {
  return useQuery({
    queryKey: ['documents-by-type', documentTypeName],
    queryFn: async () => {
      console.log('Fetching documents for type:', documentTypeName);
      
      // First get the document type ID
      const { data: docType, error: typeError } = await supabase
        .from('document_types')
        .select('id, name')
        .eq('name', documentTypeName)
        .maybeSingle();
      
      if (typeError) {
        console.error('Error fetching document type:', typeError);
        throw typeError;
      }
      
      if (!docType) {
        console.log('Document type not found:', documentTypeName);
        return [];
      }
      
      console.log('Found document type:', docType);
      
      // Then get documents of this type
      const { data, error } = await supabase
        .from('documents')
        .select(`
          id,
          title,
          title_ar,
          summary,
          summary_ar,
          author,
          author_ar,
          created_at,
          keywords,
          keywords_ar,
          document_type_id,
          published,
          status,
          document_types(name, name_ar)
        `)
        .eq('document_type_id', docType.id)
        .eq('published', true)
        .eq('status', 'processed')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) {
        console.error('Error fetching documents:', error);
        throw error;
      }
      
      console.log('Found documents:', data?.length, data);
      return data as DocumentByType[] || [];
    },
    enabled: !!documentTypeName
  });
};

export const useAllAnalysesOpinions = () => {
  return useQuery({
    queryKey: ['all-analyses-opinions'],
    queryFn: async () => {
      // Get the three document types
      const { data: types, error: typesError } = await supabase
        .from('document_types')
        .select('id, name')
        .in('name', ['Analyses juridiques', 'Commentaires', 'Blogs']);
      
      if (typesError) throw typesError;
      if (!types || types.length === 0) return [];
      
      const typeIds = types.map(t => t.id);
      
      // Get all documents for these types
      const { data, error } = await supabase
        .from('documents')
        .select(`
          id,
          title,
          title_ar,
          summary,
          summary_ar,
          author,
          author_ar,
          created_at,
          keywords,
          keywords_ar,
          document_type_id,
          document_types(name, name_ar)
        `)
        .in('document_type_id', typeIds)
        .eq('published', true)
        .eq('status', 'processed')
        .order('created_at', { ascending: false })
        .limit(6);
      
      if (error) throw error;
      return data as DocumentByType[] || [];
    }
  });
};

export const useDocumentTypesCounts = () => {
  return useQuery({
    queryKey: ['document-types-counts'],
    queryFn: async () => {
      // Get the three document types with their counts
      const { data: types, error: typesError } = await supabase
        .from('document_types')
        .select('id, name, name_ar')
        .in('name', ['Analyses juridiques', 'Commentaires', 'Blogs']);
      
      if (typesError) throw typesError;
      if (!types) return [];
      
      // Get counts for each type
      const countsPromises = types.map(async (type) => {
        const { count, error } = await supabase
          .from('documents')
          .select('id', { count: 'exact', head: true })
          .eq('document_type_id', type.id)
          .eq('published', true)
          .eq('status', 'processed');
        
        if (error) throw error;
        return {
          name: type.name,
          name_ar: type.name_ar,
          count: count || 0
        };
      });
      
      return Promise.all(countsPromises);
    }
  });
};
