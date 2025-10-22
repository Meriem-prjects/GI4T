import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { CommentFormData } from '@/lib/commentValidation';

export interface Comment {
  id: string;
  document_id: string;
  parent_comment_id: string | null;
  author_name: string;
  author_email: string;
  content: string;
  is_admin_reply: boolean;
  admin_user_id: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'spam';
  created_at: string;
  updated_at: string;
  replies?: Comment[];
}

export function useComments(documentId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', documentId],
    queryFn: async () => {
      if (!documentId) return [];

      const { data, error } = await supabase
        .from('document_comments')
        .select('*')
        .eq('document_id', documentId)
        .eq('status', 'approved')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Organize comments into threads
      const commentsMap = new Map<string, Comment>();
      const rootComments: Comment[] = [];

      data.forEach((comment) => {
        commentsMap.set(comment.id, { 
          ...comment, 
          status: comment.status as Comment['status'],
          replies: [] 
        });
      });

      data.forEach((comment) => {
        const commentWithReplies = commentsMap.get(comment.id)!;
        
        if (comment.parent_comment_id) {
          const parent = commentsMap.get(comment.parent_comment_id);
          if (parent) {
            parent.replies!.push(commentWithReplies);
          }
        } else {
          rootComments.push(commentWithReplies);
        }
      });

      return rootComments;
    },
    enabled: !!documentId,
  });

  const submitCommentMutation = useMutation({
    mutationFn: async (formData: CommentFormData) => {
      const { data, error } = await supabase.functions.invoke('submit-comment', {
        body: formData,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Commentaire soumis avec succès ! Il sera visible après modération.');
      queryClient.invalidateQueries({ queryKey: ['comments', documentId] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la soumission du commentaire');
    },
  });

  return {
    comments,
    isLoading,
    submitComment: submitCommentMutation.mutate,
    isSubmitting: submitCommentMutation.isPending,
  };
}
