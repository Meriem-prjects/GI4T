import { Eye, Clock, MessageSquare } from 'lucide-react';
import { useDocumentStatistics } from '@/hooks/useDocumentStatistics';
import { calculateReadTime } from '@/lib/sessionUtils';
import { Skeleton } from '@/components/ui/skeleton';

interface ArticleStatisticsProps {
  documentId: string;
  contentLength?: number;
}

export function ArticleStatistics({ documentId, contentLength }: ArticleStatisticsProps) {
  const { data: stats, isLoading } = useDocumentStatistics(documentId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-6 py-4 border-y border-border">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-28" />
      </div>
    );
  }

  const estimatedReadTime = contentLength ? calculateReadTime(String(contentLength)) : null;

  return (
    <div className="flex items-center gap-6 py-4 border-y border-border text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <Eye className="h-4 w-4" />
        <span>{stats?.total_views || 0} vues</span>
      </div>
      
      {estimatedReadTime && (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>{estimatedReadTime} min de lecture</span>
        </div>
      )}
      
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4" />
        <span>{stats?.total_comments || 0} commentaires</span>
      </div>
    </div>
  );
}
