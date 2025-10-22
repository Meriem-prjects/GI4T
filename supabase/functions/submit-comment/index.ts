import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { corsHeaders } from '../_shared/cors.ts';

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function sanitizeContent(content: string): string {
  return content
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { documentId, authorName, authorEmail, content, parentCommentId } = await req.json();

    // Validation
    if (!documentId || !authorName || !authorEmail || !content) {
      return new Response(JSON.stringify({ error: 'Champs requis manquants' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!isValidEmail(authorEmail)) {
      return new Response(JSON.stringify({ error: 'Adresse email invalide' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (content.length < 10 || content.length > 2000) {
      return new Response(JSON.stringify({ error: 'Le commentaire doit contenir entre 10 et 2000 caractères' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Check rate limiting: 1 comment per email every 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: recentComments } = await supabase
      .from('document_comments')
      .select('id')
      .eq('author_email', authorEmail.trim().toLowerCase())
      .gte('created_at', fiveMinutesAgo)
      .limit(1);

    if (recentComments && recentComments.length > 0) {
      return new Response(JSON.stringify({ error: 'Veuillez attendre quelques minutes avant de soumettre un autre commentaire' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Insert comment
    const { data, error } = await supabase
      .from('document_comments')
      .insert({
        document_id: documentId,
        parent_comment_id: parentCommentId || null,
        author_name: authorName.trim(),
        author_email: authorEmail.trim().toLowerCase(),
        content: sanitizeContent(content),
        status: 'pending',
        is_admin_reply: false
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Commentaire soumis avec succès. Il sera visible après modération.',
      commentId: data.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error submitting comment:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
