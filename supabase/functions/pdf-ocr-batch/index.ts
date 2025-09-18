// Import PDF.js library for internal conversion
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client with service role key for server-side operations
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Define interfaces
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
}

interface PageImage {
  pageNumber: number;
  imageData: string; // base64
  width: number;
  height: number;
}

interface ConversionResult {
  success: boolean;
  totalPages: number;
  images: PageImage[];
  error?: string;
}

// Internal PDF-to-images conversion function using the existing edge function
async function convertPdfToImagesInternal(pdfBuffer: ArrayBuffer): Promise<ConversionResult> {
  try {
    console.log('Converting PDF via internal pdf-to-images edge function...');

    const formData = new FormData();
    formData.append('file', new Blob([pdfBuffer], { type: 'application/pdf' }));

    const headers: Record<string, string> = {};
    const anon = Deno.env.get('SUPABASE_ANON_KEY');
    if (anon) headers['Authorization'] = `Bearer ${anon}`;

    const response = await fetch(
      'https://qpkybrcjcoxhkifnbxei.supabase.co/functions/v1/pdf-to-images',
      {
        method: 'POST',
        body: formData,
        headers,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Internal pdf-to-images error ${response.status}: ${errorText}`);
    }

    const data: ConversionResult = await response.json();

    if (!data.success || !data.images?.length) {
      throw new Error(`Internal pdf-to-images returned no images: ${data.error || 'unknown error'}`);
    }

    console.log(`Internal pdf-to-images conversion successful: ${data.images.length} images`);
    return data;
  } catch (error) {
    console.error('Internal pdf-to-images conversion failed:', error);
    return {
      success: false,
      totalPages: 0,
      images: [],
      error: (error as any)?.message || 'Internal PDF conversion failed',
    };
  }
}

// Helper function to check if PDF is password protected
function checkIfPasswordProtected(pdfBytes: Uint8Array): boolean {
  const pdfHeader = new TextDecoder().decode(pdfBytes.slice(0, 200));
  return pdfHeader.includes('/Encrypt') || pdfHeader.includes('/Filter');
}

// Database interaction helpers
async function updateJobProgress(jobId: string, updates: any) {
  if (!jobId) return;
  
  try {
    const { error } = await supabaseAdmin
      .from('processing_jobs')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);

    if (error) {
      console.error('Failed to update job progress:', error);
    }
  } catch (e) {
    console.error('Exception updating job progress:', e);
  }
}

async function savePageToDatabase(jobId: string, pageContent: PageContent) {
  if (!jobId) return;

  try {
    // Get current document
    const { data: currentDoc, error: fetchError } = await supabaseAdmin
      .from('documents')
      .select('page_contents, content, processed_pages')
      .eq('processing_job_id', jobId)
      .single();

    if (fetchError) {
      console.error('Failed to fetch current document:', fetchError);
      return;
    }

    // Update page contents
    const existingPages = (currentDoc?.page_contents || []) as PageContent[];
    const pageIndex = existingPages.findIndex(p => p.pageNumber === pageContent.pageNumber);
    
    if (pageIndex >= 0) {
      existingPages[pageIndex] = pageContent;
    } else {
      existingPages.push(pageContent);
    }

    // Sort pages by page number
    existingPages.sort((a, b) => a.pageNumber - b.pageNumber);

    // Combine all page contents
    const combinedContent = existingPages
      .map(p => p.content)
      .filter(content => content.trim().length > 0)
      .join('\n\n');

    // Update document
    const { error: updateError } = await supabaseAdmin
      .from('documents')
      .update({
        page_contents: existingPages,
        content: combinedContent,
        processed_pages: existingPages.length,
        updated_at: new Date().toISOString()
      })
      .eq('processing_job_id', jobId);

    if (updateError) {
      console.error('Failed to save page to database:', updateError);
    } else {
      console.log(`Page ${pageContent.pageNumber} saved to database successfully`);
    }
  } catch (e) {
    console.error('Exception saving page to database:', e);
  }
}

async function getExistingPages(jobId: string): Promise<number[]> {
  if (!jobId) return [];

  try {
    const { data, error } = await supabaseAdmin
      .from('documents')
      .select('page_contents')
      .eq('processing_job_id', jobId)
      .single();

    if (error || !data?.page_contents) {
      return [];
    }

    const pages = data.page_contents as PageContent[];
    return pages.map(p => p.pageNumber);
  } catch (e) {
    console.error('Exception getting existing pages:', e);
    return [];
  }
}

// OCR processing with enhanced prompts and error handling
async function ocrImage(imageData: string, pageNumber: number, openaiApiKey: string, retryCount = 0): Promise<PageContent> {
  const maxRetries = 2;
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1000 + (retryCount * 500))); // Rate limiting with backoff
    
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
            content: 'Tu es un expert en OCR et reconnaissance de texte. Extrais avec précision TOUT le texte visible dans cette image, en préservant la mise en forme, les listes, les tableaux et les structures. Détecte la langue principale du texte. Réponds uniquement en JSON avec cette structure exacte: {"text": "texte extrait", "language": "fr|ar|en", "confidence": 0.95}.' 
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: `Extrais tout le texte de cette image de la page ${pageNumber}:` },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageData}` } },
            ],
          },
        ],
        max_tokens: 4000,
        temperature: 0,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content returned from OpenAI API');
    }

    const parsed = JSON.parse(content);
    return {
      pageNumber,
      content: parsed.text || '',
      confidence: parsed.confidence || 0.9,
      language: parsed.language || 'fr',
    };
  } catch (error) {
    console.error(`OCR error for page ${pageNumber} (attempt ${retryCount + 1}):`, error);
    
    if (retryCount < maxRetries) {
      console.log(`Retrying OCR for page ${pageNumber}...`);
      return ocrImage(imageData, pageNumber, openaiApiKey, retryCount + 1);
    }
    
    // Return empty content on final failure
    return {
      pageNumber,
      content: '',
      confidence: 0,
      language: 'fr',
    };
  }
}

// Main PDF processing workflow with enhanced multi-level fallback
async function processPdfWithOCR(pdfBuffer: ArrayBuffer, openaiApiKey: string, jobId?: string, filename?: string, isResume: boolean = false): Promise<BatchOCRResult> {
  if (!openaiApiKey) {
    throw new Error('OpenAI API key is required');
  }

  // Check if PDF is password protected
  const pdfBytes = new Uint8Array(pdfBuffer);
  if (checkIfPasswordProtected(pdfBytes)) {
    throw new Error('Password-protected PDFs are not supported');
  }

  console.log('Starting enhanced PDF OCR processing with multi-level fallback...');
  
  await updateJobProgress(jobId, {
    status: 'processing',
    current_step: 'pdf_conversion',
    progress: 10
  });

  let conversionResult: ConversionResult | null = null;

  // Level 1: Try pdfrest-converter first
  console.log('Starting PDF to images conversion...');
  
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
        console.warn('pdfRest returned no images, will try internal method:', conversionResult);
        conversionResult = null;
      } else {
        console.log(`pdfRest conversion successful: ${conversionResult.images.length} images`);
      }
    } else {
      const errorText = await conversionResponse.text();
      console.warn('pdfRest HTTP error, will try internal method:', errorText);
    }
  } catch (e) {
    console.warn('pdfRest conversion failed. Trying internal method.', e);
  }

  // Level 2: Fallback to internal PDF-to-images conversion
  if (!conversionResult) {
    console.log('pdfRest failed, using internal PDF-to-images conversion...');
    
    await updateJobProgress(jobId, {
      current_step: 'internal_pdf_conversion',
      progress: 30
    });

    try {
      conversionResult = await convertPdfToImagesInternal(pdfBuffer);
      
      if (!conversionResult.success || !conversionResult.images?.length) {
        throw new Error(`Internal PDF conversion failed: ${conversionResult.error || 'No images generated'}`);
      }
      
      console.log(`Internal PDF conversion successful: ${conversionResult.images.length} images generated`);
    } catch (internalError) {
      console.error('Internal PDF-to-images conversion failed:', internalError);
      
      await updateJobProgress(jobId, {
        status: 'failed',
        current_step: 'conversion_failed',
        progress: 0,
        error_message: 'Fichier PDF invalide ou corrompu. Vérifiez que le fichier n\'est pas endommagé.'
      });
      
      throw new Error('Both pdfRest and internal PDF conversion failed');
    }
  }

  // Continue with OCR processing
  console.log(`PDF converted to ${conversionResult.images.length} images. Starting batch OCR...`);
  
  // Check for existing pages if resume
  const existingPageNumbers = isResume ? await getExistingPages(jobId) : [];
  const imagesToProcess = conversionResult.images.filter(img => !existingPageNumbers.includes(img.pageNumber));
  
  if (existingPageNumbers.length > 0) {
    console.log(`Resume detected: Skipping pages: ${existingPageNumbers.join(', ')}`);
    console.log(`Processing remaining ${imagesToProcess.length} pages...`);
  }
  
  // Update progress: OCR starting
  await updateJobProgress(jobId, {
    current_step: 'ocr_starting',
    progress: Math.round((existingPageNumbers.length / conversionResult.images.length) * 90) + 5,
    total_pages: conversionResult.images.length,
    processed_pages: existingPageNumbers.length
  });

  const pages: PageContent[] = [];
  const languages: { [key: string]: number } = {};

  // Process images sequentially with concurrency limit
  const concurrencyLimit = 3;
  for (let i = 0; i < imagesToProcess.length; i += concurrencyLimit) {
    const batch = imagesToProcess.slice(i, i + concurrencyLimit);
    
    const batchPromises = batch.map(async (image) => {
      try {
        const pageContent = await ocrImage(image.imageData, image.pageNumber, openaiApiKey);
        pages.push(pageContent);
        languages[pageContent.language] = (languages[pageContent.language] || 0) + 1;
        
        // Save page immediately to database
        await savePageToDatabase(jobId, pageContent);
        
        // Calculate progress including existing pages
        const totalProcessed = existingPageNumbers.length + pages.length;
        const progressPercent = Math.round(40 + (totalProcessed / conversionResult!.images.length) * 50);
        
        await updateJobProgress(jobId, {
          current_step: `ocr_page_${pageContent.pageNumber}`,
          progress: progressPercent,
          processed_pages: totalProcessed
        });
        
        return pageContent;
      } catch (error) {
        console.error(`Error processing page ${image.pageNumber}:`, error);
        
        // Save failed page as placeholder to prevent re-processing
        const failedPage = { pageNumber: image.pageNumber, content: '', confidence: 0, language: 'fr' } as PageContent;
        await savePageToDatabase(jobId, failedPage);
        
        return failedPage;
      }
    });

    await Promise.all(batchPromises);
    
    // Small delay between batches to prevent rate limiting
    if (i + concurrencyLimit < imagesToProcess.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // Get final results including existing pages
  const { data: finalDocument } = await supabaseAdmin
    .from('documents')
    .select('page_contents, processed_pages, total_pages, content, language')
    .eq('processing_job_id', jobId)
    .single();

  const allPages = (finalDocument?.page_contents || []) as PageContent[];
  const totalProcessed = allPages.length;
  const isFullyCompleted = totalProcessed >= conversionResult.images.length;
  
  // Calculate language distribution from all processed pages
  const finalLanguages: { [key: string]: number } = {};
  for (const page of allPages) {
    finalLanguages[page.language] = (finalLanguages[page.language] || 0) + 1;
  }
  const dominantLanguage = Object.keys(finalLanguages).length > 0 
    ? Object.keys(finalLanguages).reduce((a, b) => (finalLanguages[a] > finalLanguages[b] ? a : b), 'fr')
    : 'fr';

  const fullText = allPages
    .sort((a, b) => a.pageNumber - b.pageNumber)
    .map((p) => p.content)
    .filter((t) => t.trim().length > 0)
    .join('\n\n');

  console.log(`Batch OCR completed: ${totalProcessed}/${conversionResult.images.length} pages processed, ${fullText.length} chars`);
  
  // Final progress update and document update
  const finalStatus = isFullyCompleted ? 'completed' : 'processing';
  await updateJobProgress(jobId, {
    status: finalStatus,
    current_step: isFullyCompleted ? 'completed' : 'partial_completion',
    progress: isFullyCompleted ? 100 : Math.round((totalProcessed / conversionResult.images.length) * 90),
    processed_pages: totalProcessed,
    result_data: {
      totalPages: conversionResult.images.length,
      processedPages: totalProcessed,
      language: dominantLanguage,
      contentLength: fullText.length,
      partial: !isFullyCompleted
    }
  });
  
  // Update the document with final content
  if (jobId) {
    try {
      await supabaseAdmin
        .from('documents')
        .update({
          content: fullText,
          language: dominantLanguage,
          processed_pages: totalProcessed,
          total_pages: conversionResult.images.length,
          status: isFullyCompleted ? 'processed' : 'processing'
        })
        .eq('processing_job_id', jobId);
    } catch (dbError) {
      console.error('Failed to update document after OCR:', dbError);
    }
  }

  return {
    success: true,
    totalPages: conversionResult.images.length,
    processedPages: totalProcessed,
    pages: allPages.sort((a, b) => a.pageNumber - b.pageNumber),
    fullText,
    language: dominantLanguage,
  };
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
    const pdfUrl = formData.get('pdfUrl') as string;
    jobId = formData.get('jobId') as string;
    const filename = formData.get('filename') as string;

    let pdfBuffer: ArrayBuffer;
    let actualFilename: string;

    if (file) {
      pdfBuffer = await file.arrayBuffer();
      actualFilename = file.name;
      console.log(`Processing PDF file: ${actualFilename} (${pdfBuffer.byteLength} bytes) with enhanced multi-level OCR fallback`);
    } else if (pdfUrl) {
      console.log(`Processing PDF from URL: ${pdfUrl} with enhanced multi-level OCR fallback`);
      const response = await fetch(pdfUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF from URL: ${response.statusText}`);
      }
      pdfBuffer = await response.arrayBuffer();
      actualFilename = filename || 'document.pdf';
      console.log(`PDF downloaded: ${actualFilename} (${pdfBuffer.byteLength} bytes)`);
    } else {
      throw new Error('No file or PDF URL provided');
    }

    const result = await processPdfWithOCR(pdfBuffer, openaiApiKey, jobId, actualFilename, !!pdfUrl);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in pdf-ocr-batch function:', error);
    
    // Update job status to failed
    if (jobId) {
      const friendlyMessage =
        (error as any)?.message?.includes('Password-protected')
          ? 'PDF protégé par mot de passe non supporté'
          : ((error as any)?.message?.includes('Both pdfRest and internal PDF conversion failed') ||
             (error as any)?.message?.toLowerCase?.().includes('usage limit') ||
             (error as any)?.message?.toLowerCase?.().includes('pdfjs-dist') ||
             (error as any)?.message?.toLowerCase?.().includes('pdf-to-images') ||
             (error as any)?.message?.toLowerCase?.().includes('conversion'))
          ? 'Le service de conversion PDF est temporairement indisponible. Réessayez plus tard.'
          : (error as any)?.message?.includes('Invalid MIME type')
          ? 'Fichier PDF invalide ou corrompu. Vérifiez que le fichier n\'est pas endommagé.'
          : (error as any)?.message || 'Une erreur est survenue lors du traitement du PDF.';

      await updateJobProgress(jobId, {
        status: 'failed',
        progress: 0,
        error_message: friendlyMessage,
      });
    }

    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});