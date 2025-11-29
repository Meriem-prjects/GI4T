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
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
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

    console.log('Sending to OpenAI Vision API for OCR...');

    // Use OpenAI Vision API to extract text from PDF
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en extraction de texte. Extrais et retranscris exactement tout le texte visible dans ce document PDF, en conservant la structure et la mise en forme autant que possible. Réponds uniquement avec le texte extrait, sans commentaire.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extrais tout le texte de ce document PDF:'
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
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
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