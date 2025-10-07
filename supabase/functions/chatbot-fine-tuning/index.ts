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
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action } = await req.json();

    if (action === 'train') {
      // Récupérer tous les documents d'apprentissage actifs
      const { data: trainingDocs, error: docsError } = await supabase
        .from('chatbot_training_documents')
        .select('title, content')
        .eq('is_active', true);

      if (docsError) throw docsError;

      if (!trainingDocs || trainingDocs.length === 0) {
        return new Response(
          JSON.stringify({ error: 'No training documents available' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Préparer les données de fine-tuning au format JSONL
      const trainingData = trainingDocs.map(doc => ({
        messages: [
          {
            role: "system",
            content: "Vous êtes un assistant juridique spécialisé dans l'accès aux droits en Tunisie. Répondez de manière claire et professionnelle."
          },
          {
            role: "user",
            content: `Informations sur: ${doc.title}`
          },
          {
            role: "assistant",
            content: doc.content
          }
        ]
      }));

      // Créer un fichier JSONL pour OpenAI
      const jsonlContent = trainingData.map(item => JSON.stringify(item)).join('\n');
      
      // Uploader le fichier vers OpenAI
      const uploadResponse = await fetch('https://api.openai.com/v1/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
        },
        body: (() => {
          const formData = new FormData();
          const blob = new Blob([jsonlContent], { type: 'application/jsonl' });
          formData.append('file', blob, 'training_data.jsonl');
          formData.append('purpose', 'fine-tune');
          return formData;
        })(),
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('OpenAI upload error:', errorText);
        throw new Error(`Failed to upload training file: ${errorText}`);
      }

      const uploadResult = await uploadResponse.json();
      console.log('File uploaded:', uploadResult);

      // Créer un job de fine-tuning
      const fineTuneResponse = await fetch('https://api.openai.com/v1/fine_tuning/jobs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          training_file: uploadResult.id,
          model: 'gpt-4o-mini-2024-07-18',
          suffix: 'acces-droits-assistant',
        }),
      });

      if (!fineTuneResponse.ok) {
        const errorText = await fineTuneResponse.text();
        console.error('OpenAI fine-tune error:', errorText);
        throw new Error(`Failed to create fine-tuning job: ${errorText}`);
      }

      const fineTuneResult = await fineTuneResponse.json();
      console.log('Fine-tuning job created:', fineTuneResult);

      return new Response(
        JSON.stringify({
          success: true,
          jobId: fineTuneResult.id,
          status: fineTuneResult.status,
          message: 'Fine-tuning job started successfully'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in chatbot-fine-tuning:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
