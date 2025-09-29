import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fields } = await req.json();
    
    console.log('Correction orthographique demandée pour les champs:', Object.keys(fields));

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY non configurée');
    }

    // Construire le prompt avec tous les champs à corriger
    const fieldsToCorrect = Object.entries(fields)
      .filter(([_, value]) => value && typeof value === 'string' && value.trim())
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n\n');

    const systemPrompt = `Tu es un expert en langue arabe spécialisé dans la correction orthographique et grammaticale de textes juridiques tunisiens.

Ta tâche est de corriger UNIQUEMENT l'orthographe et la grammaire arabe sans changer le sens ou le contenu.

RÈGLES STRICTES:
1. Corrige uniquement les fautes d'orthographe et de grammaire
2. Préserve la terminologie juridique exacte
3. Ne modifie PAS le sens ou le contenu
4. Ne traduis PAS
5. Garde la même structure et formatage
6. Réponds au format JSON avec les mêmes clés que l'entrée

Exemple de réponse:
{
  "title_ar": "النص المصحح",
  "subtitle_ar": "النص المصحح",
  "content": "النص المصحح...",
  "textual_metadata": "النص المصحح...",
  "summary_ar": "النص المصحح",
  "keywords_ar": ["كلمة1", "كلمة2"],
  "author_ar": "النص المصحح",
  "court_ar": "النص المصحح",
  "plaintiff_ar": "النص المصحح",
  "defendant_ar": "النص المصحح",
  "court_level_ar": "النص المصحح",
  "court_category_type_ar": "النص المصحح"
}`;

    const userPrompt = `Corrige l'orthographe et la grammaire de ces champs arabes:

${fieldsToCorrect}

Réponds UNIQUEMENT avec un objet JSON contenant les champs corrigés.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur AI Gateway:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requêtes dépassée. Veuillez réessayer dans quelques instants.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Crédits insuffisants. Veuillez ajouter des crédits à votre espace Lovable AI.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`Erreur AI Gateway: ${response.status}`);
    }

    const data = await response.json();
    const correctedText = data.choices[0].message.content;
    
    console.log('Réponse AI brute:', correctedText);

    let correctedFields;
    try {
      correctedFields = JSON.parse(correctedText);
    } catch (e) {
      // Tentative d'extraction si le JSON est enveloppé dans du markdown
      const jsonMatch = correctedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        correctedFields = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Impossible de parser la réponse JSON');
      }
    }

    console.log('Champs corrigés:', Object.keys(correctedFields));

    return new Response(
      JSON.stringify({ 
        success: true, 
        correctedFields 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Erreur dans correct-arabic-spelling:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
