import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { getErrorMessage, fixArabicOCRErrors, sanitizeArabicText } from "../_shared/utils.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('PDF OCR function called');
    
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('Lovable API key not configured');
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      throw new Error('No file provided');
    }

    console.log(`Processing PDF: ${file.name} (${file.size} bytes)`);

    // Convert PDF to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64Pdf = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    console.log('Sending to Gemini 2.5 Pro via Lovable AI for OCR...');

    // Use Gemini 2.5 Pro via Lovable AI Gateway to extract text from PDF
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          {
            role: 'system',
            content: `Tu es un expert OCR spécialisé en extraction de texte avec une expertise particulière pour l'arabe et le français.
INSTRUCTIONS CRITIQUES:
- Extrais CHAQUE caractère exactement comme tu le vois
- Pour l'arabe, préserve TOUS les espaces entre les lettres sans les corriger
- Ne joins JAMAIS les lettres arabes même si elles semblent former un mot
- Transcris lettre par lettre, caractère par caractère
- Conserve la structure et la mise en forme du document
- Réponds uniquement avec le texte extrait tel quel, sans commentaire ni correction`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extrais tout le texte de ce document PDF caractère par caractère sans corriger les espacements:'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:application/pdf;base64,${base64Pdf}`
                }
              }
            ]
          }
        ],
        max_tokens: 4000,
        temperature: 0
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI (Gemini) API error:', errorText);
      throw new Error(`Lovable AI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    let extractedText = data.choices[0].message.content;

    console.log(`Text extracted successfully. Length: ${extractedText.length}`);

    // Apply OCR error corrections and Arabic text sanitization
    extractedText = fixArabicOCRErrors(extractedText);
    extractedText = sanitizeArabicText(extractedText);
    console.log(`Text corrected with heuristics. Final length: ${extractedText.length}`);

    return new Response(JSON.stringify({
      success: true,
      content: extractedText,
      pages: [{
        pageNumber: 1,
        content: extractedText,
        confidence: 0.95
      }],
      fullText: extractedText,
      processedPages: 1,
      totalPages: 1
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('PDF OCR error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: getErrorMessage(error),
      content: `Erreur OCR: ${getErrorMessage(error)}`,
      pages: [],
      fullText: '',
      processedPages: 0,
      totalPages: 0
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});