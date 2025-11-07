import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Split content into chunks at paragraph boundaries
function splitIntoChunks(text: string, chunkSize: number = 8000): string[] {
  const chunks: string[] = [];
  const paragraphs = text.split(/\n\n+/);
  
  let currentChunk = '';
  
  for (const paragraph of paragraphs) {
    if ((currentChunk + paragraph).length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = paragraph;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

// Translate content in chunks
async function translateInChunks(
  content: string,
  targetLanguage: string,
  apiKey: string,
  onProgress?: (current: number, total: number) => void
): Promise<string> {
  const chunks = splitIntoChunks(content, 8000);
  console.log(`📦 Split document into ${chunks.length} chunks`);
  
  const translatedChunks: string[] = [];
  
  for (let i = 0; i < chunks.length; i++) {
    console.log(`🔄 Translating chunk ${i + 1}/${chunks.length} (${chunks[i].length} chars)...`);
    
    if (onProgress) {
      onProgress(i + 1, chunks.length);
    }
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `Tu es un traducteur expert. Traduis EXACTEMENT le texte fourni en ${targetLanguage}. Ne résume pas, ne commente pas, traduis seulement. Garde la même structure et tous les détails.`
            },
            {
              role: "user",
              content: chunks[i]
            }
          ],
          temperature: 0.3,
          max_tokens: 12000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Translation API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const translated = data.choices?.[0]?.message?.content || '';
      translatedChunks.push(translated);
      console.log(`✅ Chunk ${i + 1} translated: ${translated.length} chars`);
      
    } catch (error) {
      console.error(`❌ Error translating chunk ${i + 1}:`, error);
      translatedChunks.push(`[Erreur de traduction du segment ${i + 1}]`);
    }
  }
  
  return translatedChunks.join('\n\n');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentId } = await req.json();

    if (!documentId) {
      throw new Error('documentId is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch document
    console.log(`📄 Fetching document ${documentId}...`);
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('content, language, translated_content')
      .eq('id', documentId)
      .single();

    if (docError || !document) {
      throw new Error(`Document not found: ${docError?.message}`);
    }

    const content = document.content;
    const sourceLanguage = document.language;
    const targetLanguage = sourceLanguage === 'ar' ? 'fr' : 'ar';

    console.log(`🌍 Translating from ${sourceLanguage} to ${targetLanguage}`);
    console.log(`📏 Content length: ${content?.length || 0} characters`);

    if (!content) {
      throw new Error('Document has no content to translate');
    }

    // Translate (with chunks if needed)
    const translatedContent = await translateInChunks(content, targetLanguage, openaiApiKey);

    console.log(`✅ Translation complete: ${translatedContent.length} chars`);

    // Update document
    const { error: updateError } = await supabase
      .from('documents')
      .update({ translated_content: translatedContent })
      .eq('id', documentId);

    if (updateError) {
      throw new Error(`Failed to update document: ${updateError.message}`);
    }

    console.log(`💾 Document ${documentId} updated successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        translatedLength: translatedContent.length,
        originalLength: content.length,
        ratio: (translatedContent.length / content.length).toFixed(2)
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('❌ Retranslate error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
