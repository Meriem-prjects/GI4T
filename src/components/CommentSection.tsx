import { MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CommentForm } from './CommentForm';
import { CommentThread } from './CommentThread';
import { useComments } from '@/hooks/useComments';
import { Skeleton } from '@/components/ui/skeleton';

interface CommentSectionProps {
  documentId: string;
  documentTitle: string;
}

export function CommentSection({ documentId, documentTitle }: CommentSectionProps) {
  const { comments, isLoading, submitComment, isSubmitting } = useComments(documentId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Commentaires ({comments.length})
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Comment Form */}
        <div>
          <h3 className="font-semibold mb-4">Laisser un commentaire</h3>
          <CommentForm
            documentId={documentId}
            onSubmit={submitComment}
            isSubmitting={isSubmitting}
          />
        </div>

        <Separator />

        {/* Comments List */}
        <div className="space-y-6">
          <h3 className="font-semibold">
            Discussion {comments.length > 0 && `(${comments.length})`}
          </h3>
          
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Aucun commentaire pour le moment. Soyez le premier à commenter !
            </p>
          ) : (
            comments.map((comment) => (
              <CommentThread
                key={comment.id}
                comment={comment}
                onReply={submitComment}
                isSubmitting={isSubmitting}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
