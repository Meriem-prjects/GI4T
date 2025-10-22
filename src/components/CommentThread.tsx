import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Reply, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CommentForm } from './CommentForm';
import type { Comment } from '@/hooks/useComments';
import type { CommentFormData } from '@/lib/commentValidation';

interface CommentThreadProps {
  comment: Comment;
  onReply: (data: CommentFormData) => void;
  isSubmitting: boolean;
}

export function CommentThread({ comment, onReply, isSubmitting }: CommentThreadProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);

  const handleReplySubmit = (data: CommentFormData) => {
    onReply(data);
    setShowReplyForm(false);
  };

  return (
    <div className="space-y-4">
      {/* Main Comment */}
      <div className="flex gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
          {comment.author_name.charAt(0).toUpperCase()}
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">
              {comment.author_name}
            </span>
            {comment.is_admin_reply && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                <Shield className="h-3 w-3" />
                Équipe Observatoire
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {format(new Date(comment.created_at), 'PPP', { locale: fr })}
            </span>
          </div>
          
          <p className="text-sm text-foreground whitespace-pre-wrap">
            {comment.content}
          </p>
          
          {!comment.is_admin_reply && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="h-8 text-xs"
            >
              <Reply className="h-3 w-3 mr-1" />
              Répondre
            </Button>
          )}
        </div>
      </div>

      {/* Reply Form */}
      {showReplyForm && (
        <div className="ml-14 p-4 border border-border rounded-lg bg-muted/50">
          <CommentForm
            documentId={comment.document_id}
            parentCommentId={comment.id}
            onSubmit={handleReplySubmit}
            isSubmitting={isSubmitting}
            onCancel={() => setShowReplyForm(false)}
          />
        </div>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-14 space-y-4">
          {comment.replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              onReply={onReply}
              isSubmitting={isSubmitting}
            />
          ))}
        </div>
      )}
    </div>
  );
}
