import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { sanitizeArabicText } from "../_shared/utils.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Arabic spacing fixer function called');
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      throw new Error('No text provided');
    }

    console.log(`Processing Arabic text: ${text.length} characters`);

    // Length threshold: only use AI for texts <= 12k characters
    if (text.length > 12000) {
      console.log('Text too long for AI processing, using heuristic fallback only');
      const fallbackResult = sanitizeArabicText(text);
      return new Response(JSON.stringify({
        success: true,
        correctedText: fallbackResult,
        method: 'heuristic',
        originalLength: text.length,
        correctedLength: fallbackResult.length
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Apply heuristic preprocessing first
    const preprocessed = sanitizeArabicText(text);
    console.log('Preprocessed with heuristics, sending to AI for refinement...');

    // Use OpenAI to correct ambiguous spacing cases
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Tu es un expert en correction typographique de textes arabes. Ta tâche est UNIQUEMENT de corriger les espaces et les mots collés dans le texte arabe.

RÈGLES STRICTES:
1. Ne modifie JAMAIS le contenu des mots - garde exactement les mêmes mots
2. Corrige UNIQUEMENT les espaces: ajoute des espaces entre mots collés, supprime les espaces à l'intérieur des mots
3. Ne corrige PAS l'orthographe, la grammaire, ou toute autre chose
4. Préserve la ponctuation et les nombres tels quels
5. Réponds UNIQUEMENT avec le texte corrigé, sans explication
6. Recolle TOUJOURS les signes diacritiques (Chadda ّ, Fatha َ, Damma ُ, etc.) à leur lettre - PAS D'ESPACE
7. Normalise les variantes de "Hé" (ﮫ ﮪ ﮬ ﮭ) vers la forme standard (ه) en fin de mot

EXEMPLES:
Entrée: "القضاءالإداريلسنة2007"
Sortie: "القضاء الإداري لسنة 2007"

Entrée: "قا منائب ا لعارض بتقديمعريضة"
Sortie: "قام نائب العارض بتقديم عريضة"

Entrée: "ا لدّعوى ا لح الية"
Sortie: "الدعوى الحالية"

Entrée: "الأ ولى"
Sortie: "الأولى"

Entrée: "الإ علان"
Sortie: "الإعلان"

Entrée: " جميع " (avec espaces dans les guillemets)
Sortie: "جميع"

Entrée: "في10ديسمبر1948"
Sortie: "في 10 ديسمبر 1948"

Entrée: "اﻟﻌﺎمﺑﺠﺎﻣﻌﺔﺻﻔﺎﻗﺲ"
Sortie: "العام بجامعة صفاقس"

Entrée: "دﺳﺘﻮر25ﺟﻮﯾﻠﯿﺔ2022"
Sortie: "دستور 25 جويلية 2022"

Entrée: "ﻓﺼﻠﮫ90.ﻓﻜﺎن"
Sortie: "فصله 90. فكان"

Entrée: "ﺣﻖ ّ اﻟﺘّﺮﺷّﺢ"
Sortie: "حقّ الترشّح"

Entrée: "ﻣﻌﺘﺰ ّ اﻟﻘﺮﻗﻮري"
Sortie: "معتزّ القرقوري"

Entrée: "أﺳﺘﺎذ ﺗﻌﻠﯿﻢ ﻋﺎل ّﻓﻲ"
Sortie: "أستاذ تعليم عالٍّ في"

Entrée: "ّاﻹﻋﻼن اﻟﻌﺎﻟﻤﻲﻟﺤﻘﻮق"
Sortie: "الإعلان العالمي لحقوق"

Entrée: "ﻋﻦ ﻃﺮﯾﻖ ﺗﻨﻘﯿﺢ ا لفصل"
Sortie: "عن طريق تنقيح الفصل"`
          },
          {
            role: 'user',
            content: preprocessed
          }
        ],
        max_tokens: 4000,
        temperature: 0
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      console.log('Falling back to heuristic result');
      return new Response(JSON.stringify({
        success: true,
        correctedText: preprocessed,
        method: 'heuristic_fallback',
        originalLength: text.length,
        correctedLength: preprocessed.length,
        error: `AI error: ${response.status}`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const correctedText = data.choices[0].message.content.trim();

    console.log(`Correction completed. Original: ${text.length} chars, AI result: ${correctedText.length} chars`);

    return new Response(JSON.stringify({
      success: true,
      correctedText,
      method: 'ai',
      originalLength: text.length,
      correctedLength: correctedText.length,
      preprocessedLength: preprocessed.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Arabic spacing fixer error:', error);
    
    // Last resort fallback
    const { text } = await req.json().catch(() => ({ text: '' }));
    const fallbackResult = text ? sanitizeArabicText(text) : '';
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      correctedText: fallbackResult,
      method: 'error_fallback'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
