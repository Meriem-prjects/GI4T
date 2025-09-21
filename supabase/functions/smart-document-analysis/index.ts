import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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

    // Use currentLanguage as absolute primary language (no auto-detection)
    const isPrimaryArabic = currentLanguage === 'ar';
    const targetLanguage = isPrimaryArabic ? 'français' : 'arabe';
    const sourceLanguage = isPrimaryArabic ? 'arabe' : 'français';

    const systemPrompt = `Tu es un expert en analyse de documents juridiques et administratifs bilingues (français/arabe). 
    
    Analyse ce document et extrait les informations suivantes avec précision :

    IMPORTANT: 
    - Tous les champs principaux (title, subtitle, assignedRight, summary, existingKeywords, suggestedKeywords) doivent être en ${sourceLanguage}
    - Tous les champs traduits (translatedTitle, translatedSummary, translatedKeywords, translatedContent) doivent être en ${targetLanguage}
    - Le champ translatedContent doit préserver EXACTEMENT la structure et les sauts de ligne du document original

    1. TITRE : Identifie le titre principal en ${sourceLanguage}
    2. SOUS-TITRE : Le sous-titre ou contexte en ${sourceLanguage}
    3. DROIT ASSIGNÉ : Le droit spécifique mentionné en ${sourceLanguage}
    4. RÉSUMÉ : Génère un résumé en exactement 4 phrases en ${sourceLanguage}
    5. MOTS-CLÉS EXISTANTS : Extrait les mots-clés existants en ${sourceLanguage}
    6. MOTS-CLÉS SUGGÉRÉS : Propose 5-8 mots-clés pertinents en ${sourceLanguage}
    7. TRADUCTION COMPLÈTE : Traduis tout le contenu en ${targetLanguage} en préservant les sauts de ligne
    8. LANGUE DÉTECTÉE : Confirme "${sourceLanguage}"

    Réponds uniquement en JSON valide :`;

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

    console.log('Analysis completed successfully');

    return new Response(JSON.stringify({
      success: true,
      analysis: analysisResult,
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
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});