import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { commentSchema, type CommentFormData } from '@/lib/commentValidation';
import { useLanguage } from '@/contexts/LanguageContext';

interface CommentFormProps {
  documentId: string;
  parentCommentId?: string;
  onSubmit: (data: CommentFormData) => void;
  isSubmitting: boolean;
  onCancel?: () => void;
}

export function CommentForm({ documentId, parentCommentId, onSubmit, isSubmitting, onCancel }: CommentFormProps) {
  const { language, isRTL } = useLanguage();
  
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

  // Translations
  const labels = {
    name: language === 'ar' ? 'الاسم *' : 'Nom *',
    namePlaceholder: language === 'ar' ? 'اسمك' : 'Votre nom',
    email: language === 'ar' ? 'البريد الإلكتروني *' : 'Email *',
    emailPlaceholder: language === 'ar' ? 'بريدك@example.com' : 'votre@email.com',
    comment: language === 'ar' ? 'التعليق *' : 'Commentaire *',
    commentPlaceholder: language === 'ar' ? 'شارك رأيك أو اطرح سؤالاً...' : 'Partagez votre avis ou posez une question...',
    characters: language === 'ar' ? 'حرف' : 'caractères',
    validationMessage: language === 'ar' 
      ? 'سيكون تعليقك مرئياً بعد التحقق من طرف فريقنا.'
      : 'Votre commentaire sera visible après validation par notre équipe.',
    cancel: language === 'ar' ? 'إلغاء' : 'Annuler',
    submit: language === 'ar' ? 'نشر' : 'Publier',
    submitting: language === 'ar' ? 'جاري الإرسال...' : 'Envoi...',
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="authorName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={isRTL ? 'text-right block' : ''}>{labels.name}</FormLabel>
                <FormControl>
                  <Input placeholder={labels.namePlaceholder} {...field} className={isRTL ? 'text-right' : ''} />
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
                <FormLabel className={isRTL ? 'text-right block' : ''}>{labels.email}</FormLabel>
                <FormControl>
                  <Input type="email" placeholder={labels.emailPlaceholder} {...field} className={isRTL ? 'text-right' : ''} />
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
              <FormLabel className={isRTL ? 'text-right block' : ''}>{labels.comment}</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder={labels.commentPlaceholder} 
                  className={`min-h-[120px] resize-none ${isRTL ? 'text-right' : ''}`}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
              <p className={`text-xs text-muted-foreground ${isRTL ? 'text-right' : ''}`}>
                {field.value?.length || 0} / 2000 {labels.characters}
              </p>
            </FormItem>
          )}
        />

        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <p className={`text-xs text-muted-foreground ${isRTL ? 'text-right' : ''}`}>
            {labels.validationMessage}
          </p>
          <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                {labels.cancel}
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? labels.submitting : labels.submit}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
