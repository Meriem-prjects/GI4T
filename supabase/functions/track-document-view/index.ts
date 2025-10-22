import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { documentId, sessionId, readDuration, userAgent } = await req.json();

    if (!documentId || !sessionId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Check if view already exists for this session
    const { data: existingView } = await supabase
      .from('document_views')
      .select('id, read_duration')
      .eq('document_id', documentId)
      .eq('session_id', sessionId)
      .maybeSingle();

    if (!existingView) {
      // Insert new view
      const { error: insertError } = await supabase
        .from('document_views')
        .insert({
          document_id: documentId,
          session_id: sessionId,
          read_duration: readDuration || 0,
          user_agent: userAgent || null,
          ip_address: req.headers.get('x-forwarded-for') || 'unknown'
        });

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }
    } else if (readDuration && readDuration > (existingView.read_duration || 0)) {
      // Update read duration if longer
      const { error: updateError } = await supabase
        .from('document_views')
        .update({ read_duration: readDuration })
        .eq('id', existingView.id);

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error tracking view:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
