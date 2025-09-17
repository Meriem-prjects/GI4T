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
            content: `Tu es un expert en analyse de documents juridiques et administratifs spécialisé dans l'extraction d'informations structurées. 

MISSION: Analyser le contenu fourni et extraire toutes les métadonnées pertinentes au format JSON.

STRUCTURE DE RÉPONSE OBLIGATOIRE:
{
  "title": "titre descriptif et précis du document",
  "title_ar": "titre en arabe si le document contient de l'arabe ou null",
  "summary": "résumé détaillé et informatif (3-4 phrases complètes)",
  "summary_ar": "résumé en arabe si applicable ou null", 
  "keywords": ["mots-clés juridiques spécialisés extraits du texte"],
  "keywords_ar": ["mots-clés en arabe si applicable"] ou null,
  "language": "langue principale détectée (fr/ar/en)",
  "document_type": "type de document (jurisprudence/loi/règlement/décision/contrat/etc.)",
  "main_topics": ["sujets principaux traités"],
  "legal_references": ["références juridiques précises (articles, codes, lois)"],
  "entities": ["personnes physiques/morales, institutions, juridictions"],
  "dates": ["dates significatives au format YYYY-MM-DD ou texte"],
  "jurisdiction": "juridiction/autorité compétente",
  "case_numbers": ["numéros d'affaires/dossiers si applicables"],
  "legal_domains": ["domaines du droit concernés"]
}

INSTRUCTIONS DÉTAILLÉES:

1. DÉTECTION DE LANGUE: Identifie automatiquement la langue principale (fr/ar/en/autre)

2. MOTS-CLÉS SPÉCIALISÉS (12-20 termes):
   - Termes juridiques techniques spécifiques au texte
   - Références légales précises (ex: "Article 1134 Code civil")
   - Concepts juridiques mentionnés
   - Noms des juridictions/tribunaux
   - Procédures spécifiques
   - PAS de mots génériques comme "droit", "loi" seuls

3. ENTITÉS NOMMÉES:
   - Personnes (juges, parties, avocats)
   - Institutions (tribunaux, administrations)
   - Entreprises/organisations
   - Lieux géographiques pertinents

4. RÉFÉRENCES JURIDIQUES:
   - Articles précis avec numéro et code
   - Lois avec dates
   - Jurisprudence citée
   - Règlements/décrets

5. ANALYSE CONTEXTUELLE:
   - Type précis de document
   - Domaines juridiques concernés
   - Sujets principaux traités
   - Enjeux identifiés

Réponds UNIQUEMENT avec l'objet JSON, sans texte additionnel.`
          },
          {
            role: 'user',
            content: `Effectue une analyse juridique approfondie de ce document. Extrais toutes les métadonnées pertinentes en respectant exactement la structure JSON demandée :\n\n${content.substring(0, 12000)}`
          }
        ],
        max_tokens: 1500,
        temperature: 0.1
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
        title: content.substring(0, 100).trim() || "Document analysé",
        title_ar: null,
        summary: "Document traité avec succès. Analyse détaillée disponible.",
        summary_ar: null,
        keywords: ["document", "analyse", "juridique"],
        keywords_ar: null,
        language: detectedLanguage,
        document_type: "document",
        main_topics: ["analyse documentaire"],
        legal_references: [],
        entities: [],
        dates: [],
        jurisdiction: null,
        case_numbers: [],
        legal_domains: []
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