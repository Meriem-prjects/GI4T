import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('OpenAI OCR function called');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      throw new Error('No file provided');
    }

    console.log(`Processing file: ${file.name}, size: ${file.size}`);

    // Convert file to base64 for OpenAI Vision
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    
    let mimeType = file.type;
    if (!mimeType || mimeType === 'application/pdf') {
      // For PDFs, we need to convert to image first or use OCR
      // For now, we'll handle PDFs by analyzing them as documents
      mimeType = 'application/pdf';
    }

    console.log('Sending to OpenAI Vision API for text extraction...');

    // Use OpenAI Vision to extract text from the document
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `Tu es un expert en OCR et extraction de texte. 
            Extrait TOUT le texte visible dans ce document avec une précision maximale.
            Préserve la structure, les paragraphes et la mise en forme.
            Si le texte est en arabe, assure-toi de le transcrire correctement.
            Si c'est un document juridique, préserve tous les termes techniques.
            Retourne uniquement le texte extrait sans commentaires additionnels.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extrait tout le texte de ce document avec une précision maximale:'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64}`,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 4000,
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const extractedText = data.choices[0]?.message?.content;

    if (!extractedText) {
      throw new Error('No text extracted from OpenAI response');
    }

    console.log(`Successfully extracted ${extractedText.length} characters`);
    console.log('Preview:', extractedText.substring(0, 300));

    return new Response(JSON.stringify({ 
      success: true,
      text: extractedText.trim(),
      filename: file.name,
      size: file.size,
      method: 'openai-vision'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in openai-ocr function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});