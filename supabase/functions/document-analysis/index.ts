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
          {
            role: 'system',
            content: `Tu es un assistant spécialisé dans l'analyse de documents juridiques. 
            Analyse le contenu fourni et extraits les informations suivantes en JSON :
            - title: Un titre descriptif et précis du document (maximum 100 caractères)
            - summary: Un résumé concis et informatif du contenu (2-4 phrases, maximum 300 caractères)
            - keywords: Une liste de mots-clés juridiques pertinents extraits du texte (8-15 mots-clés spécifiques)
            - language: La langue détectée du document (fr, ar, en, etc.)
            
            INSTRUCTIONS SPÉCIALES POUR LES MOTS-CLÉS:
            - Extrais UNIQUEMENT les mots-clés qui apparaissent réellement dans le texte
            - Privilégie les termes juridiques spécifiques, les références légales, les concepts de droit
            - Inclus les noms des juridictions, numéros d'arrêts, articles de loi mentionnés
            - Évite les mots génériques comme "droit", "loi", "article" sauf s'ils sont accompagnés de précisions
            - Formate les références légales (ex: "Article 123 du Code civil", "Cour de cassation")
            
            Réponds uniquement avec un objet JSON valide, sans texte supplémentaire.
            
            Format de réponse attendu:
            {
              "title": "Titre du document",
              "summary": "Résumé du contenu",
              "keywords": ["terme juridique 1", "Article 123", "Cour de cassation", "concept spécifique"],
              "language": "fr"
            }`
          },
          {
            role: 'user',
            content: `Analyse ce document juridique et extrais les métadonnées. Assure-toi d'identifier et d'extraire tous les mots-clés juridiques spécifiques présents dans le texte :\n\n${content.substring(0, 8000)}`
          }
        ],
        max_tokens: 800,
        temperature: 0.2
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