import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { supabase } from '@/integrations/supabase/client';
import { groupViewsByDay, ViewData } from '@/lib/statisticsUtils';

export interface GlobalStatistics {
  total_views: number;
  total_reads: number;
  avg_read_duration: number;
  total_comments: number;
  pending_comments: number;
  top_articles_count: number;
  unique_sessions: number;
}

export interface StatisticsFilters {
  sortBy: string;
  category?: string;
}

export function useStatistics(period: string, filters: StatisticsFilters) {
  const periodDays = {
    '7j': 7,
    '30j': 30,
    '90j': 90,
    'all': 3650
  }[period] || 30;

  // Statistiques globales
  const { data: globalStats, isLoading: isLoadingGlobal } = useQuery({
    queryKey: ['global-statistics', periodDays],
    queryFn: async () => {
      const data = await api.get<GlobalStatistics>('/api/statistics/global', {
        query: { period_days: periodDays },
      });
      return data;
    },
    refetchInterval: 60000, // Refresh every minute
  });

  // Statistiques par article
  const { data: articleStats, isLoading: isLoadingArticles } = useQuery({
    queryKey: ['article-statistics', filters],
    queryFn: async () => {
      let query = supabase.from('document_statistics').select('*');
      
      const { data, error } = await query.order(filters.sortBy, { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Évolution temporelle
  const { data: timelineData, isLoading: isLoadingTimeline } = useQuery({
    queryKey: ['views-timeline', periodDays],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - periodDays);

      const { data, error } = await supabase
        .from('document_views')
        .select('viewed_at, document_id, read_duration')
        .gte('viewed_at', startDate.toISOString())
        .order('viewed_at');

      if (error) throw error;

      return groupViewsByDay(data as ViewData[]);
    },
  });

  return {
    globalStats,
    articleStats,
    timelineData,
    isLoading: isLoadingGlobal || isLoadingArticles || isLoadingTimeline
  };
}
