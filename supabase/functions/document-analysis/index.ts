import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, language } = await req.json();

    if (!content) {
      return new Response(
        JSON.stringify({ error: "Le contenu du document est requis" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing document content, length:', content.length);

    // Detect language if not provided
    const detectedLanguage = language || 'ar'; // Default to Arabic

    const systemPrompt = `Tu es un assistant spécialisé dans l'analyse de documents juridiques et administratifs. 
    Tu dois extraire le titre principal, créer un résumé et identifier les mots-clés du document fourni.
    
    Instructions:
    1. Extrait le titre principal du document (le plus pertinent et descriptif)
    2. Crée un résumé concis en ${detectedLanguage === 'ar' ? 'arabe' : 'français'} (max 200 mots)
    3. Extrait les mots-clés les plus importants (entre 8-15 mots-clés)
    4. Respecte la langue du document original pour les mots-clés et le résumé
    5. Focusse sur les termes juridiques, concepts clés et thématiques principales
    
    Réponds UNIQUEMENT en format JSON avec cette structure:
    {
      "title": "titre extrait",
      "summary": "résumé du document",
      "keywords": ["mot-clé1", "mot-clé2", "mot-clé3"],
      "language": "code langue détectée (ar/fr/en)"
    }`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyse ce document:\n\n${content}` }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`Erreur OpenAI API: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('OpenAI response:', aiResponse);

    // Parse the JSON response
    let analysis;
    try {
      analysis = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Fallback if JSON parsing fails
      analysis = {
        title: "Document sans titre",
        summary: "Résumé non disponible - erreur de traitement",
        keywords: [],
        language: detectedLanguage
      };
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in document-analysis function:', error);
    return new Response(
      JSON.stringify({ 
        error: "Erreur lors de l'analyse du document",
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});