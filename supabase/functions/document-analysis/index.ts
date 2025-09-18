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

    const systemPrompt = `Tu es un assistant expert dans l'analyse approfondie de documents juridiques, administratifs et judiciaires. 

INSTRUCTIONS CRITIQUES:
1. Analyse complète du document fourni
2. Extraction de TOUTES les informations structurées importantes
3. Détection automatique de la langue (ar/fr/en)
4. Identification du type de document juridique
5. Extraction des entités, références légales, dates, numéros d'affaires

LANGUE ET CONTENU:
- Respecte la langue source du document
- Si arabe: utilise l'arabe pour résumé et mots-clés
- Si français: utilise le français
- Titre: dans la langue principale détectée
- Résumé: max 250 mots, synthétique et précis

MÉTADONNÉES JURIDIQUES À EXTRAIRE:
- Type de document (décision, loi, décret, contrat, etc.)
- Sujets principaux (max 10)
- Références légales (lois, articles, codes)
- Entités (personnes, organisations, juridictions)
- Dates importantes (format YYYY-MM-DD)
- Juridiction/tribunal competent
- Numéros d'affaires ou de dossiers
- Domaines juridiques (droit civil, pénal, etc.)

RÉPONSE OBLIGATOIRE EN JSON:
{
  "title": "titre principal extrait",
  "title_ar": "نفس العنوان بالعربية إن أمكن",
  "summary": "résumé détaillé",
  "summary_ar": "نفس الملخص بالعربية إن أمكن", 
  "keywords": ["mot-clé1", "mot-clé2", ...],
  "keywords_ar": ["كلمة مفتاحية1", "كلمة مفتاحية2", ...],
  "language": "ar/fr/en",
  "document_type": "type de document",
  "main_topics": ["sujet1", "sujet2", ...],
  "legal_references": ["référence1", "référence2", ...],
  "entities": ["entité1", "entité2", ...],
  "dates": ["2024-01-15", "2023-12-20", ...],
  "jurisdiction": "nom de la juridiction",
  "case_numbers": ["numéro1", "numéro2", ...],
  "legal_domains": ["domaine1", "domaine2", ...]
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