import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PageContent {
  pageNumber: number;
  content: string;
  confidence: number;
  language: string;
}

interface BatchOCRResult {
  success: boolean;
  totalPages: number;
  processedPages: number;
  pages: PageContent[];
  fullText: string;
  language: string;
  error?: string;
}

// OCR a single image using OpenAI Vision API
async function ocrImage(imageData: string, pageNumber: number, openaiApiKey: string): Promise<PageContent> {
  console.log(`Starting OCR for page ${pageNumber}...`);
  
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
                url: `data:image/jpeg;base64,${imageData}`
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
    console.error(`OpenAI API error for page ${pageNumber}:`, errorText);
    throw new Error(`OpenAI API error for page ${pageNumber}: ${response.status}`);
  }

  const data = await response.json();
  const result = JSON.parse(data.choices[0].message.content);

  console.log(`Page ${pageNumber} OCR completed. Language: ${result.language}, Text length: ${result.text?.length || 0}`);

  return {
    pageNumber,
    content: result.text || '',
    confidence: result.confidence || 0.9,
    language: result.language || 'fr'
  };
}

// Convert PDF to images first, then OCR each page
async function processPdfWithOCR(pdfBuffer: ArrayBuffer, openaiApiKey: string): Promise<BatchOCRResult> {
  console.log('Starting PDF to images conversion...');

  // Prepare form data for conversion
  const formData = new FormData();
  formData.append('file', new Blob([pdfBuffer], { type: 'application/pdf' }));

  let conversionResult: { success: boolean; totalPages: number; images: { imageData: string; pageNumber: number }[]; error?: string } | null = null;

  try {
    const headers: Record<string, string> = {};
    const anon = Deno.env.get('SUPABASE_ANON_KEY');
    if (anon) headers['Authorization'] = `Bearer ${anon}`;

    const conversionResponse = await fetch('https://qpkybrcjcoxhkifnbxei.supabase.co/functions/v1/pdf-to-images-native', {
      method: 'POST',
      body: formData,
      headers,
    });

    if (conversionResponse.ok) {
      conversionResult = await conversionResponse.json();
      if (!conversionResult.success || !conversionResult.images?.length) {
        console.warn('PDF-to-images returned no images, will fallback to direct PDF OCR:', conversionResult);
        conversionResult = null;
      }
    } else {
      const errorText = await conversionResponse.text();
      console.warn('PDF-to-images HTTP error, will fallback to direct PDF OCR:', errorText);
    }
  } catch (e) {
    console.warn('PDF-to-images failed (likely unsupported package in Edge runtime). Fallback to direct PDF OCR.', e);
  }

  // If conversion succeeded, OCR all pages
  if (conversionResult) {
    console.log(`PDF converted to ${conversionResult.images.length} images. Starting batch OCR...`);

    const pages: PageContent[] = [];
    const languages: { [key: string]: number } = {};

    for (const image of conversionResult.images) {
      try {
        const pageContent = await ocrImage(image.imageData, image.pageNumber, openaiApiKey);
        pages.push(pageContent);
        languages[pageContent.language] = (languages[pageContent.language] || 0) + 1;
      } catch (error) {
        console.error(`Error processing page ${image.pageNumber}:`, error);
        pages.push({ pageNumber: image.pageNumber, content: '', confidence: 0, language: 'fr' });
      }
    }

    const dominantLanguage = Object.keys(languages).reduce((a, b) => (languages[a] > languages[b] ? a : b), 'fr');
    const fullText = pages
      .sort((a, b) => a.pageNumber - b.pageNumber)
      .map((p) => p.content)
      .filter((t) => t.trim().length > 0)
      .join('\n\n');

    console.log(`Batch OCR completed: ${pages.length} pages processed, ${fullText.length} chars`);

    return {
      success: true,
      totalPages: conversionResult.totalPages,
      processedPages: pages.length,
      pages: pages.sort((a, b) => a.pageNumber - b.pageNumber),
      fullText,
      language: dominantLanguage,
    };
  }

  // Fallback: send the raw PDF to OpenAI Vision API to extract all text at once
  console.log('Falling back to direct PDF OCR via OpenAI Vision...');

  // Convert PDF buffer to base64 in chunks
  const bytes = new Uint8Array(pdfBuffer);
  const chunkSize = 8192;
  const parts: string[] = [];
  for (let i = 0; i < bytes.length; i += chunkSize) {
    parts.push(String.fromCharCode.apply(null, Array.from(bytes.slice(i, i + chunkSize))));
  }
  const base64Pdf = btoa(parts.join(''));

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'Tu es un expert en extraction de texte multi-pages. Extrais TOUT le texte du PDF fourni (toutes les pages), sans commentaire, et détecte la langue principale. Réponds en JSON: {"text": "...", "language": "fr|ar|en", "confidence": 0.95}.' },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Extrais et concatène le texte de toutes les pages de ce PDF:' },
            { type: 'image_url', image_url: { url: `data:application/pdf;base64,${base64Pdf}` } },
          ],
        },
      ],
      max_tokens: 4000,
      temperature: 0,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI PDF OCR error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  const result = JSON.parse(data.choices[0].message.content || '{}');
  const content = result.text || '';
  const language = result.language || 'fr';

  console.log(`Direct PDF OCR completed. Text length: ${content.length}, language: ${language}`);

  return {
    success: true,
    totalPages: 1,
    processedPages: 1,
    pages: [
      { pageNumber: 1, content, confidence: result.confidence || 0.9, language },
    ],
    fullText: content,
    language,
  };
}

serve(async (req) => {
  console.log('PDF OCR batch function called');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      throw new Error('No file provided');
    }

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      throw new Error('File is not a PDF');
    }

    console.log(`Processing PDF: ${file.name} (${file.size} bytes) with full OCR`);

    // Check file size limit (50MB)
    if (file.size > 50 * 1024 * 1024) {
      throw new Error('PDF trop volumineux. Limite : 50MB');
    }

    const pdfBuffer = await file.arrayBuffer();
    const result = await processPdfWithOCR(pdfBuffer, openaiApiKey);

    if (!result.success) {
      throw new Error(result.error || 'Failed to process PDF with OCR');
    }

    console.log(`PDF OCR batch completed successfully: ${result.processedPages}/${result.totalPages} pages processed`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in pdf-ocr-batch function:', error);
    
    const errorResult: BatchOCRResult = {
      success: false,
      totalPages: 0,
      processedPages: 0,
      pages: [],
      fullText: '',
      language: 'fr',
      error: error.message
    };

    return new Response(JSON.stringify(errorResult), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});