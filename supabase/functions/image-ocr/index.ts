import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { getErrorMessage, sanitizeArabicText } from "../_shared/utils.ts";

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
    
    const googleVisionApiKey = Deno.env.get('GOOGLE_VISION_API_KEY');
    if (!googleVisionApiKey) {
      throw new Error('Google Vision API key not configured');
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

    console.log('Sending to Google Vision API for OCR...');

    // Call Google Cloud Vision API with DOCUMENT_TEXT_DETECTION
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${googleVisionApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [{
            image: { content: base64Image },
            features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
            imageContext: {
              languageHints: ['ar', 'fr', 'en']  // Prioritize Arabic, French, English
            }
          }]
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Vision API error:', errorText);
      throw new Error(`Google Vision API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (data.responses[0]?.error) {
      throw new Error(`Google Vision error: ${data.responses[0].error.message}`);
    }

    const fullTextAnnotation = data.responses[0]?.fullTextAnnotation;
    
    if (!fullTextAnnotation?.text) {
      console.log('No text detected in image');
      return new Response(JSON.stringify({
        success: true,
        content: '',
        language: 'unknown',
        confidence: 0,
        fullText: '',
        extractedText: ''
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let extractedText = fullTextAnnotation.text;
    
    // Detect language from Google Vision response
    const detectedLanguages = fullTextAnnotation.pages?.[0]?.property?.detectedLanguages || [];
    const detectedLanguage = detectedLanguages.length > 0 
      ? detectedLanguages[0].languageCode 
      : 'unknown';
    const confidence = detectedLanguages.length > 0
      ? detectedLanguages[0].confidence
      : 0.95;

    console.log(`Google Vision detected: language=${detectedLanguage}, confidence=${confidence}`);

    // Sanitize Arabic text
    let sanitizedText = detectedLanguage === 'ar' ? sanitizeArabicText(extractedText) : extractedText;
    
    // Apply AI spacing correction for Arabic texts <= 12k chars
    if (detectedLanguage === 'ar' && sanitizedText && sanitizedText.length <= 12000) {
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
      language: detectedLanguage,
      confidence: confidence,
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