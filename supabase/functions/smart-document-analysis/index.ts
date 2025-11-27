import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { sanitizeArabicText } from '../_shared/utils.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to parse keywords that might come as a single string or array
function parseKeywordsArray(keywords: any): string[] {
  if (!keywords) return [];
  
  // If it's already an array, process each element
  if (Array.isArray(keywords)) {
    return keywords.flatMap(k => {
      if (typeof k === 'string') {
        // Check if it contains separators (comma, semicolon, pipe)
        if (k.includes(',') || k.includes(';') || k.includes('|')) {
          return k.split(/[,;|]/).map(item => item.trim()).filter(item => item);
        }
        return [k.trim()].filter(item => item);
      }
      return [];
    });
  }
  
  // If it's a string, split it
  if (typeof keywords === 'string') {
    return keywords.split(/[,;|]/).map(item => item.trim()).filter(item => item);
  }
  
  return [];
}

// Helper to extract content including bibliography (at the end of documents)
function extractContentWithBibliography(content: string, isAnalysis: boolean, limit: number = 12000): string {
  if (content.length <= limit) return content;
  
  if (isAnalysis) {
    // For analysis documents: include 60% from start + 40% from end (for bibliography)
    const startChars = Math.floor(limit * 0.6);
    const endChars = Math.floor(limit * 0.4);
    
    const start = content.slice(0, startChars);
    const end = content.slice(-endChars);
    
    return `${start}\n\n[... contenu intermédiaire omis pour limiter la taille ...]\n\n${end}`;
  }
  
  // For other documents, keep current behavior
  return content.slice(0, limit);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Handle health check GET requests
  if (req.method === 'GET') {
    return new Response(
      JSON.stringify({ ok: true, service: 'smart-document-analysis', timestamp: new Date().toISOString() }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { textualMetadata, content, translatedContent, currentLanguage = 'fr', mode = 'quick', documentId, documentFileName, documentType } = await req.json();

    console.log('Starting smart document analysis for content length:', content?.length);
    console.log('Translated content length:', translatedContent?.length);
    console.log('Textual metadata length:', textualMetadata?.length);
    console.log('Analysis mode:', mode);
    console.log('Document type:', documentType);

    if (!content) {
      throw new Error('Content is required for analysis');
    }

    const isAnalysisDocument = documentType === 'Analyses juridiques' || 
                               documentType === 'Fiche d\'analyse';

    // Start exhaustive translation in parallel for long documents
    let translatedContentFull = '';
    const isPrimaryArabic = currentLanguage === 'ar';
    const targetLanguage = isPrimaryArabic ? 'français' : 'arabe';
    const sourceLanguage = isPrimaryArabic ? 'arabe' : 'français';
    
    // Mode 'quick': skip exhaustive translation, limit content for AI
    // Mode 'full': use exhaustive translation for smaller documents only
    const MAX_CONTENT_LENGTH_FOR_FULL = 15000; // ~12-15k characters max for full sync translation
    
    if (mode === 'full' && content.length > MAX_CONTENT_LENGTH_FOR_FULL) {
      console.log(`📋 Document too long for sync translation (${content.length} chars), launching async job...`);
      
      // Diviser en chunks de 5000 caractères
      const CHUNK_SIZE = 5000;
      const chunks: string[] = [];
      
      for (let i = 0; i < content.length; i += CHUNK_SIZE) {
        chunks.push(content.slice(i, i + CHUNK_SIZE));
      }

      console.log(`📦 Created ${chunks.length} chunks for async translation`);
      
      // Créer un job de traduction asynchrone avec tous les chunks stockés
      const { data: job, error: jobError } = await supabase
        .from('processing_jobs')
        .insert({
          file_name: documentFileName || 'document',
          file_size: content.length,
          status: 'processing',
          progress: 0,
          current_step: 'Démarrage de la traduction',
          total_pages: chunks.length,
          result_data: {
            chunks: chunks,
            translated_chunks: [],
            source_language: currentLanguage,
            target_language: targetLanguage
          }
        })
        .select()
        .single();
      
      if (jobError) {
        console.error('Failed to create translation job:', jobError);
        throw new Error('Failed to create translation job');
      }
      
      console.log(`✅ Created job ${job.id} for document ${documentId} with ${chunks.length} chunks`);
      
      // Lier le job au document si documentId fourni
      if (documentId) {
        const { error: linkError } = await supabase
          .from('documents')
          .update({ processing_job_id: job.id })
          .eq('id', documentId);
        
        if (linkError) {
          console.warn('Failed to link job to document:', linkError);
        }
      }
      
      // Déclencher le premier chunk en arrière-plan
      console.log('🚀 Triggering first chunk translation...');
      fetch(`${supabaseUrl}/functions/v1/async-full-translation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          document_id: documentId,
          job_id: job.id,
          chunk_index: 0,
          total_chunks: chunks.length,
          source_language: currentLanguage,
          target_language: targetLanguage
        })
      }).catch(err => console.error('❌ Error triggering first chunk:', err));
      
      // Retourner immédiatement
      return new Response(
        JSON.stringify({ 
          success: true,
          mode: 'full_async',
          job_id: job.id,
          total_chunks: chunks.length,
          message: 'Traduction intégrale lancée en arrière-plan',
          estimated_duration_minutes: Math.ceil(chunks.length * 0.5)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (mode === 'full' && content.length > 2000) {
      console.log('📖 Starting exhaustive translation by chunks (full mode)...');
      translatedContentFull = await translateInChunks(content, targetLanguage);
      console.log('✅ Full translation completed:', translatedContentFull.length, 'characters');
    } else if (mode === 'quick') {
      console.log('⚡ Quick mode: skipping exhaustive translation');
    } else {
      // For shorter content, translate inline in AI request to keep latency low
      console.log('Content is short enough for inline translation');
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

    // For analysis documents with translated content, combine both for comprehensive analysis
    let fullContentForAnalysis = content;
    
    if (isAnalysisDocument && translatedContent && translatedContent.trim() !== '') {
      // Combine original + translated to ensure AI has access to bibliography at the end
      fullContentForAnalysis = `
=== CONTENU ORIGINAL (${sourceLanguage}) ===
${content}

=== CONTENU TRADUIT (${targetLanguage}) ===
${translatedContent}
`;
      console.log('📚 Using combined original + translated content for analysis document');
      console.log('Combined content length:', fullContentForAnalysis.length);
    }

    // Use intelligent extraction that includes the end of document (for bibliography)
    const contentForAI = mode === 'quick' 
      ? extractContentWithBibliography(fullContentForAnalysis, isAnalysisDocument, 18000)
      : fullContentForAnalysis;
    
    const contentTruncated = mode === 'quick' && fullContentForAnalysis.length > 18000;
    
    if (contentTruncated) {
      console.log(`⚡ Quick mode: analyzing ${contentForAI.length} characters (with bibliography) of ${fullContentForAnalysis.length} total`);
    }
    
    const systemPrompt = isAnalysisDocument 
      ? `Tu es un expert en analyse de documents juridiques tunisiens. Analyse le contenu suivant (TYPE: FICHE D'ANALYSE) et extrait les informations demandées en JSON.

LANGUE DU DOCUMENT SOURCE: ${sourceLanguage}
LANGUE CIBLE POUR LES TRADUCTIONS: ${targetLanguage}

⚠️ RÈGLE ABSOLUE SUR LES TRADUCTIONS:
- Si le document source est en ${sourceLanguage}, les champs "title", "subtitle", "summary", "metadata" doivent être en ${sourceLanguage}
- Les champs "translatedTitle", "translatedSubtitle", "translatedSummary", "metadataTranslated" doivent être EXCLUSIVEMENT en ${targetLanguage}
- Si targetLanguage est "arabe", tu DOIS écrire en caractères arabes (Unicode U+0600 à U+06FF)
- Si targetLanguage est "français", tu DOIS écrire en caractères latins

⚠️ RÈGLE ABSOLUE SUR LES MOTS-CLÉS:
- "existingKeywords" doit être un tableau de chaînes en ${sourceLanguage}
- "translatedKeywords" doit être un tableau de chaînes en ${targetLanguage}
- Chaque mot-clé doit être une chaîne séparée dans le tableau
- Exemple correct: ["mot1", "mot2", "mot3"]

FICHE D'ANALYSE - CHAMPS SPÉCIFIQUES À EXTRAIRE:
1. TITRE: Extrais le thème principal/titre de l'analyse depuis les métadonnées ou le contenu
2. AUTEUR: Nom de l'auteur de l'analyse (OBLIGATOIRE - privilégier "مرصد الحقوق الأساسية" si présent)
3. DATE DE VALIDATION: Date de validation du document (si présente)
4. RÉFÉRENCES LÉGALES: Liste des textes juridiques, lois, articles cités (Constitution, codes, conventions internationales, etc.)
5. BIBLIOGRAPHIE: Sources et références bibliographiques citées à la fin du document
   ⚠️ IMPORTANT BIBLIOGRAPHIE: Cherche spécifiquement les sections avec ces marqueurs:
   - "قائمة في بعض المراجع" (Liste de quelques références)
   - "المراجع" (Références)
   - "قائمة المراجع" (Liste des références)
   - "Bibliographie" ou "Références bibliographiques"
   La bibliographie se trouve généralement à la FIN du document.
6. RÉSUMÉ: Génère un résumé synthétique du contenu de l'analyse
7. MOTS-CLÉS: Extrais ou génère des mots-clés pertinents pour l'analyse

⚠️ IMPORTANT: Pour une FICHE D'ANALYSE, ne cherche PAS d'informations sur tribunal, numéro d'affaire, demandeur, défendeur, etc.

Catégories disponibles:
${categories.map(cat => `- ${cat.name} (${cat.name_ar})`).join('\n')}

${mode === 'quick' 
  ? `⚠️ MODE RAPIDE: Pour "translatedContent", fournis UNIQUEMENT un court extrait traduit (200-300 mots max) du début du document.` 
  : `Pour "translatedContent", traduis le contenu complet du document en ${targetLanguage}.`}

Réponds uniquement en JSON valide avec cette structure exacte :
{
  "title": "titre principal de l'analyse",
  "subtitle": "sous-titre contextuel (optionnel)", 
  "translatedTitle": "traduction complète du titre en ${targetLanguage}",
  "translatedSubtitle": "traduction complète du sous-titre en ${targetLanguage}",
  "summary": "résumé de l'analyse en ${sourceLanguage}",
  "translatedSummary": "traduction complète du résumé en ${targetLanguage}",
  "existingKeywords": ["mots-clés trouvés dans le document"],
  "suggestedKeywords": ["nouveaux mots-clés pertinents"],
  "translatedKeywords": ["traduction complète des mots-clés en ${targetLanguage}"],
  "metadata": {
    "author": "nom de l'auteur de l'analyse (OBLIGATOIRE)",
    "validation_date": "date de validation si présente (format YYYY-MM-DD)",
    "legal_references": ["référence légale 1", "référence légale 2"],
    "bibliography": "texte complet de la bibliographie"
  },
  "metadataTranslated": {
    "author": "traduction complète de l'auteur en ${targetLanguage}",
    "legal_references": ["traduction référence 1", "traduction référence 2"],
    "bibliography": "traduction complète de la bibliographie en ${targetLanguage}"
  },
  "textualMetadataTranslated": "TRADUCTION COMPLÈTE EN ${targetLanguage} DES MÉTADONNÉES TEXTUELLES",
  "translatedContent": "${mode === 'quick' ? 'EXTRAIT TRADUIT (200-300 mots)' : 'TRADUCTION COMPLÈTE'}",
  "language": "${sourceLanguage}",
  "suggestions": {
    "suggestedCategory": "nom exact de la catégorie la plus appropriée",
    "suggestedDocumentType": "Fiche d'analyse"
  }
}`
      : `Tu es un expert en analyse de documents juridiques tunisiens. Analyse le contenu suivant (TYPE: FICHE DE JURISPRUDENCE) et extrait les informations demandées en JSON.

LANGUE DU DOCUMENT SOURCE: ${sourceLanguage}
LANGUE CIBLE POUR LES TRADUCTIONS: ${targetLanguage}

⚠️ RÈGLE ABSOLUE SUR LES TRADUCTIONS:
- Si le document source est en ${sourceLanguage}, les champs "title", "subtitle", "summary", "metadata" doivent être en ${sourceLanguage}
- Les champs "translatedTitle", "translatedSubtitle", "translatedSummary", "metadataTranslated" doivent être EXCLUSIVEMENT en ${targetLanguage}
- Si targetLanguage est "arabe", tu DOIS écrire en caractères arabes (Unicode U+0600 à U+06FF)
- Si targetLanguage est "français", tu DOIS écrire en caractères latins

⚠️ RÈGLE ABSOLUE SUR LES MOTS-CLÉS:
- "existingKeywords" doit être un tableau de chaînes en ${sourceLanguage}
- "translatedKeywords" doit être un tableau de chaînes en ${targetLanguage}
- Chaque mot-clé doit être une chaîne séparée dans le tableau
- NE PAS mettre tous les mots-clés dans une seule chaîne séparée par des virgules
- Exemple correct: ["mot1", "mot2", "mot3"]
- Exemple INCORRECT: ["mot1, mot2, mot3"]

IMPORTANTES INSTRUCTIONS POUR L'EXTRACTION DEPUIS LES MÉTADONNÉES TEXTUELLES:
1. NE MODIFIE PAS le contenu original du document - garde-le intact
2. TRADUIS RÉELLEMENT tout le contenu en ${targetLanguage} - ne retourne jamais de descriptions ou placeholders

RÈGLES D'EXTRACTION SPÉCIFIQUES:

EXTRACTION DEPUIS LES MÉTADONNÉES TEXTUELLES:
3. TITRE: Extrais le titre principal depuis les métadonnées textuelles (généralement après "المشكل القانوني" ou "المشكل" ou dans la première ligne significative)
4. SOUS-TITRE: Extrais le sous-titre depuis les métadonnées textuelles (généralement la ligne qui suit le titre principal ou après "الحل المقدم")  
5. AUTEUR: Cherche le premier nom propre qui apparaît dans les métadonnées textuelles. Si "مرصد الحقوق الأساسية" est présent, utilise-le. Sinon, utilise le premier nom de personne trouvé.
6. TRIBUNAL: Extrais depuis les métadonnées textuelles
7. CASE_NUMBER: Extrais depuis les métadonnées textuelles  
8. YEAR: Extrais depuis les métadonnées textuelles
9. COURT_LEVEL: Extrais depuis les métadonnées textuelles
10. MOTS-CLÉS: Extrais UNIQUEMENT et LITTÉRALEMENT ce qui suit "اﻟﻜﻠﻤﺎت اﻟﻤﻔﺎﺗﯿﺢ" dans les métadonnées textuelles (pas de génération IA)
11. DEMANDEUR: Extrais depuis les métadonnées textuelles
12. DÉFENDEUR: Extrais depuis les métadonnées textuelles

EXTRACTION DEPUIS LE CONTENU PRINCIPAL:
13. RÉSUMÉ: Génère un résumé synthétique depuis le contenu principal du document

Catégories disponibles:
${categories.map(cat => `- ${cat.name} (${cat.name_ar})`).join('\n')}

Types de documents disponibles:
${documentTypes.map(type => `- ${type.name} (${type.name_ar})`).join('\n')}

Types de tribunaux disponibles:
${courtTypes.map(court => `- ${court.name} (${court.name_ar})`).join('\n')}

Niveaux de juridiction disponibles:
${jurisdictionLevels.map(level => `- ${level.name} (${level.name_ar})`).join('\n')}

TÂCHES À ACCOMPLIR:
1. TITRES ET SOUS-TITRES: Utilise à la fois les métadonnées textuelles ET le contenu principal pour proposer un titre et un sous-titre pertinents et informatifs
2. Pour les mots-clés: extrais LITTÉRALEMENT uniquement ce qui suit "اﻟﻜﻠﻤﺎت اﻟﻤﻔﺎﺗﯿﺢ" (pas de génération IA)
3. Extrais auteur, tribunal, case_number, year, court_level, demandeur, défendeur DEPUIS LES MÉTADONNÉES TEXTUELLES uniquement
4. Extrais le résumé depuis le contenu principal du document
5. Traduis COMPLÈTEMENT le contenu entier du document en ${targetLanguage}
6. Traduis les métadonnées textuelles extraites en ${targetLanguage}
7. Fournis les suggestions de catégories basées sur le contenu

STRATÉGIE POUR TITRE ET SOUS-TITRE:
- Analyse d'abord les métadonnées textuelles pour identifier les éléments de base
- Enrichis avec le contenu principal pour créer des titres plus informatifs et contextuels
- Assure-toi que le titre reflète l'essence juridique du document
- Le sous-titre doit compléter le titre avec des informations spécifiques (cour, date, parties, etc.)

IMPORTANT: Les champs "textualMetadataTranslated" et "translatedContent" doivent contenir les VRAIES TRADUCTIONS, pas des descriptions !

${mode === 'quick' 
  ? `⚠️ MODE RAPIDE: Pour "translatedContent", fournis UNIQUEMENT un court extrait traduit (200-300 mots max) du début du document, pas la traduction complète.` 
  : `Pour "translatedContent", traduis le contenu complet du document en ${targetLanguage}.`}

Réponds uniquement en JSON valide avec cette structure exacte :
{
  "title": "titre principal proposé en analysant les métadonnées textuelles ET le contenu principal",
  "subtitle": "sous-titre proposé en analysant les métadonnées textuelles ET le contenu principal", 
  "translatedTitle": "traduction complète du titre en ${targetLanguage}",
  "translatedSubtitle": "traduction complète du sous-titre en ${targetLanguage}",
  "summary": "résumé du document en ${sourceLanguage}",
  "translatedSummary": "traduction complète du résumé en ${targetLanguage}",
  "existingKeywords": ["mots-clés trouvés dans le document"],
  "suggestedKeywords": ["nouveaux mots-clés pertinents"],
  "translatedKeywords": ["traduction complète des mots-clés en ${targetLanguage}"],
  "metadata": {
    "author": "premier nom propre trouvé dans les métadonnées textuelles (privilégier 'مرصد الحقوق الأساسية' si présent)",
    "court": "tribunal mentionné dans le document",
    "case_number": "numéro d'affaire trouvé",
     "plaintiff": "demandeur mentionné dans les métadonnées textuelles",
     "defendant": "défendeur mentionné dans les métadonnées textuelles",
    "year": année_trouvée_dans_le_document,
    "court_level": "niveau de tribunal identifié"
  },
  "metadataTranslated": {
    "author": "traduction complète de l'auteur en ${targetLanguage}",
    "court": "traduction complète du tribunal en ${targetLanguage}",
    "plaintiff": "traduction complète du demandeur en ${targetLanguage}",
    "defendant": "traduction complète du défendeur en ${targetLanguage}",
    "court_level": "traduction complète du niveau de tribunal en ${targetLanguage}"
  },
  "textualMetadataTranslated": "TRADUCTION COMPLÈTE EN ${targetLanguage} DES MÉTADONNÉES TEXTUELLES EXTRAITES",
  "translatedContent": "${mode === 'quick' ? 'EXTRAIT TRADUIT (200-300 mots) du début du document en ' + targetLanguage : 'TRADUCTION COMPLÈTE EN ' + targetLanguage + ' DE TOUT LE CONTENU DU DOCUMENT'}",
  "language": "${sourceLanguage}",
  "suggestions": {
    "suggestedCategory": "nom exact de la catégorie la plus appropriée",
    "suggestedDocumentType": "nom exact du type de document le plus approprié", 
    "suggestedCourtType": "nom exact du type de tribunal le plus approprié",
    "suggestedJurisdictionLevel": "nom exact du niveau de juridiction le plus approprié"
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
          { role: 'user', content: `Analyse ce document en respectant les règles d'extraction:

MÉTADONNÉES TEXTUELLES (extraire titre, sous-titre, auteur, tribunal, case_number, year, court_level, mots-clés après "اﻟﻜﻠﻤﺎت اﻟﻤﻔﺎﺗﯿﺢ", demandeur, défendeur):
${textualMetadata}

CONTENU PRINCIPAL (extraire résumé):
${contentForAI}${contentTruncated ? '\n\n[Note: Contenu tronqué pour analyse rapide]' : ''}` }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: mode === 'quick' ? 3500 : 8000, // Increased token limits to avoid truncation
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
      // Check if response is complete (should end with })
      const trimmedResponse = aiResponse.trim();
      if (!trimmedResponse.endsWith('}') && !trimmedResponse.endsWith('"}')) {
        console.error('AI response appears truncated, does not end with }');
        console.error('Last 100 chars:', trimmedResponse.slice(-100));
        throw new Error('AI response was truncated - increase max_tokens or reduce content size');
      }
      
      // Parse the JSON response directly (since we forced json_object format)
      analysisResult = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Raw AI response:', aiResponse);
      throw new Error('Failed to parse AI response as JSON');
    }

    // Validate that translated fields are actually in target language
    if (targetLanguage === 'arabe') {
      // Check if translatedTitle contains Arabic characters
      if (analysisResult.translatedTitle && !/[\u0600-\u06FF]/.test(analysisResult.translatedTitle)) {
        console.warn('translatedTitle does not contain Arabic characters, using fallback');
        analysisResult.translatedTitle = analysisResult.title || '';
      }
      if (analysisResult.translatedSubtitle && !/[\u0600-\u06FF]/.test(analysisResult.translatedSubtitle)) {
        console.warn('translatedSubtitle does not contain Arabic characters, using fallback');
        analysisResult.translatedSubtitle = analysisResult.subtitle || '';
      }
      if (analysisResult.translatedSummary && !/[\u0600-\u06FF]/.test(analysisResult.translatedSummary)) {
        console.warn('translatedSummary does not contain Arabic characters, using fallback');
        analysisResult.translatedSummary = analysisResult.summary || '';
      }
    }

    // Inject exhaustive translation if available
    if (translatedContentFull) {
      analysisResult.translatedContent = translatedContentFull;
      console.log('✅ Injected exhaustive translation into analysis result');
    }

    // Validate and parse keywords if they come as a single string
    if (analysisResult.existingKeywords) {
      analysisResult.existingKeywords = parseKeywordsArray(analysisResult.existingKeywords)
        .map(k => targetLanguage === 'arabe' ? sanitizeArabicText(k) : k);
    }
    if (analysisResult.translatedKeywords) {
      analysisResult.translatedKeywords = parseKeywordsArray(analysisResult.translatedKeywords)
        .map(k => targetLanguage === 'arabe' ? k : sanitizeArabicText(k));
    }
    if (analysisResult.suggestedKeywords) {
      analysisResult.suggestedKeywords = parseKeywordsArray(analysisResult.suggestedKeywords);
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

    // Sanitize Arabic text in analysis results if language is Arabic
    if (currentLanguage === 'ar' || analysisResult.language === 'ar') {
      analysisResult.title = sanitizeArabicText(analysisResult.title);
      analysisResult.subtitle = analysisResult.subtitle ? sanitizeArabicText(analysisResult.subtitle) : analysisResult.subtitle;
      analysisResult.summary = sanitizeArabicText(analysisResult.summary);
      analysisResult.content = sanitizeArabicText(analysisResult.content);
      if (analysisResult.existingKeywords) {
        analysisResult.existingKeywords = analysisResult.existingKeywords.map((k: string) => sanitizeArabicText(k));
      }
      if (analysisResult.metadata) {
        for (const key of Object.keys(analysisResult.metadata)) {
          if (typeof analysisResult.metadata[key] === 'string') {
            analysisResult.metadata[key] = sanitizeArabicText(analysisResult.metadata[key]);
          }
        }
      }
    }

    // Sanitize translated Arabic fields when target language is Arabic
    if (targetLanguage === 'arabe') {
      if (analysisResult.translatedTitle) {
        analysisResult.translatedTitle = sanitizeArabicText(analysisResult.translatedTitle);
      }
      if (analysisResult.translatedSubtitle) {
        analysisResult.translatedSubtitle = sanitizeArabicText(analysisResult.translatedSubtitle);
      }
      if (analysisResult.translatedSummary) {
        analysisResult.translatedSummary = sanitizeArabicText(analysisResult.translatedSummary);
      }
      if (analysisResult.translatedKeywords) {
        analysisResult.translatedKeywords = analysisResult.translatedKeywords.map((k: string) => sanitizeArabicText(k));
      }
      if (analysisResult.metadataTranslated) {
        for (const key of Object.keys(analysisResult.metadataTranslated)) {
          if (typeof analysisResult.metadataTranslated[key] === 'string') {
            analysisResult.metadataTranslated[key] = sanitizeArabicText(analysisResult.metadataTranslated[key]);
          }
        }
      }
      if (analysisResult.textualMetadataTranslated) {
        analysisResult.textualMetadataTranslated = sanitizeArabicText(analysisResult.textualMetadataTranslated);
      }
      if (analysisResult.translatedContent) {
        analysisResult.translatedContent = sanitizeArabicText(analysisResult.translatedContent);
      }
    }

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