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
  
  // Call pdf-to-images function
  const formData = new FormData();
  formData.append('file', new Blob([pdfBuffer], { type: 'application/pdf' }));
  
  const conversionResponse = await fetch('https://qpkybrcjcoxhkifnbxei.supabase.co/functions/v1/pdf-to-images', {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
    }
  });

  if (!conversionResponse.ok) {
    const errorText = await conversionResponse.text();
    throw new Error(`PDF conversion failed: ${errorText}`);
  }

  const conversionResult = await conversionResponse.json();
  
  if (!conversionResult.success) {
    throw new Error(`PDF conversion failed: ${conversionResult.error}`);
  }

  console.log(`PDF converted to ${conversionResult.images.length} images. Starting batch OCR...`);

  const pages: PageContent[] = [];
  const languages: { [key: string]: number } = {};
  let totalConfidence = 0;

  // Process each image with OCR
  for (const image of conversionResult.images) {
    try {
      const pageContent = await ocrImage(image.imageData, image.pageNumber, openaiApiKey);
      pages.push(pageContent);
      
      // Count languages to determine dominant one
      languages[pageContent.language] = (languages[pageContent.language] || 0) + 1;
      totalConfidence += pageContent.confidence;
      
    } catch (error) {
      console.error(`Error processing page ${image.pageNumber}:`, error);
      // Add empty page content for failed pages
      pages.push({
        pageNumber: image.pageNumber,
        content: '',
        confidence: 0,
        language: 'fr'
      });
    }
  }

  // Determine dominant language
  const dominantLanguage = Object.keys(languages).reduce((a, b) => 
    languages[a] > languages[b] ? a : b, 'fr'
  );

  // Combine all text
  const fullText = pages
    .sort((a, b) => a.pageNumber - b.pageNumber)
    .map(page => page.content)
    .filter(content => content.trim().length > 0)
    .join('\n\n');

  console.log(`Batch OCR completed: ${pages.length} pages processed, ${fullText.length} characters extracted`);

  return {
    success: true,
    totalPages: conversionResult.totalPages,
    processedPages: pages.length,
    pages: pages.sort((a, b) => a.pageNumber - b.pageNumber),
    fullText,
    language: dominantLanguage
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