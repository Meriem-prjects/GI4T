import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client with service role key
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Enhanced interfaces
interface PageContent {
  pageNumber: number;
  content: string;
  confidence: number;
  language: string;
  processingTime?: number;
  retryCount?: number;
}

interface BatchOCRResult {
  success: boolean;
  totalPages: number;
  processedPages: number;
  pages: PageContent[];
  fullText: string;
  language: string;
  processingStats: {
    averageConfidence: number;
    totalProcessingTime: number;
    retries: number;
  };
}

interface PageImage {
  pageNumber: number;
  imageData: string;
  width: number;
  height: number;
}

interface ConversionResult {
  success: boolean;
  totalPages: number;
  images: PageImage[];
  error?: string;
}

interface ProcessingJob {
  id: string;
  status: string;
  progress: number;
  current_step: string;
  processed_pages: number;
  total_pages: number;
  error_message?: string;
}

// Enhanced database helpers with retry logic
async function updateJobProgress(jobId: string, updates: any, retryCount = 0): Promise<void> {
  if (!jobId) return;
  
  const maxRetries = 3;
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
      if (retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return updateJobProgress(jobId, updates, retryCount + 1);
      }
    } else {
      console.log(`Job ${jobId} updated: ${JSON.stringify(updates)}`);
    }
  } catch (e) {
    console.error('Exception updating job progress:', e);
    if (retryCount < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
      return updateJobProgress(jobId, updates, retryCount + 1);
    }
  }
}

async function savePageToDatabase(jobId: string, pageContent: PageContent): Promise<void> {
  if (!jobId) return;

  try {
    // Get current document with retry logic
    let currentDoc;
    for (let attempt = 0; attempt < 3; attempt++) {
      const { data, error } = await supabaseAdmin
        .from('documents')
        .select('page_contents, content, processed_pages')
        .eq('processing_job_id', jobId)
        .single();

      if (!error) {
        currentDoc = data;
        break;
      }
      
      if (attempt === 2) {
        console.error('Failed to fetch current document after retries:', error);
        return;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (!currentDoc) return;

    // Update page contents with deduplication
    const existingPages = (currentDoc?.page_contents || []) as PageContent[];
    const pageIndex = existingPages.findIndex(p => p.pageNumber === pageContent.pageNumber);
    
    if (pageIndex >= 0) {
      // Update existing page
      existingPages[pageIndex] = pageContent;
    } else {
      // Add new page
      existingPages.push(pageContent);
    }

    // Sort pages by page number
    existingPages.sort((a, b) => a.pageNumber - b.pageNumber);

    // Combine all page contents
    const combinedContent = existingPages
      .map(p => p.content)
      .filter(content => content && content.trim().length > 0)
      .join('\n\n');

    // Update document with retry
    for (let attempt = 0; attempt < 3; attempt++) {
      const { error } = await supabaseAdmin
        .from('documents')
        .update({
          page_contents: existingPages,
          content: combinedContent,
          processed_pages: existingPages.length,
          updated_at: new Date().toISOString()
        })
        .eq('processing_job_id', jobId);

      if (!error) {
        console.log(`Page ${pageContent.pageNumber} saved successfully (attempt ${attempt + 1})`);
        break;
      }
      
      if (attempt === 2) {
        console.error('Failed to save page after retries:', error);
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
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
    return pages.map(p => p.pageNumber).filter(num => typeof num === 'number');
  } catch (e) {
    console.error('Exception getting existing pages:', e);
    return [];
  }
}

// Enhanced job recovery system
async function getJobStatus(jobId: string): Promise<ProcessingJob | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('processing_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error) {
      console.error('Failed to get job status:', error);
      return null;
    }

    return data;
  } catch (e) {
    console.error('Exception getting job status:', e);
    return null;
  }
}

async function markJobAsStalled(jobId: string): Promise<void> {
  await updateJobProgress(jobId, {
    status: 'stalled',
    current_step: 'conversion_timeout',
    error_message: 'Le traitement a été interrompu. Cliquez sur "Reprendre" pour continuer.'
  });
}

// Multi-strategy PDF conversion with intelligent fallbacks
async function convertPdfToImages(pdfBuffer: ArrayBuffer, jobId?: string): Promise<ConversionResult> {
  console.log('Starting multi-strategy PDF conversion...');
  
  // Strategy 1: Try pdfrest-converter
  try {
    console.log('Attempting pdfrest-converter...');
    if (jobId) {
      await updateJobProgress(jobId, { current_step: 'pdfrest_conversion' });
    }

    const formData = new FormData();
    formData.append('file', new Blob([pdfBuffer], { type: 'application/pdf' }));

    const headers: Record<string, string> = {};
    const anon = Deno.env.get('SUPABASE_ANON_KEY');
    if (anon) headers['Authorization'] = `Bearer ${anon}`;

    const response = await fetch('https://qpkybrcjcoxhkifnbxei.supabase.co/functions/v1/pdfrest-converter', {
      method: 'POST',
      body: formData,
      headers,
    });

    if (response.ok) {
      const result: ConversionResult = await response.json();
      if (result.success && result.images?.length > 0) {
        console.log(`pdfrest-converter successful: ${result.images.length} images`);
        return result;
      }
    }

    const errorText = await response.text();
    console.warn('pdfrest-converter failed:', errorText);
  } catch (e) {
    console.warn('pdfrest-converter exception:', e);
  }

  // Strategy 2: Try enhanced pdf-to-images
  try {
    console.log('Attempting enhanced pdf-to-images...');
    if (jobId) {
      await updateJobProgress(jobId, { current_step: 'internal_conversion' });
    }

    const formData = new FormData();
    formData.append('file', new Blob([pdfBuffer], { type: 'application/pdf' }));

    const headers: Record<string, string> = {};
    const anon = Deno.env.get('SUPABASE_ANON_KEY');
    if (anon) headers['Authorization'] = `Bearer ${anon}`;

    const response = await fetch('https://qpkybrcjcoxhkifnbxei.supabase.co/functions/v1/pdf-to-images', {
      method: 'POST',
      body: formData,
      headers,
    });

    if (response.ok) {
      const result: ConversionResult = await response.json();
      if (result.success && result.images?.length > 0) {
        console.log(`Enhanced pdf-to-images successful: ${result.images.length} images`);
        return result;
      }
    }

    const errorText = await response.text();
    console.warn('Enhanced pdf-to-images failed:', errorText);
  } catch (e) {
    console.warn('Enhanced pdf-to-images exception:', e);
  }

  // Strategy 3: Basic image extraction fallback
  try {
    console.log('Attempting basic image extraction...');
    if (jobId) {
      await updateJobProgress(jobId, { current_step: 'basic_extraction' });
    }

    const result = await extractBasicImages(pdfBuffer);
    if (result.success && result.images?.length > 0) {
      console.log(`Basic extraction successful: ${result.images.length} images`);
      return result;
    }
  } catch (e) {
    console.warn('Basic extraction failed:', e);
  }

  // All strategies failed
  throw new Error('Toutes les méthodes de conversion PDF ont échoué');
}

// Basic image extraction as last resort
async function extractBasicImages(pdfBuffer: ArrayBuffer): Promise<ConversionResult> {
  const bytes = new Uint8Array(pdfBuffer);
  const images: PageImage[] = [];
  
  // Create a simple text-based representation as fallback
  const textContent = new TextDecoder('latin1').decode(bytes);
  
  // Create a basic "image" representation
  const canvas = new OffscreenCanvas(800, 1000);
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 800, 1000);
    ctx.fillStyle = '#000000';
    ctx.font = '12px monospace';
    
    // Extract visible text and render it
    const textLines = textContent
      .replace(/[^\x20-\x7E\n]/g, '') // Remove non-printable chars
      .split('\n')
      .filter(line => line.trim().length > 0)
      .slice(0, 60); // Limit lines
    
    textLines.forEach((line, index) => {
      ctx.fillText(line.substring(0, 80), 20, 30 + index * 16);
    });
    
    const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.8 });
    const arrayBuffer = await blob.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    
    images.push({
      pageNumber: 1,
      imageData: base64Image,
      width: 800,
      height: 1000
    });
  }
  
  return {
    success: images.length > 0,
    totalPages: images.length,
    images
  };
}

// Enhanced OCR with intelligent retry and error recovery
async function ocrImage(imageData: string, pageNumber: number, openaiApiKey: string, retryCount = 0): Promise<PageContent> {
  const maxRetries = 3;
  const startTime = Date.now();
  
  try {
    // Exponential backoff for rate limiting
    const delay = Math.min(1000 + (retryCount * 1000), 5000);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Use stable model for better reliability
        messages: [
          { 
            role: 'system', 
            content: `Tu es un expert en OCR et reconnaissance de texte. Extrais avec précision TOUT le texte visible dans cette image, en préservant la mise en forme, les listes, les tableaux et les structures. 
            
            Instructions importantes:
            - Préserve la structure originale du texte
            - Identifie la langue principale du contenu
            - Assure-toi que tout le texte visible est extrait
            - Ignore les artefacts de compression ou les pixels parasites
            - Si le texte est flou ou difficile à lire, fais de ton mieux
            
            Réponds UNIQUEMENT en JSON avec cette structure exacte: 
            {"text": "texte extrait", "language": "fr|ar|en", "confidence": 0.95}`
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: `Extrais tout le texte de cette image de la page ${pageNumber}. Sois précis et exhaustif:` },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageData}` } },
            ],
          },
        ],
        max_tokens: 4000,
        temperature: 0.1, // Low temperature for consistent extraction
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      // Check for rate limiting
      if (response.status === 429 && retryCount < maxRetries) {
        console.log(`Rate limited for page ${pageNumber}, retrying after longer delay...`);
        await new Promise(resolve => setTimeout(resolve, 10000 + (retryCount * 5000)));
        return ocrImage(imageData, pageNumber, openaiApiKey, retryCount + 1);
      }
      
      throw new Error(`OpenAI API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Pas de contenu retourné par l\'API OpenAI');
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (jsonError) {
      // If JSON parsing fails, try to extract text manually
      console.warn(`JSON parsing failed for page ${pageNumber}, using fallback`);
      parsed = {
        text: content.replace(/[{}"\[\]]/g, ''), // Basic cleanup
        language: 'fr',
        confidence: 0.7
      };
    }

    const processingTime = Date.now() - startTime;
    
    return {
      pageNumber,
      content: parsed.text || '',
      confidence: Math.min(Math.max(parsed.confidence || 0.8, 0), 1),
      language: parsed.language || 'fr',
      processingTime,
      retryCount
    };

  } catch (error) {
    console.error(`OCR error for page ${pageNumber} (attempt ${retryCount + 1}):`, error);
    
    if (retryCount < maxRetries) {
      console.log(`Retrying OCR for page ${pageNumber}...`);
      return ocrImage(imageData, pageNumber, openaiApiKey, retryCount + 1);
    }
    
    // Return empty content with error info for failed pages
    return {
      pageNumber,
      content: `[Erreur OCR: ${error.message}]`,
      confidence: 0,
      language: 'fr',
      processingTime: Date.now() - startTime,
      retryCount
    };
  }
}

// Enhanced main processing workflow
async function processPdfWithOCR(
  pdfBuffer: ArrayBuffer, 
  openaiApiKey: string, 
  jobId?: string, 
  filename?: string, 
  isResume: boolean = false
): Promise<BatchOCRResult> {
  
  if (!openaiApiKey) {
    throw new Error('Clé API OpenAI requise');
  }

  console.log(`Starting enhanced PDF OCR processing: ${filename || 'unknown'} (${pdfBuffer.byteLength} bytes)`);
  
  await updateJobProgress(jobId, {
    status: 'processing',
    current_step: 'initializing',
    progress: 5
  });

  let conversionResult: ConversionResult;
  
  try {
    // Convert PDF to images with multiple fallback strategies
    conversionResult = await convertPdfToImages(pdfBuffer, jobId);
    
    if (!conversionResult.success || !conversionResult.images?.length) {
      throw new Error(conversionResult.error || 'Conversion PDF échouée');
    }

    console.log(`PDF converted to ${conversionResult.images.length} images`);
    
  } catch (conversionError) {
    await updateJobProgress(jobId, {
      status: 'failed',
      current_step: 'conversion_failed',
      error_message: `Échec de conversion: ${conversionError.message}`
    });
    throw conversionError;
  }

  // Resume logic: check for existing pages
  const existingPageNumbers = isResume ? await getExistingPages(jobId) : [];
  const imagesToProcess = conversionResult.images.filter(img => 
    !existingPageNumbers.includes(img.pageNumber)
  );
  
  if (existingPageNumbers.length > 0) {
    console.log(`Resuming: Skipping ${existingPageNumbers.length} already processed pages`);
    console.log(`Processing remaining ${imagesToProcess.length} pages...`);
  }

  await updateJobProgress(jobId, {
    current_step: 'starting_ocr',
    progress: Math.round(15 + (existingPageNumbers.length / conversionResult.images.length) * 70),
    total_pages: conversionResult.images.length,
    processed_pages: existingPageNumbers.length
  });

  const processedPages: PageContent[] = [];
  const processingStats = {
    totalProcessingTime: 0,
    retries: 0
  };

  // Process images with intelligent batching and error recovery
  const batchSize = 2; // Reduced batch size for better error recovery
  
  for (let i = 0; i < imagesToProcess.length; i += batchSize) {
    const batch = imagesToProcess.slice(i, i + batchSize);
    
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(imagesToProcess.length / batchSize)}`);
    
    const batchPromises = batch.map(async (image) => {
      try {
        const pageContent = await ocrImage(image.imageData, image.pageNumber, openaiApiKey);
        
        // Update statistics
        processingStats.totalProcessingTime += pageContent.processingTime || 0;
        processingStats.retries += pageContent.retryCount || 0;
        
        // Save page immediately
        await savePageToDatabase(jobId, pageContent);
        
        // Update progress
        const totalProcessed = existingPageNumbers.length + processedPages.length + 1;
        const progressPercent = Math.round(15 + (totalProcessed / conversionResult.images.length) * 80);
        
        await updateJobProgress(jobId, {
          current_step: `processing_page_${pageContent.pageNumber}`,
          progress: Math.min(progressPercent, 95),
          processed_pages: totalProcessed
        });
        
        return pageContent;
      } catch (error) {
        console.error(`Error processing page ${image.pageNumber}:`, error);
        
        // Create error page record
        const errorPage: PageContent = { 
          pageNumber: image.pageNumber, 
          content: `[Erreur: ${error.message}]`, 
          confidence: 0, 
          language: 'fr',
          retryCount: 3
        };
        
        await savePageToDatabase(jobId, errorPage);
        return errorPage;
      }
    });

    const batchResults = await Promise.all(batchPromises);
    processedPages.push(...batchResults);
    
    // Progressive delay between batches to prevent rate limiting
    if (i + batchSize < imagesToProcess.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Get final results from database
  const { data: finalDocument } = await supabaseAdmin
    .from('documents')
    .select('page_contents, processed_pages, total_pages, content, language')
    .eq('processing_job_id', jobId)
    .single();

  const allPages = (finalDocument?.page_contents || []) as PageContent[];
  const totalProcessed = allPages.length;
  const isFullyCompleted = totalProcessed >= conversionResult.images.length;

  // Calculate statistics
  const validPages = allPages.filter(p => p.confidence > 0);
  const averageConfidence = validPages.length > 0 
    ? validPages.reduce((sum, p) => sum + p.confidence, 0) / validPages.length 
    : 0;

  // Determine dominant language
  const languageCounts: Record<string, number> = {};
  for (const page of validPages) {
    languageCounts[page.language] = (languageCounts[page.language] || 0) + 1;
  }
  const dominantLanguage = Object.keys(languageCounts).length > 0
    ? Object.keys(languageCounts).reduce((a, b) => languageCounts[a] > languageCounts[b] ? a : b)
    : 'fr';

  // Combine all content
  const fullText = allPages
    .sort((a, b) => a.pageNumber - b.pageNumber)
    .map(p => p.content)
    .filter(text => text && text.trim().length > 0 && !text.startsWith('[Erreur'))
    .join('\n\n');

  console.log(`OCR processing completed: ${totalProcessed}/${conversionResult.images.length} pages`);
  console.log(`Success rate: ${Math.round((validPages.length / totalProcessed) * 100)}%`);
  console.log(`Average confidence: ${Math.round(averageConfidence * 100)}%`);

  // Final status update
  const finalStatus = isFullyCompleted && validPages.length > 0 ? 'completed' : 
                     validPages.length > 0 ? 'partial' : 'failed';
                     
  await updateJobProgress(jobId, {
    status: finalStatus,
    current_step: finalStatus === 'completed' ? 'completed' : 'partial_completion',
    progress: 100,
    processed_pages: totalProcessed,
    result_data: {
      totalPages: conversionResult.images.length,
      processedPages: totalProcessed,
      successfulPages: validPages.length,
      language: dominantLanguage,
      contentLength: fullText.length,
      averageConfidence: Math.round(averageConfidence * 100),
      processingStats
    }
  });

  // Update document with final results
  if (jobId && fullText.length > 0) {
    try {
      await supabaseAdmin
        .from('documents')
        .update({
          content: fullText,
          language: dominantLanguage,
          processed_pages: totalProcessed,
          total_pages: conversionResult.images.length,
          status: finalStatus
        })
        .eq('processing_job_id', jobId);
    } catch (dbError) {
      console.error('Failed to update document with final results:', dbError);
    }
  }

  return {
    success: validPages.length > 0,
    totalPages: conversionResult.images.length,
    processedPages: totalProcessed,
    pages: allPages.sort((a, b) => a.pageNumber - b.pageNumber),
    fullText,
    language: dominantLanguage,
    processingStats: {
      averageConfidence,
      totalProcessingTime: processingStats.totalProcessingTime,
      retries: processingStats.retries
    }
  };
}

serve(async (req) => {
  console.log('Enhanced PDF OCR batch function called');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    
    // Handle both file uploads and resume requests
    const file = formData.get('file') as File;
    const resumeJobId = formData.get('jobId') as string;
    const pdfUrl = formData.get('pdfUrl') as string;
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('Clé API OpenAI non configurée');
    }

    let pdfBuffer: ArrayBuffer;
    let filename: string;
    let jobId: string;
    let isResume = false;

    if (resumeJobId && pdfUrl) {
      // Resume existing job
      console.log(`Resuming job ${resumeJobId} with PDF URL: ${pdfUrl}`);
      
      const pdfResponse = await fetch(pdfUrl);
      if (!pdfResponse.ok) {
        throw new Error('Impossible de télécharger le PDF depuis l\'URL fournie');
      }
      
      pdfBuffer = await pdfResponse.arrayBuffer();
      filename = `resumed_${resumeJobId}.pdf`;
      jobId = resumeJobId;
      isResume = true;
      
      // Reset job status for resume
      await updateJobProgress(jobId, {
        status: 'processing',
        current_step: 'resuming',
        progress: 5,
        error_message: null
      });
      
    } else if (file) {
      // New file upload
      if (!file.type.includes('pdf')) {
        throw new Error('Seuls les fichiers PDF sont supportés');
      }

      if (file.size > 50 * 1024 * 1024) {
        throw new Error('Fichier trop volumineux (limite: 50MB)');
      }

      pdfBuffer = await file.arrayBuffer();
      filename = file.name;
      jobId = formData.get('jobId') as string || crypto.randomUUID();
      
    } else {
      throw new Error('Aucun fichier ou paramètre de reprise fourni');
    }

    console.log(`Processing: ${filename} (${pdfBuffer.byteLength} bytes), Job ID: ${jobId}`);

    // Start background processing using EdgeRuntime.waitUntil for true background execution
    const processingPromise = processPdfWithOCR(pdfBuffer, openaiApiKey, jobId, filename, isResume);
    
    // Use background task to continue processing after response
    if (globalThis.EdgeRuntime?.waitUntil) {
      globalThis.EdgeRuntime.waitUntil(processingPromise.catch(async (error) => {
        console.error('Background processing failed:', error);
        await updateJobProgress(jobId, {
          status: 'failed',
          current_step: 'processing_error',
          error_message: error.message
        });
      }));
    }

    // Return immediate response for background processing
    return new Response(JSON.stringify({
      success: true,
      message: 'Traitement PDF démarré en arrière-plan',
      jobId,
      filename,
      backgroundProcessing: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in enhanced PDF OCR function:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Erreur interne du serveur',
      backgroundProcessing: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});