import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CommentModerationCard } from '@/components/admin/CommentModerationCard';
import { AdminReplyDialog } from '@/components/admin/AdminReplyDialog';
import { CommentFilters } from '@/components/admin/CommentFilters';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import type { Comment } from '@/hooks/useComments';

export default function AdminCommentaires() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [documentFilter, setDocumentFilter] = useState('all');
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);

  // Fetch documents for filter
  const { data: documents = [] } = useQuery({
    queryKey: ['documents-for-comments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('id, title')
        .eq('published', true)
        .order('title');

      if (error) throw error;
      return data;
    },
  });

  // Fetch comments
  const { data: allComments = [], isLoading } = useQuery({
    queryKey: ['admin-comments', activeTab, documentFilter],
    queryFn: async () => {
      let query = supabase
        .from('document_comments')
        .select(`
          *,
          documents!inner(id, title)
        `)
        .order('created_at', { ascending: false });

      if (activeTab !== 'all') {
        query = query.eq('status', activeTab);
      }

      if (documentFilter !== 'all') {
        query = query.eq('document_id', documentFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Filter comments by search
  const filteredComments = allComments.filter((comment) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      comment.author_name.toLowerCase().includes(search) ||
      comment.author_email.toLowerCase().includes(search) ||
      comment.content.toLowerCase().includes(search)
    );
  });

  // Update comment status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('document_comments')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] });
      toast.success('Statut du commentaire mis à jour');
    },
    onError: (error: any) => {
      toast.error('Erreur: ' + error.message);
    },
  });

  // Delete comment mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('document_comments')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] });
      toast.success('Commentaire supprimé');
    },
    onError: (error: any) => {
      toast.error('Erreur: ' + error.message);
    },
  });

  // Reply to comment mutation
  const replyMutation = useMutation({
    mutationFn: async ({ parentId, content }: { parentId: string; content: string }) => {
      // Get parent comment info
      const { data: parentComment, error: fetchError } = await supabase
        .from('document_comments')
        .select('document_id, author_name')
        .eq('id', parentId)
        .single();

      if (fetchError) throw fetchError;

      // Insert reply
      const { error: insertError } = await supabase
        .from('document_comments')
        .insert({
          document_id: parentComment.document_id,
          parent_comment_id: parentId,
          author_name: 'Équipe Observatoire',
          author_email: user?.email || 'admin@observatoire.tn',
          content,
          is_admin_reply: true,
          admin_user_id: user?.id,
          status: 'approved',
        });

      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] });
      toast.success('Réponse publiée avec succès');
    },
    onError: (error: any) => {
      toast.error('Erreur: ' + error.message);
    },
  });

  const handleReplySubmit = async (commentId: string, content: string) => {
    await replyMutation.mutateAsync({ parentId: commentId, content });
  };

  const pendingCount = allComments.filter((c) => c.status === 'pending').length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestion des commentaires</h1>
        <p className="text-muted-foreground mt-2">
          Modérez et répondez aux commentaires des utilisateurs
        </p>
      </div>

      <CommentFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        documentFilter={documentFilter}
        onDocumentFilterChange={setDocumentFilter}
        documents={documents}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending" className="relative">
            En attente
            {pendingCount > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground text-xs">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approuvés</TabsTrigger>
          <TabsTrigger value="rejected">Rejetés</TabsTrigger>
          <TabsTrigger value="spam">Spam</TabsTrigger>
          <TabsTrigger value="all">Tous</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))
          ) : filteredComments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Aucun commentaire à afficher
            </div>
          ) : (
            filteredComments.map((comment) => (
              <CommentModerationCard
                key={comment.id}
                comment={comment as Comment}
                documentTitle={(comment as any).documents?.title}
                onApprove={(id) => updateStatusMutation.mutate({ id, status: 'approved' })}
                onReject={(id) => updateStatusMutation.mutate({ id, status: 'rejected' })}
                onReply={(comment) => setReplyingTo(comment)}
                onDelete={(id) => deleteMutation.mutate(id)}
                onSpam={(id) => updateStatusMutation.mutate({ id, status: 'spam' })}
                isLoading={
                  updateStatusMutation.isPending ||
                  deleteMutation.isPending ||
                  replyMutation.isPending
                }
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      <AdminReplyDialog
        comment={replyingTo}
        open={!!replyingTo}
        onClose={() => setReplyingTo(null)}
        onSubmit={handleReplySubmit}
      />
    </div>
  );
}
