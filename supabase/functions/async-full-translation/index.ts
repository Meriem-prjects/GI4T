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
    const { document_id, job_id, chunk_index, total_chunks, source_language, target_language } = await req.json();

    console.log(`🚀 Processing chunk ${chunk_index + 1}/${total_chunks} for document ${document_id}, job ${job_id}`);

    if (!document_id || !job_id || chunk_index === undefined || !total_chunks) {
      throw new Error('document_id, job_id, chunk_index and total_chunks are required');
    }

    // 1. Récupérer le job pour obtenir les chunks stockés
    const { data: job, error: jobError } = await supabase
      .from('processing_jobs')
      .select('result_data')
      .eq('id', job_id)
      .single();

    if (jobError || !job) {
      console.error('❌ Job not found:', jobError);
      throw new Error('Job not found');
    }

    const chunks = job.result_data?.chunks || [];
    const translatedChunks = job.result_data?.translated_chunks || [];
    
    if (!chunks[chunk_index]) {
      throw new Error(`Chunk ${chunk_index} not found in job data`);
    }

    const currentChunk = chunks[chunk_index];
    console.log(`📄 Chunk ${chunk_index + 1} length: ${currentChunk.length} characters`);

    // 2. Mettre à jour la progression avant traduction
    const progress = Math.round((chunk_index / total_chunks) * 100);
    await supabase
      .from('processing_jobs')
      .update({
        progress,
        current_step: `Traduction chunk ${chunk_index + 1}/${total_chunks}`,
        processed_pages: chunk_index + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', job_id);

    // 3. Traduire ce chunk avec retry
    let translatedText = '';
    let success = false;
    const MAX_RETRIES = 3;

    for (let attempt = 1; attempt <= MAX_RETRIES && !success; attempt++) {
      try {
        console.log(`🔄 Translation attempt ${attempt}/${MAX_RETRIES} for chunk ${chunk_index + 1}`);
        
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
              { role: 'user', content: currentChunk }
            ],
            max_completion_tokens: 8000,
          }),
        });

        if (response.status === 429) {
          console.warn(`⏳ Rate limit hit, waiting 10 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 10000));
          continue;
        }

        if (response.status === 402) {
          console.error(`💳 Credits exhausted`);
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
          console.error(`❌ OpenAI API error:`, response.status, errorText);
          throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        translatedText = data.choices[0].message.content;
        success = true;
        
        console.log(`✅ Chunk ${chunk_index + 1}/${total_chunks} translated successfully`);

      } catch (error) {
        console.error(`⚠️ Translation attempt ${attempt} failed:`, error);
        
        if (attempt >= MAX_RETRIES) {
          await supabase
            .from('processing_jobs')
            .update({
              status: 'failed',
              error_message: `Échec de traduction au chunk ${chunk_index + 1}: ${error.message}`,
              updated_at: new Date().toISOString()
            })
            .eq('id', job_id);
          
          throw error;
        }
        
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    // 4. Sauvegarder le chunk traduit dans le job
    translatedChunks[chunk_index] = translatedText;
    
    await supabase
      .from('processing_jobs')
      .update({
        result_data: {
          ...job.result_data,
          translated_chunks: translatedChunks
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', job_id);

    console.log(`💾 Chunk ${chunk_index + 1} saved to job`);

    // 5. Si pas fini, déclencher le chunk suivant
    if (chunk_index + 1 < total_chunks) {
      console.log(`🔗 Triggering next chunk ${chunk_index + 2}/${total_chunks}`);
      
      let triggered = false;
      for (let attempt = 1; attempt <= 3 && !triggered; attempt++) {
        try {
          const { error: invokeError } = await supabase.functions.invoke(
            'async-full-translation',
            {
              body: {
                document_id,
                job_id,
                chunk_index: chunk_index + 1,
                total_chunks,
                source_language,
                target_language
              }
            }
          );

          if (invokeError) {
            throw invokeError;
          }

          triggered = true;
          console.log(`✅ Chunk ${chunk_index + 2} triggered successfully`);
        } catch (err) {
          console.error(`⚠️ Failed to trigger chunk ${chunk_index + 2}, attempt ${attempt}/3:`, err);
          
          if (attempt >= 3) {
            // Échec définitif après 3 tentatives
            await supabase
              .from('processing_jobs')
              .update({
                status: 'failed',
                error_message: `Échec du déclenchement du chunk ${chunk_index + 2} après 3 tentatives`,
                updated_at: new Date().toISOString()
              })
              .eq('id', job_id);
            
            throw new Error(`Failed to trigger next chunk after 3 attempts`);
          }
          
          // Attendre 2s avant retry
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          chunk_index,
          next_chunk_triggered: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 6. Dernier chunk : finaliser la traduction
    console.log(`🎉 All chunks translated! Finalizing...`);
    
    const fullTranslation = translatedChunks.join('\n');
    console.log(`📝 Full translation completed: ${fullTranslation.length} characters`);

    // Sauvegarder dans le document
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

    // Finaliser le job
    const duration = Math.round((Date.now() - startTime) / 1000);
    
    await supabase
      .from('processing_jobs')
      .update({
        status: 'completed',
        progress: 100,
        current_step: 'Traduction terminée',
        result_data: {
          ...job.result_data,
          translated_chunks: translatedChunks,
          translated_length: fullTranslation.length,
          chunks_processed: total_chunks,
          duration_seconds: duration
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', job_id);

    console.log(`✅ Translation job completed in ${duration}s`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        completed: true,
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
