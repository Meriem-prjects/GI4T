import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { document_id, page_number, content, source_language, target_language } = await req.json();
    
    console.log(`🔄 Translating page ${page_number} of document ${document_id}`);
    console.log(`   Source: ${source_language} → Target: ${target_language}`);
    
    if (!document_id || !page_number || !content) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: document_id, page_number, content' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    // Translate with GPT-4o-mini (fast and cost-effective)
    const systemPrompt = source_language === 'fr' 
      ? `Tu es un traducteur expert spécialisé en documents juridiques tunisiens. Traduis le texte français suivant en arabe standard moderne. Respecte la terminologie juridique et le format du texte original. Assure-toi que la traduction est fluide et naturelle en arabe.`
      : `You are an expert translator specialized in Tunisian legal documents. Translate the following Arabic text to French. Respect legal terminology and the original text format. Ensure the translation is fluent and natural in French.`;

    console.log(`📤 Calling OpenAI API for translation...`);
    const translationResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: content }
        ],
        temperature: 0.3,
        max_tokens: 4000
      }),
    });

    if (!translationResponse.ok) {
      const errorText = await translationResponse.text();
      console.error('❌ OpenAI API error:', translationResponse.status, errorText);
      throw new Error(`OpenAI API error: ${translationResponse.status} ${errorText}`);
    }

    const translationData = await translationResponse.json();
    const translatedContent = translationData.choices[0].message.content;
    
    console.log(`✅ Translation completed for page ${page_number}`);
    console.log(`   Original length: ${content.length} chars`);
    console.log(`   Translated length: ${translatedContent.length} chars`);

    // Fetch current page_contents
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('page_contents')
      .eq('id', document_id)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching document:', fetchError);
      throw new Error(`Failed to fetch document: ${fetchError.message}`);
    }

    // Update the specific page with translation
    const pageContents = document.page_contents || [];
    const pageIndex = pageContents.findIndex((p: any) => p.pageNumber === page_number);
    
    if (pageIndex === -1) {
      throw new Error(`Page ${page_number} not found in document`);
    }

    // Update the page with translated content and status
    pageContents[pageIndex] = {
      ...pageContents[pageIndex],
      translated_content: translatedContent,
      translation_status: 'completed'
    };

    // Save back to database
    const { error: updateError } = await supabase
      .from('documents')
      .update({ 
        page_contents: pageContents,
        updated_at: new Date().toISOString()
      })
      .eq('id', document_id);

    if (updateError) {
      console.error('❌ Error updating document:', updateError);
      throw new Error(`Failed to update document: ${updateError.message}`);
    }

    console.log(`💾 Page ${page_number} translation saved to database`);

    return new Response(
      JSON.stringify({
        success: true,
        translated_content: translatedContent,
        page_number,
        source_length: content.length,
        translated_length: translatedContent.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in translate-page function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
