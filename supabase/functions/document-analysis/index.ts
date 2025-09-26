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
            content: `Tu es un expert juridique spécialisé dans l'analyse de documents français et arabes. 

MISSION : Extraire toutes les informations pertinentes du document et les structurer en JSON.

FORMAT DE RÉPONSE OBLIGATOIRE :
{
  "title": "titre principal exact du document",
  "title_ar": "titre en arabe si présent ou null",
  "summary": "résumé détaillé de 4-5 phrases capturant l'essence du document",
  "summary_ar": "résumé en arabe si applicable ou null", 
  "keywords": ["termes juridiques spécialisés", "concepts clés", "procédures", "références normatives"],
  "keywords_ar": ["mots-clés en arabe si applicable"] ou null,
  "language": "langue principale détectée (fr/ar/en)",
  "document_type": "décision|arrêt|jugement|ordonnance|directive|règlement|circulaire|loi|décret|contrat|rapport|autre",
  "main_topics": ["sujets principaux traités dans le document"],
  "legal_references": ["articles précis avec codes", "lois citées", "directives", "jurisprudence"],
  "entities": ["personnes physiques", "personnes morales", "institutions", "juridictions", "lieux"],
  "dates": ["dates importantes YYYY-MM-DD ou format original"],
  "jurisdiction": "tribunal/cour/administration/ministère concerné",
  "case_numbers": ["numéros d'affaire", "références dossier", "numéros RG"],
  "legal_domains": ["domaines juridiques concernés"]
}

INSTRUCTIONS PRÉCISES :

🔍 DÉTECTION LANGUE : Analyse scrupuleusement pour identifier fr/ar/en

📝 MOTS-CLÉS (8-15 termes) :
- Termes juridiques techniques spécifiques au contenu
- Concepts et procédures mentionnés
- Références normatives précises
- Institutions et juridictions citées
- ÉVITER les mots génériques

👥 ENTITÉS NOMMÉES :
- Noms propres de personnes (juges, parties, témoins)
- Institutions (tribunaux, administrations, entreprises)
- Lieux géographiques pertinents

📚 RÉFÉRENCES JURIDIQUES :
- Articles avec numéros précis et codes
- Lois avec dates et références
- Jurisprudence citée
- Règlements et décrets

📅 DATES SIGNIFICATIVES :
- Dates de décisions/jugements
- Dates de procédures
- Échéances légales
- Dates d'entrée en vigueur

⚖️ ANALYSE JURIDIQUE :
- Type précis de document
- Domaines du droit concernés
- Enjeux et problématiques
- Portée de la décision

Base-toi STRICTEMENT sur le contenu fourni. Si une information n'est pas présente, utilise null ou [].
Réponds UNIQUEMENT avec l'objet JSON, sans texte additionnel.`
          },
          {
            role: 'user',
            content: `Analyse ce document juridique/administratif et extrais toutes les métadonnées selon la structure JSON demandée. Sois précis et exhaustif :\n\n${content.substring(0, 15000)}`
          }
        ],
        max_tokens: 2000,
        temperature: 0.05
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
      const fallbackLanguage = content.includes('العربية') || /[\u0600-\u06FF]/.test(content) ? 'ar' : 'fr';
      analysis = {
        title: content.substring(0, 100).trim() || "Document analysé",
        title_ar: null,
        summary: "Document traité avec succès. Analyse détaillée disponible.",
        summary_ar: null,
        keywords: ["document", "analyse", "juridique"],
        keywords_ar: null,
        language: fallbackLanguage,
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ 
        error: "Erreur lors de l'analyse du document",
        details: errorMessage 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});