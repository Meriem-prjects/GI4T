import { z } from 'zod';

export const commentSchema = z.object({
  documentId: z.string().uuid('ID de document invalide'),
  authorName: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  authorEmail: z.string()
    .email('Adresse email invalide')
    .max(255, 'L\'email ne peut pas dépasser 255 caractères'),
  content: z.string()
    .min(10, 'Le commentaire doit contenir au moins 10 caractères')
    .max(2000, 'Le commentaire ne peut pas dépasser 2000 caractères'),
  parentCommentId: z.string().uuid().optional(),
});

export type CommentFormData = z.infer<typeof commentSchema>;

export function validateComment(data: unknown) {
  return commentSchema.safeParse(data);
}
