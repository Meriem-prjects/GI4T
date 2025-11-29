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
    console.log('Image OCR function called');
    
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('Lovable API key not configured');
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      throw new Error('No file provided');
    }

    console.log(`Processing image: ${file.name} (${file.size} bytes)`);

    // Check file size limit (10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('Image trop volumineuse. Limite : 10MB');
    }

    // Convert image to base64 safely
    let base64Image: string;
    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      // Convert in chunks to avoid call stack issues
      const chunkSize = 8192;
      const chunks: string[] = [];
      
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.slice(i, i + chunkSize);
        chunks.push(String.fromCharCode.apply(null, Array.from(chunk)));
      }
      
      base64Image = btoa(chunks.join(''));
    } catch (conversionError) {
      console.error('Base64 conversion error:', conversionError);
      throw new Error('Erreur de conversion de l\'image');
    }

    const mimeType = file.type || 'image/jpeg';
    console.log(`Image converted successfully, MIME type: ${mimeType}`);

    console.log('Sending to Gemini 2.5 Pro via Lovable AI for OCR and language detection...');

    // Use Gemini 2.5 Pro via Lovable AI Gateway to extract text from image and detect language
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
- Détecte la langue principale (fr/ar/en)
- Réponds au format JSON: {"text": "texte extrait tel quel", "language": "code langue", "confidence": 0.XX}`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extrais le texte de cette image caractère par caractère sans corriger les espacements:'
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
      console.error('Lovable AI (Gemini) API error:', errorText);
      throw new Error(`Lovable AI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    console.log(`OCR completed. Language: ${result.language}, Text length: ${result.text?.length || 0}`);

    // Apply OCR error corrections first
    let extractedText = fixArabicOCRErrors(result.text || '');
    
    // Sanitize Arabic text if detected
    let sanitizedText = result.language === 'ar' ? sanitizeArabicText(extractedText) : extractedText;
    
    // Apply AI spacing correction for Arabic texts <= 12k chars
    if (result.language === 'ar' && sanitizedText && sanitizedText.length <= 12000) {
      try {
        console.log('Applying AI spacing correction for Arabic OCR text...');
        const spacingResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/arabic-spacing-fixer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
          },
          body: JSON.stringify({ text: sanitizedText })
        });
        
        if (spacingResponse.ok) {
          const spacingData = await spacingResponse.json();
          if (spacingData?.success && spacingData.correctedText) {
            sanitizedText = spacingData.correctedText;
            console.log(`AI spacing correction applied (method: ${spacingData.method})`);
          }
        }
      } catch (spacingErr) {
        console.warn('AI spacing correction failed, using heuristic result:', spacingErr);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      content: sanitizedText || '',
      language: result.language || 'fr',
      confidence: result.confidence || 0.9,
      fullText: sanitizedText || '',
      extractedText: sanitizedText || ''
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Image OCR error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: getErrorMessage(error),
      content: `Erreur OCR: ${getErrorMessage(error)}`,
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