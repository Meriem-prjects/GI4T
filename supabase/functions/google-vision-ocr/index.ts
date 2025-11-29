import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GoogleVisionResponse {
  responses: Array<{
    fullTextAnnotation?: {
      text: string;
      pages?: Array<{
        property?: {
          detectedLanguages?: Array<{
            languageCode: string;
            confidence: number;
          }>;
        };
      }>;
    };
    error?: {
      code: number;
      message: string;
    };
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Google Vision OCR function called');
    
    const googleVisionApiKey = Deno.env.get('GOOGLE_VISION_API_KEY');
    if (!googleVisionApiKey) {
      throw new Error('Google Vision API key not configured');
    }

    const { image } = await req.json();

    if (!image) {
      throw new Error('No image data provided');
    }

    console.log('Sending image to Google Vision API for OCR...');

    // Call Google Cloud Vision API with DOCUMENT_TEXT_DETECTION
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${googleVisionApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [{
            image: { content: image },
            features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
            imageContext: {
              languageHints: ['ar', 'fr']  // Prioritize Arabic and French
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

    const data: GoogleVisionResponse = await response.json();
    
    if (data.responses[0]?.error) {
      throw new Error(`Google Vision error: ${data.responses[0].error.message}`);
    }

    const fullTextAnnotation = data.responses[0]?.fullTextAnnotation;
    
    if (!fullTextAnnotation?.text) {
      console.log('No text detected in image');
      return new Response(JSON.stringify({
        success: true,
        text: '',
        language: 'unknown',
        confidence: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const extractedText = fullTextAnnotation.text;
    
    // Detect language from Google Vision response
    const detectedLanguages = fullTextAnnotation.pages?.[0]?.property?.detectedLanguages || [];
    const primaryLanguage = detectedLanguages.length > 0 
      ? detectedLanguages[0].languageCode 
      : 'unknown';
    const confidence = detectedLanguages.length > 0
      ? detectedLanguages[0].confidence
      : 0;

    console.log(`Text extracted successfully. Length: ${extractedText.length}, Language: ${primaryLanguage}, Confidence: ${confidence}`);

    return new Response(JSON.stringify({
      success: true,
      text: extractedText,
      language: primaryLanguage,
      confidence: confidence
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Google Vision OCR error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      text: '',
      language: 'unknown',
      confidence: 0
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
