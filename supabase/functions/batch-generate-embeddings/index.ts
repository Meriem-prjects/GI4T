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
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { batchSize = 50, startFrom = 0 } = await req.json();

    console.log(`Starting batch embedding generation (batch size: ${batchSize}, offset: ${startFrom})`);

    // Fetch documents without embeddings
    const { data: documents, error: fetchError } = await supabase
      .from('documents')
      .select('id, title, title_ar, summary, summary_ar, content, keywords, keywords_ar')
      .eq('published', true)
      .is('embedding', null)
      .range(startFrom, startFrom + batchSize - 1);

    if (fetchError) {
      throw new Error(`Failed to fetch documents: ${fetchError.message}`);
    }

    if (!documents || documents.length === 0) {
      console.log('No documents to process');
      return new Response(
        JSON.stringify({ 
          message: 'No documents need embeddings',
          processed: 0,
          remaining: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${documents.length} documents`);

    let processedCount = 0;
    let errorCount = 0;

    // Process documents in smaller batches to avoid rate limits
    const processBatchSize = 10;
    for (let i = 0; i < documents.length; i += processBatchSize) {
      const batch = documents.slice(i, i + processBatchSize);
      
      await Promise.all(
        batch.map(async (doc) => {
          try {
            // Concatenate text for embedding
            const textToEmbed = [
              doc.title || '',
              doc.title_ar || '',
              doc.summary || '',
              doc.summary_ar || '',
              doc.content?.substring(0, 8000) || '',
              ...(doc.keywords || []),
              ...(doc.keywords_ar || []),
            ].filter(Boolean).join(' ');

            // Generate embedding
            const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${openAIApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'text-embedding-3-small',
                input: textToEmbed,
              }),
            });

            if (!embeddingResponse.ok) {
              console.error(`Failed to generate embedding for doc ${doc.id}`);
              errorCount++;
              return;
            }

            const embeddingData = await embeddingResponse.json();
            const embedding = embeddingData.data[0].embedding;

            // Update document
            const { error: updateError } = await supabase
              .from('documents')
              .update({ embedding })
              .eq('id', doc.id);

            if (updateError) {
              console.error(`Failed to update doc ${doc.id}:`, updateError);
              errorCount++;
            } else {
              processedCount++;
            }
          } catch (error) {
            console.error(`Error processing doc ${doc.id}:`, error);
            errorCount++;
          }
        })
      );

      // Small delay between batches to respect rate limits
      if (i + processBatchSize < documents.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Check remaining documents
    const { count: remainingCount } = await supabase
      .from('documents')
      .select('id', { count: 'exact', head: true })
      .eq('published', true)
      .is('embedding', null);

    console.log(`Batch complete: ${processedCount} processed, ${errorCount} errors, ${remainingCount || 0} remaining`);

    return new Response(
      JSON.stringify({ 
        processed: processedCount,
        errors: errorCount,
        remaining: remainingCount || 0,
        message: `Successfully processed ${processedCount} documents`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in batch embedding generation:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
