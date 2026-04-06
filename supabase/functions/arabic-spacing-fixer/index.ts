import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { sanitizeArabicText, fixArabicParentheses } from "../_shared/utils.ts";

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

    // Length threshold: only use AI for texts <= 15k characters
    if (text.length > 15000) {
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
            content: `Tu es un expert en correction de textes juridiques arabes issus d'OCR. Ta tâche est de corriger les espaces, les mots collés, et les erreurs de caractères OCR dans le texte arabe.

RÈGLES STRICTES:
1. Corrige les espaces: ajoute des espaces entre mots collés, supprime les espaces à l'intérieur des mots
2. Corrige les erreurs OCR de caractères COURANTES:
   - Confusion de points: ب↔ت↔ث↔ن, ج↔ح↔خ, د↔ذ, ر↔ز, س↔ش, ص↔ض, ط↔ظ, ع↔غ, ف↔ق
   - Confusion ta marbuta/ha: ة↔ه en fin de mot (utilise le contexte pour choisir)
   - Hamza mal placée: أ, إ, ؤ, ئ, ء
   - Alef avec/sans hamza: ا↔أ↔إ↔آ selon le contexte
3. Ne modifie PAS le sens du texte — corrige uniquement les erreurs évidentes d'OCR
4. Préserve la ponctuation et les nombres tels quels
5. Réponds UNIQUEMENT avec le texte corrigé, sans explication
6. Recolle TOUJOURS les signes diacritiques (Chadda ّ, Fatha َ, Damma ُ, Kasra ِ, etc.) à leur lettre - PAS D'ESPACE AVANT NI APRÈS
7. Normalise les variantes de "Hé" (ﮫ ﮪ ﮬ ﮭ) vers la forme standard (ه) en fin de mot
8. Sépare les mots collés: ajoute des espaces entre différents mots qui se touchent
9. Corrige les mots juridiques courants mal orthographiés par l'OCR (ex: المحكمه→المحكمة, الحكومه→الحكومة, القانو→القانون, الدستو→الدستور)

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
Sortie: "عن طريق تنقيح الفصل"

Entrée: "حر ّية التنقّل"
Sortie: "حرّية التنقّل"

Entrée: "إقامةجيرة"
Sortie: "إقامة جيرة"

Entrée: "إجراءحدودي"
Sortie: "إجراء حدودي"

Entrée: "آخرداخل نفس"
Sortie: "آخر داخل نفس"

Entrée: "لكل ّفرد"
Sortie: "لكلّ فرد"

Entrée: "والإداري ّ"
Sortie: "والإداري"

Entrée: "لحقوقالإنسان"
Sortie: "لحقوق الإنسان"

Entrée: "حر ّ ّية"
Sortie: "حرّية"

Entrée: "ﻓﻘﮫ"
Sortie: "فقه"

Entrée: "وﺟﮫ"
Sortie: "وجه"

Entrée: "ﻧﺰاھﺔ"
Sortie: "نزاهة"

Entrée: "اﻟﺤﻖ ّ النّقابي"
Sortie: "الحقّ النّقابي"

Entrée: "أستاذة تعليم عال ّ في القانون العام ّ"
Sortie: "أستاذة تعليم عالٍ في القانون العامّ"

Entrée: "حق ّ التّفاوض"
Sortie: "حقّ التّفاوض"

Entrée: ")ﻛﻠّﯾﺔ اﻟﻌﻠوم بتونس("
Sortie: "(كلّية العلوم بتونس)"`
          },
          {
            role: 'user',
            content: preprocessed
          }
        ],
        max_tokens: 8000,
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
    let correctedText = data.choices[0].message.content.trim();

    // Post-process: Apply BiDi fix for parentheses
    correctedText = fixArabicParentheses(correctedText);

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
