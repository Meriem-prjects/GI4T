import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Check, X, Reply, Trash2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Comment } from '@/hooks/useComments';

interface CommentModerationCardProps {
  comment: Comment;
  documentTitle?: string;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onReply: (comment: Comment) => void;
  onDelete: (id: string) => void;
  onSpam: (id: string) => void;
  isLoading?: boolean;
}

export function CommentModerationCard({
  comment,
  documentTitle,
  onApprove,
  onReject,
  onReply,
  onDelete,
  onSpam,
  isLoading = false,
}: CommentModerationCardProps) {
  const getStatusBadge = () => {
    switch (comment.status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-500">Approuvé</Badge>;
      case 'pending':
        return <Badge variant="secondary">En attente</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeté</Badge>;
      case 'spam':
        return <Badge variant="outline" className="border-orange-500 text-orange-500">Spam</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{comment.author_name}</span>
              {getStatusBadge()}
              {comment.is_admin_reply && (
                <Badge variant="outline" className="border-primary text-primary">
                  Réponse admin
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{comment.author_email}</span>
              <span>•</span>
              <span>{format(new Date(comment.created_at), 'PPP à p', { locale: fr })}</span>
            </div>
            {documentTitle && (
              <p className="text-sm text-muted-foreground">
                Article : <span className="font-medium">{documentTitle}</span>
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2 pt-4 border-t">
        {comment.status === 'pending' && (
          <>
            <Button
              size="sm"
              onClick={() => onApprove(comment.id)}
              disabled={isLoading}
              className="gap-1"
            >
              <Check className="h-4 w-4" />
              Approuver
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onReject(comment.id)}
              disabled={isLoading}
              className="gap-1"
            >
              <X className="h-4 w-4" />
              Rejeter
            </Button>
          </>
        )}
        
        {comment.status === 'approved' && !comment.is_admin_reply && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onReply(comment)}
            disabled={isLoading}
            className="gap-1"
          >
            <Reply className="h-4 w-4" />
            Répondre
          </Button>
        )}

        <Button
          size="sm"
          variant="outline"
          onClick={() => onSpam(comment.id)}
          disabled={isLoading}
          className="gap-1"
        >
          <AlertTriangle className="h-4 w-4" />
          Spam
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => onDelete(comment.id)}
          disabled={isLoading}
          className="gap-1 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          Supprimer
        </Button>
      </CardFooter>
    </Card>
  );
}
