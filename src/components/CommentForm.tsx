import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { commentSchema, type CommentFormData } from '@/lib/commentValidation';

interface CommentFormProps {
  documentId: string;
  parentCommentId?: string;
  onSubmit: (data: CommentFormData) => void;
  isSubmitting: boolean;
  onCancel?: () => void;
}

export function CommentForm({ documentId, parentCommentId, onSubmit, isSubmitting, onCancel }: CommentFormProps) {
  const form = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      documentId,
      parentCommentId,
      authorName: '',
      authorEmail: '',
      content: '',
    },
  });

  const handleSubmit = (data: CommentFormData) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="authorName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom *</FormLabel>
                <FormControl>
                  <Input placeholder="Votre nom" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="authorEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="votre@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Commentaire *</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Partagez votre avis ou posez une question..." 
                  className="min-h-[120px] resize-none"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-muted-foreground">
                {field.value?.length || 0} / 2000 caractères
              </p>
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Votre commentaire sera visible après validation par notre équipe.
          </p>
          <div className="flex gap-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Annuler
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Envoi...' : 'Publier'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
