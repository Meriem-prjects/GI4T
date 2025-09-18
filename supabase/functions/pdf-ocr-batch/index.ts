import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client for progress tracking
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

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

// Helper function to update job progress
async function updateJobProgress(jobId: string, updates: any) {
  if (!jobId) return;
  
  try {
    await supabaseAdmin.from('processing_jobs').update({
      ...updates,
      updated_at: new Date().toISOString()
    }).eq('id', jobId);
  } catch (error) {
    console.error('Failed to update job progress:', error);
  }
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
    console.error(`OCR API error for page ${pageNumber}:`, response.status, errorText);
    throw new Error(`OCR failed for page ${pageNumber}: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    console.warn(`No content returned for page ${pageNumber}`);
    return {
      pageNumber,
      content: '',
      confidence: 0,
      language: 'fr'
    };
  }

  try {
    const parsed = JSON.parse(content);
    const result = {
      pageNumber,
      content: parsed.text || '',
      confidence: parsed.confidence || 0.9,
      language: parsed.language || 'fr'
    };
    
    console.log(`Page ${pageNumber} OCR completed. Language: ${result.language}, Text length: ${result.content.length}`);
    return result;
  } catch (parseError) {
    console.warn(`Failed to parse JSON response for page ${pageNumber}, using raw content:`, parseError);
    return {
      pageNumber,
      content: content,
      confidence: 0.8,
      language: 'fr'
    };
  }
}

// Process PDF with OCR (batch processing with real-time progress tracking)
async function processPdfWithOCR(pdfBuffer: ArrayBuffer, openaiApiKey: string, jobId?: string): Promise<BatchOCRResult> {
  console.log('Starting PDF OCR processing with progress tracking...');
  
  // Step 1: Convert PDF to images
  console.log('Starting PDF to images conversion...');
  
  // Update progress: PDF conversion starting
  await updateJobProgress(jobId, {
    status: 'processing',
    current_step: 'pdf_conversion',
    progress: 10
  });
  
  let conversionResult: any = null;
  
  // Call pdfrest-converter with the PDF
  const formData = new FormData();
  formData.append('file', new Blob([pdfBuffer], { type: 'application/pdf' }));

  try {
    const headers: Record<string, string> = {};
    const anon = Deno.env.get('SUPABASE_ANON_KEY');
    if (anon) headers['Authorization'] = `Bearer ${anon}`;

    const conversionResponse = await fetch('https://qpkybrcjcoxhkifnbxei.supabase.co/functions/v1/pdfrest-converter', {
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

  // If conversion succeeded, OCR all pages with progress tracking
  if (conversionResult) {
    console.log(`PDF converted to ${conversionResult.images.length} images. Starting batch OCR...`);
    
    // Update progress: OCR starting
    await updateJobProgress(jobId, {
      current_step: 'ocr_starting',
      progress: 20,
      total_pages: conversionResult.images.length
    });

    const pages: PageContent[] = [];
    const languages: { [key: string]: number } = {};

    // Process images in batches of 3 for efficiency
    const batchSize = 3;
    for (let i = 0; i < conversionResult.images.length; i += batchSize) {
      const batch = conversionResult.images.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map(async (image) => {
          try {
            const pageContent = await ocrImage(image.imageData, image.pageNumber, openaiApiKey);
            return pageContent;
          } catch (error) {
            console.error(`Error processing page ${image.pageNumber}:`, error);
            return { pageNumber: image.pageNumber, content: '', confidence: 0, language: 'fr' } as PageContent;
          }
        })
      );
      
      // Update progress for each completed batch
      for (const pageContent of results) {
        pages.push(pageContent);
        languages[pageContent.language] = (languages[pageContent.language] || 0) + 1;
        
        // Calculate progress: 20% base + 70% for OCR progress
        const progressPercent = Math.round(20 + (pages.length / conversionResult.images.length) * 70);
        await updateJobProgress(jobId, {
          current_step: `ocr_page_${pageContent.pageNumber}`,
          progress: progressPercent,
          processed_pages: pages.length
        });
      }
    }

    const dominantLanguage = Object.keys(languages).reduce((a, b) => (languages[a] > languages[b] ? a : b), 'fr');
    const fullText = pages
      .sort((a, b) => a.pageNumber - b.pageNumber)
      .map((p) => p.content)
      .filter((t) => t.trim().length > 0)
      .join('\n\n');

    console.log(`Batch OCR completed: ${pages.length} pages processed, ${fullText.length} chars`);
    
    // Final progress update
    await updateJobProgress(jobId, {
      status: 'completed',
      current_step: 'completed',
      progress: 100,
      processed_pages: pages.length,
      result_data: {
        totalPages: pages.length,
        language: dominantLanguage,
        contentLength: fullText.length
      }
    });

    console.log(`PDF OCR batch completed successfully: ${pages.length}/${conversionResult.images.length} pages processed`);

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
  
  await updateJobProgress(jobId, {
    current_step: 'direct_pdf_ocr',
    progress: 50
  });

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
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('No content returned from OpenAI PDF OCR');
  }

  try {
    const parsed = JSON.parse(content);
    const fullText = parsed.text || '';
    const language = parsed.language || 'fr';

    // Update final progress
    await updateJobProgress(jobId, {
      status: 'completed',
      current_step: 'completed',
      progress: 100,
      processed_pages: 1,
      total_pages: 1,
      result_data: {
        totalPages: 1,
        language: language,
        contentLength: fullText.length
      }
    });

    return {
      success: true,
      totalPages: 1,
      processedPages: 1,
      pages: [{ pageNumber: 1, content: fullText, confidence: parsed.confidence || 0.9, language }],
      fullText,
      language,
    };
  } catch (parseError) {
    console.error('Failed to parse OpenAI PDF OCR response:', parseError);
    throw new Error('Failed to parse PDF OCR response');
  }
}

serve(async (req) => {
  console.log('PDF OCR batch function called');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let jobId: string | null = null;
  
  try {
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    jobId = formData.get('jobId') as string; // Get job ID for progress tracking

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
    const result = await processPdfWithOCR(pdfBuffer, openaiApiKey, jobId);

    if (!result.success) {
      throw new Error(result.error || 'Failed to process PDF with OCR');
    }

    console.log(`PDF OCR batch completed successfully: ${result.processedPages}/${result.totalPages} pages processed`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in pdf-ocr-batch function:', error);
    
    // Update job status to failed if jobId provided
    if (jobId) {
      await updateJobProgress(jobId, {
        status: 'failed',
        error_message: error.message,
        progress: 0
      });
    }
    
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