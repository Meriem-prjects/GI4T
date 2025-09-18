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
    console.log('Image OCR function called');
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      throw new Error('No file provided');
    }

    console.log(`Processing image: ${file.name} (${file.size} bytes)`);

    // Convert image to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    const mimeType = file.type || 'image/jpeg';

    console.log('Sending to OpenAI Vision API for OCR and language detection...');

    // Use OpenAI Vision API to extract text from image and detect language
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
            content: 'Tu es un expert en extraction de texte et détection de langue. Extrais tout le texte visible dans cette image et détecte la langue principale du texte. Réponds au format JSON: {"text": "texte extrait", "language": "code langue (fr/ar/en)", "confidence": 0.95}'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extrais le texte de cette image et détecte sa langue principale:'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 4000,
        temperature: 0,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    console.log(`OCR completed. Language: ${result.language}, Text length: ${result.text?.length || 0}`);

    return new Response(JSON.stringify({
      success: true,
      content: result.text || '',
      language: result.language || 'fr',
      confidence: result.confidence || 0.9,
      fullText: result.text || '',
      extractedText: result.text || ''
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Image OCR error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      content: `Erreur OCR: ${error.message}`,
      language: 'fr',
      confidence: 0,
      fullText: '',
      extractedText: ''
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});