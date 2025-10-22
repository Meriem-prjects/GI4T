import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DocumentStatistics {
  document_id: string;
  title: string;
  title_ar: string | null;
  total_views: number;
  total_reads: number;
  avg_read_duration: number;
  total_comments: number;
  pending_comments: number;
  last_viewed_at: string | null;
}

export function useDocumentStatistics(documentId: string | undefined) {
  return useQuery({
    queryKey: ['document-statistics', documentId],
    queryFn: async () => {
      if (!documentId) return null;

      const { data, error } = await supabase
        .from('document_statistics')
        .select('*')
        .eq('document_id', documentId)
        .maybeSingle();

      if (error) throw error;
      return data as DocumentStatistics | null;
    },
    enabled: !!documentId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
