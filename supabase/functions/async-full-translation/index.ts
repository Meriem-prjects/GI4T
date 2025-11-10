import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  
  try {
    const { document_id, job_id, source_language, target_language } = await req.json();

    console.log(`🚀 Starting async full translation for document ${document_id}, job ${job_id}`);
    console.log(`   Source: ${source_language} → Target: ${target_language}`);

    if (!document_id || !job_id) {
      throw new Error('document_id and job_id are required');
    }

    // 1. Récupérer le document
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('id, content, language')
      .eq('id', document_id)
      .single();

    if (docError || !document) {
      console.error('❌ Document not found:', docError);
      await supabase
        .from('processing_jobs')
        .update({
          status: 'failed',
          error_message: 'Document introuvable',
          updated_at: new Date().toISOString()
        })
        .eq('id', job_id);
      
      throw new Error('Document not found');
    }

    const content = document.content;
    if (!content) {
      throw new Error('Document content is empty');
    }

    console.log(`📄 Document content length: ${content.length} characters`);

    // 2. Diviser en chunks de 5000 caractères
    const CHUNK_SIZE = 5000;
    const chunks: string[] = [];
    
    for (let i = 0; i < content.length; i += CHUNK_SIZE) {
      chunks.push(content.slice(i, i + CHUNK_SIZE));
    }

    console.log(`📦 Created ${chunks.length} chunks for translation`);

    // 3. Traduire chaque chunk
    const translatedChunks: string[] = [];
    let retryCount = 0;
    const MAX_RETRIES = 3;

    for (let i = 0; i < chunks.length; i++) {
      const chunkNum = i + 1;
      const progress = Math.round((i / chunks.length) * 100);
      
      console.log(`🔄 Translating chunk ${chunkNum}/${chunks.length} (${progress}%)`);

      // Mettre à jour la progression
      await supabase
        .from('processing_jobs')
        .update({
          progress,
          current_step: `Traduction chunk ${chunkNum}/${chunks.length}`,
          processed_pages: chunkNum,
          updated_at: new Date().toISOString()
        })
        .eq('id', job_id);

      // Traduire le chunk avec retry
      let success = false;
      let attempts = 0;

      while (!success && attempts < MAX_RETRIES) {
        attempts++;
        
        try {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openAIApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-5-mini-2025-08-07',
              messages: [
                { 
                  role: 'system', 
                  content: `Translate the following legal text to ${target_language}. Preserve all formatting, numbers, and legal terminology. Only return the translation, nothing else.`
                },
                { role: 'user', content: chunks[i] }
              ],
              max_completion_tokens: 8000,
            }),
          });

          if (response.status === 429) {
            // Rate limit - attendre plus longtemps
            console.warn(`⏳ Rate limit hit on chunk ${chunkNum}, waiting 10 seconds...`);
            await new Promise(resolve => setTimeout(resolve, 10000));
            continue;
          }

          if (response.status === 402) {
            // Crédits épuisés
            console.error(`💳 Credits exhausted on chunk ${chunkNum}`);
            await supabase
              .from('processing_jobs')
              .update({
                status: 'failed',
                error_message: 'Crédits OpenAI épuisés',
                updated_at: new Date().toISOString()
              })
              .eq('id', job_id);
            
            throw new Error('Credits exhausted');
          }

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ OpenAI API error on chunk ${chunkNum}:`, response.status, errorText);
            throw new Error(`OpenAI API error: ${response.status}`);
          }

          const data = await response.json();
          const translatedText = data.choices[0].message.content;
          translatedChunks.push(translatedText);
          
          console.log(`✅ Chunk ${chunkNum}/${chunks.length} translated successfully`);
          success = true;

          // Pause entre les chunks (rate limiting)
          if (i < chunks.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }

        } catch (error) {
          console.error(`⚠️ Error translating chunk ${chunkNum}, attempt ${attempts}:`, error);
          
          if (attempts >= MAX_RETRIES) {
            // Échec définitif
            await supabase
              .from('processing_jobs')
              .update({
                status: 'failed',
                error_message: `Échec de traduction au chunk ${chunkNum}: ${error.message}`,
                updated_at: new Date().toISOString()
              })
              .eq('id', job_id);
            
            throw error;
          }
          
          // Attendre avant de réessayer
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }

    // 4. Concaténer les chunks traduits
    const fullTranslation = translatedChunks.join('\n');
    console.log(`📝 Full translation completed: ${fullTranslation.length} characters`);

    // 5. Sauvegarder dans le document
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        translated_content: fullTranslation,
        updated_at: new Date().toISOString()
      })
      .eq('id', document_id);

    if (updateError) {
      console.error('❌ Error updating document:', updateError);
      throw updateError;
    }

    // 6. Finaliser le job
    const duration = Math.round((Date.now() - startTime) / 1000);
    
    await supabase
      .from('processing_jobs')
      .update({
        status: 'completed',
        progress: 100,
        current_step: 'Traduction terminée',
        result_data: {
          translated_length: fullTranslation.length,
          chunks_processed: chunks.length,
          duration_seconds: duration
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', job_id);

    console.log(`✅ Translation job completed in ${duration}s`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        translated_length: fullTranslation.length,
        duration_seconds: duration 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Async translation error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
