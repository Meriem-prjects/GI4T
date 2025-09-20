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

    const isArabic = currentLanguage === 'ar' || /[\u0600-\u06FF]/.test(content);
    const targetLanguage = isArabic ? 'français' : 'arabe';
    const sourceLanguage = isArabic ? 'arabe' : 'français';

    const systemPrompt = `Tu es un expert en analyse de documents juridiques et administratifs bilingues (français/arabe). 
    
    Analyse ce document et extrait les informations suivantes avec précision :

    1. TITRE : Identifie le titre principal qui apparaît généralement après le nom de l'auteur
    2. SOUS-TITRE : Le sous-titre ou contexte (ex: "فقه القضاء الإداري لسنة 2010")  
    3. DROIT ASSIGNÉ : Le droit spécifique mentionné (ex: "الحق في الصحة")
    4. RÉSUMÉ : Génère un résumé en exactement 4 phrases qui capture l'essentiel
    5. MOTS-CLÉS EXISTANTS : Extrait les mots-clés qui suivent "الكلمات المفاتيح" ou équivalent
    6. MOTS-CLÉS SUGGÉRÉS : Propose 5-8 mots-clés pertinents supplémentaires
    7. TRADUCTION : Traduis tout le contenu en ${targetLanguage}
    8. LANGUE DÉTECTÉE : Confirme la langue principale du document

    Réponds uniquement en JSON valide avec cette structure exacte :
    {
      "title": "titre extrait",
      "subtitle": "sous-titre extrait",
      "assignedRight": "droit assigné extrait",
      "summary": "résumé en 4 phrases",
      "language": "${sourceLanguage}",
      "existingKeywords": ["mot1", "mot2"],
      "suggestedKeywords": ["nouveau1", "nouveau2"],
      "translatedContent": "contenu traduit complet",
      "translatedTitle": "titre traduit",
      "translatedSummary": "résumé traduit",
      "translatedKeywords": ["mots-clés traduits"]
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
      // Clean the response to extract JSON
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        analysisResult = JSON.parse(aiResponse);
      }
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