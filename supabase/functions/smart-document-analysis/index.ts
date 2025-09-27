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

  try {
    const { content, currentLanguage = 'fr' } = await req.json();

    console.log('Starting smart document analysis for content length:', content?.length);

    if (!content) {
      throw new Error('Content is required for analysis');
    }

    // Fetch available options from database for intelligent matching
    const [categoriesData, documentTypesData, courtTypesData, jurisdictionLevelsData] = await Promise.all([
      supabase.from('categories').select('id, name, name_ar, description, description_ar').order('name'),
      supabase.from('document_types').select('id, name, name_ar, description, description_ar').order('name'),
      supabase.from('court_types').select('id, name, name_ar, description, description_ar').order('name'),
      supabase.from('jurisdiction_levels').select('id, name, name_ar, description, description_ar, level_order').order('level_order')
    ]);

    const categories = categoriesData.data || [];
    const documentTypes = documentTypesData.data || [];
    const courtTypes = courtTypesData.data || [];
    const jurisdictionLevels = jurisdictionLevelsData.data || [];

    console.log('Loaded options for matching:', {
      categories: categories.length,
      documentTypes: documentTypes.length,
      courtTypes: courtTypes.length,
      jurisdictionLevels: jurisdictionLevels.length
    });

    // Use currentLanguage as absolute primary language (no auto-detection)
    const isPrimaryArabic = currentLanguage === 'ar';
    const targetLanguage = isPrimaryArabic ? 'français' : 'arabe';
    const sourceLanguage = isPrimaryArabic ? 'arabe' : 'français';

    // Build available options text for AI matching
    const categoriesText = categories.map(c => `${c.name}${c.name_ar ? ` (${c.name_ar})` : ''} - ${c.description || ''}`).join('\n');
    const documentTypesText = documentTypes.map(dt => `${dt.name}${dt.name_ar ? ` (${dt.name_ar})` : ''} - ${dt.description || ''}`).join('\n');
    const courtTypesText = courtTypes.map(ct => `${ct.name}${ct.name_ar ? ` (${ct.name_ar})` : ''} - ${ct.description || ''}`).join('\n');
    const jurisdictionLevelsText = jurisdictionLevels.map(jl => `${jl.name}${jl.name_ar ? ` (${jl.name_ar})` : ''} - ${jl.description || ''}`).join('\n');

    const systemPrompt = `Tu es un expert en analyse de documents juridiques et administratifs bilingues (français/arabe). 
    
    Analyse ce document et extrait les informations suivantes avec précision :

    IMPORTANT: 
    - Tous les champs principaux (title, subtitle, assignedRight, summary, existingKeywords, suggestedKeywords, metadata) doivent être en ${sourceLanguage}
    - Tous les champs traduits (translatedTitle, translatedSummary, translatedKeywords, translatedContent, metadataTranslated) doivent être en ${targetLanguage}
    - Le champ translatedContent doit préserver EXACTEMENT la structure et les sauts de ligne du document original
    - Le champ cleanedContent doit supprimer les numéros de pages isolés (lignes contenant uniquement des chiffres)

    RÈGLES DE DÉTECTION DES MÉTADONNÉES :
    - AUTEUR : Recherche dans les 5 premières lignes du document
    - TITRE : Recherche sous le "numéro 1" de la première page, sinon prendre un titre contextuel approprié
    - TRIBUNAL : Identifie le tribunal mentionné et son niveau de juridiction (première instance, appel, cassation, etc.)
    - NUMÉRO D'AFFAIRE : Patterns comme "n° [chiffres]/[année]" ou similaires
    - DEMANDEUR : Nom qui précède le "/" après le numéro d'affaire
    - DÉFENDEUR : Nom qui suit le "/" après le numéro d'affaire
    - ANNÉE : Extrait l'année du document ou de la décision
    - NIVEAU TRIBUNAL : Détermine le niveau (première instance, appel, cassation, administratif, etc.)

    NETTOYAGE DU CONTENU :
    - Supprime les lignes contenant uniquement des numéros de pages
    - Préserve la structure et les sauts de ligne du document
    - Garde tout le contenu juridique pertinent

    CLASSIFICATION AUTOMATIQUE :
    Analyse le contenu et détermine la meilleure correspondance avec les options disponibles :

    CATÉGORIES DISPONIBLES :
    ${categoriesText}

    TYPES DE DOCUMENTS DISPONIBLES :
    ${documentTypesText}

    TYPES DE TRIBUNAUX DISPONIBLES :
    ${courtTypesText}

    NIVEAUX DE JURIDICTION DISPONIBLES :
    ${jurisdictionLevelsText}

    1. TITRE : Identifie le titre principal en ${sourceLanguage}
    2. SOUS-TITRE : Le sous-titre ou contexte en ${sourceLanguage}
    3. DROIT ASSIGNÉ : Le droit spécifique mentionné en ${sourceLanguage}
    4. RÉSUMÉ : Génère un résumé en exactement 4 phrases en ${sourceLanguage}
    5. MOTS-CLÉS EXISTANTS : Extrait les mots-clés existants en ${sourceLanguage}
    6. MOTS-CLÉS SUGGÉRÉS : Propose 5-8 mots-clés pertinents en ${sourceLanguage}
    7. MÉTADONNÉES : Extrait auteur, tribunal, numéro d'affaire, demandeur, défendeur, année, niveau tribunal en ${sourceLanguage}
    8. CONTENU NETTOYÉ : Contenu sans numéros de pages isolés en ${sourceLanguage}
    9. TRADUCTION COMPLÈTE : Traduis tout le contenu nettoyé en ${targetLanguage}
    10. MÉTADONNÉES TRADUITES : Traduis toutes les métadonnées en ${targetLanguage}
    11. LANGUE DÉTECTÉE : Confirme "${sourceLanguage}"
    12. CLASSIFICATION : Détermine la meilleure catégorie, type de document, type de tribunal et niveau de juridiction qui correspondent au contenu analysé

    Réponds uniquement en JSON valide avec cette structure exacte :
    {
      "title": "titre en ${sourceLanguage}",
      "subtitle": "sous-titre en ${sourceLanguage}",
      "assignedRight": "droit assigné en ${sourceLanguage}",
      "summary": "résumé 4 phrases en ${sourceLanguage}",
      "existingKeywords": ["mots-clés existants en ${sourceLanguage}"],
      "suggestedKeywords": ["mots-clés suggérés en ${sourceLanguage}"],
      "metadata": {
        "author": "auteur en ${sourceLanguage}",
        "court": "tribunal en ${sourceLanguage}",
        "case_number": "numéro d'affaire",
        "plaintiff": "demandeur en ${sourceLanguage}",
        "defendant": "défendeur en ${sourceLanguage}",
        "year": année_numérique,
        "court_level": "niveau tribunal en ${sourceLanguage}"
      },
      "cleanedContent": "contenu nettoyé en ${sourceLanguage}",
      "translatedTitle": "titre traduit en ${targetLanguage}",
      "translatedSummary": "résumé traduit en ${targetLanguage}",
      "translatedKeywords": ["mots-clés traduits en ${targetLanguage}"],
      "translatedContent": "contenu complet traduit en ${targetLanguage}",
      "metadataTranslated": {
        "author": "auteur en ${targetLanguage}",
        "court": "tribunal en ${targetLanguage}",
        "plaintiff": "demandeur en ${targetLanguage}",
        "defendant": "défendeur en ${targetLanguage}",
        "court_level": "niveau tribunal en ${targetLanguage}"
      },
      "language": "${sourceLanguage}",
      "detectedPatterns": {
        "case_pattern": "pattern détecté pour le numéro d'affaire",
        "court_pattern": "pattern détecté pour le tribunal"
      },
      "suggestions": {
        "suggestedCategory": "nom exact de la catégorie la plus appropriée parmi les options disponibles",
        "suggestedDocumentType": "nom exact du type de document le plus approprié parmi les options disponibles",
        "suggestedCourtType": "nom exact du type de tribunal le plus approprié parmi les options disponibles",
        "suggestedJurisdictionLevel": "nom exact du niveau de juridiction le plus approprié parmi les options disponibles",
        "confidence": {
          "category": score_de_confiance_0_à_1,
          "documentType": score_de_confiance_0_à_1,
          "courtType": score_de_confiance_0_à_1,
          "jurisdictionLevel": score_de_confiance_0_à_1
        }
      }
    }`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyse ce document:\n\n${content}` }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI response received:', aiResponse.substring(0, 200) + '...');

    let analysisResult;
    try {
      // Parse the JSON response directly (since we forced json_object format)
      analysisResult = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Raw AI response:', aiResponse);
      throw new Error('Failed to parse AI response as JSON');
    }

    // Validate required fields
    const requiredFields = ['title', 'summary', 'language', 'translatedContent'];
    for (const field of requiredFields) {
      if (!analysisResult[field]) {
        console.warn(`Missing required field: ${field}`);
      }
    }

    // Intelligent matching logic to find best matches by ID
    const findBestMatch = (suggestions: any, options: any[], field: string) => {
      if (!suggestions || !suggestions[field]) return null;
      
      const suggestionText = suggestions[field].toLowerCase();
      
      // Try exact match first
      let match = options.find(option => 
        option.name.toLowerCase() === suggestionText ||
        (option.name_ar && option.name_ar.toLowerCase() === suggestionText)
      );
      
      // If no exact match, try partial match
      if (!match) {
        match = options.find(option => 
          option.name.toLowerCase().includes(suggestionText) ||
          (option.name_ar && option.name_ar.toLowerCase().includes(suggestionText)) ||
          suggestionText.includes(option.name.toLowerCase()) ||
          (option.name_ar && suggestionText.includes(option.name_ar.toLowerCase()))
        );
      }
      
      return match ? match.id : null;
    };

    // Find matching IDs for suggestions
    const suggestionIds = {
      categoryId: findBestMatch(analysisResult.suggestions, categories, 'suggestedCategory'),
      documentTypeId: findBestMatch(analysisResult.suggestions, documentTypes, 'suggestedDocumentType'),
      courtTypeId: findBestMatch(analysisResult.suggestions, courtTypes, 'suggestedCourtType'),
      jurisdictionLevelId: findBestMatch(analysisResult.suggestions, jurisdictionLevels, 'suggestedJurisdictionLevel')
    };

    console.log('Analysis completed successfully');
    console.log('Suggestion matching results:', suggestionIds);

    return new Response(JSON.stringify({
      success: true,
      analysis: analysisResult,
      suggestionIds,
      metadata: {
        sourceLanguage,
        targetLanguage,
        contentLength: content.length,
        processedAt: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in smart-document-analysis function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});