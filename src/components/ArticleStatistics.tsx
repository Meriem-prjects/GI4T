import { Eye, Clock, MessageSquare } from 'lucide-react';
import { useDocumentStatistics } from '@/hooks/useDocumentStatistics';
import { calculateReadTime } from '@/lib/sessionUtils';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';

interface ArticleStatisticsProps {
  documentId: string;
  contentLength?: number;
}

export function ArticleStatistics({ documentId, contentLength }: ArticleStatisticsProps) {
  const { data: stats, isLoading } = useDocumentStatistics(documentId);
  const { language, isRTL } = useLanguage();

  if (isLoading) {
    return (
      <div className={`flex items-center gap-6 py-4 border-y border-border ${isRTL ? 'flex-row-reverse' : ''}`}>
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-28" />
      </div>
    );
  }

  const estimatedReadTime = contentLength ? calculateReadTime(String(contentLength)) : null;

  const viewsLabel = language === 'ar' ? 'مشاهدات' : 'vues';
  const readTimeLabel = language === 'ar' ? 'دقيقة للقراءة' : 'min de lecture';
  const commentsLabel = language === 'ar' ? 'تعليقات' : 'commentaires';

  return (
    <div className={`flex items-center gap-6 py-4 border-y border-border text-sm text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <Eye className="h-4 w-4" />
        <span>{stats?.total_views || 0} {viewsLabel}</span>
      </div>
      
      {estimatedReadTime && (
        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Clock className="h-4 w-4" />
          <span>{estimatedReadTime} {readTimeLabel}</span>
        </div>
      )}
      
      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <MessageSquare className="h-4 w-4" />
        <span>{stats?.total_comments || 0} {commentsLabel}</span>
      </div>
    </div>
  );
}
