import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { Comment } from '@/hooks/useComments';

interface AdminReplyDialogProps {
  comment: Comment | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (commentId: string, replyContent: string) => Promise<void>;
}

export function AdminReplyDialog({ comment, open, onClose, onSubmit }: AdminReplyDialogProps) {
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!comment || !replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(comment.id, replyContent.trim());
      setReplyContent('');
      onClose();
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Répondre au commentaire</DialogTitle>
        </DialogHeader>

        {comment && (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold">{comment.author_name}</span>
                <span className="text-xs text-muted-foreground">
                  {comment.author_email}
                </span>
              </div>
              <p className="text-sm">{comment.content}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reply">Votre réponse *</Label>
              <Textarea
                id="reply"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Rédigez votre réponse officielle..."
                className="min-h-[150px] resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Cette réponse sera affichée avec un badge "Équipe Observatoire"
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !replyContent.trim()}>
            {isSubmitting ? 'Envoi...' : 'Envoyer la réponse'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
