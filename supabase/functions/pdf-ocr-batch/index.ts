import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Initialize Supabase client for progress tracking
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Detect language from text content
function detectLanguage(text: string): string {
  if (!text || text.length < 10) return 'fr';
  
  // Arabic detection - look for Arabic characters
  const arabicPattern = /[\u0600-\u06FF\u0750-\u077F]/;
  if (arabicPattern.test(text)) return 'ar';
  
  // French detection - common French words and patterns
  const frenchWords = /\b(le|la|les|de|du|des|et|à|un|une|ce|cette|pour|avec|par|sur|dans|est|sont|que|qui|il|elle|nous|vous|ils|elles)\b/gi;
  const frenchMatches = (text.match(frenchWords) || []).length;
  
  // English detection - common English words
  const englishWords = /\b(the|and|to|of|a|in|is|it|you|that|he|was|for|on|are|as|with|his|they|i|at|be|this|have|from|or|one|had|but|word|not|what|all|were|we|when|your|can|said|there|each|which|she|do|how|their|if|will|up|other|about|out|many|then|them|these|so|some|her|would|make|like|into|him|has|two|more|go|no|way|could|my|than|first|been|call|who|oil|its|now|find|long|down|day|did|get|come|made|may|part)\b/gi;
  const englishMatches = (text.match(englishWords) || []).length;
  
  // Decision based on matches
  if (frenchMatches > englishMatches) return 'fr';
  if (englishMatches > frenchMatches) return 'en';
  
  return 'fr'; // Default to French
}

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

// Save page to database immediately after OCR
async function savePageToDatabase(jobId: string, pageContent: PageContent) {
  if (!jobId) return;
  
  try {
    // Get current document
    const { data: document, error: fetchError } = await supabaseAdmin
      .from('documents')
      .select('page_contents, processed_pages, total_pages, content')
      .eq('processing_job_id', jobId)
      .single();

    if (fetchError) {
      console.error('Failed to fetch document for page save:', fetchError);
      return;
    }

    // Update page_contents array
    const existingPages = document.page_contents || [];
    const updatedPages = existingPages.filter((p: any) => p.pageNumber !== pageContent.pageNumber);
    updatedPages.push(pageContent);
    updatedPages.sort((a: any, b: any) => a.pageNumber - b.pageNumber);

    // Rebuild full content
    const fullContent = updatedPages
      .map((p: any) => p.content)
      .filter((t: string) => t.trim().length > 0)
      .join('\n\n');

    // Update document with new page
    await supabaseAdmin
      .from('documents')
      .update({
        page_contents: updatedPages,
        processed_pages: updatedPages.length,
        content: fullContent,
        status: 'processing'
      })
      .eq('processing_job_id', jobId);

    console.log(`Page ${pageContent.pageNumber} saved to database. Total saved pages: ${updatedPages.length}`);
    
  } catch (error) {
    console.error('Failed to save page to database:', error);
  }
}

// Check for existing pages to support resume
async function getExistingPages(jobId: string): Promise<number[]> {
  if (!jobId) return [];
  
  try {
    const { data: document, error } = await supabaseAdmin
      .from('documents')
      .select('page_contents')
      .eq('processing_job_id', jobId)
      .single();

    if (error || !document?.page_contents) return [];
    
    const pageNumbers = (document.page_contents as PageContent[])
      .map(p => p.pageNumber)
      .sort((a, b) => a - b);
    
    console.log(`Found existing pages: ${pageNumbers.join(', ')}`);
    return pageNumbers;
    
  } catch (error) {
    console.error('Failed to check existing pages:', error);
    return [];
  }
}

// OCR a single image using OpenAI Vision API with enhanced prompts and rate limiting
async function ocrImage(imageData: string, pageNumber: number, openaiApiKey: string, retryCount = 0): Promise<PageContent> {
  console.log(`Starting OCR for page ${pageNumber}...`);
  
  // Add delay to prevent rate limiting
  if (retryCount > 0) {
    const delay = Math.min(2000 * Math.pow(2, retryCount), 10000); // Exponential backoff, max 10s
    console.log(`Waiting ${delay}ms before retry...`);
    await new Promise(resolve => setTimeout(resolve, delay));
  } else {
    // Base delay between requests to prevent rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Enhanced prompt for better OCR accuracy
  const systemPrompt = `Tu es un expert OCR spécialisé dans l'extraction de texte juridique et administratif en français et en arabe. 
  INSTRUCTIONS CRITIQUES:
  - Extrais TOUT le texte visible avec une précision maximale
  - Préserve la mise en forme, les paragraphes et la structure
  - Identifie correctement les textes bilingues français/arabe
  - Pour les documents scannés de faible qualité, fais de ton mieux pour déchiffrer le texte
  - Ignore les filigranes et les marques d'eau
  - Réponds au format JSON strict: {"text": "texte complet extrait", "language": "fr|ar|mixed", "confidence": 0.XX}`;

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
          content: systemPrompt
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Page ${pageNumber}: Extrais tout le texte de cette image de document. Si c'est un document scanné ou de faible qualité, fais de ton mieux pour lire le texte même s'il est flou ou déformé.`
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
      temperature: 0.1,
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`OCR API error for page ${pageNumber}:`, response.status, errorText);
    
    // Enhanced retry logic with exponential backoff
    if (retryCount < 3 && (response.status === 429 || response.status >= 500)) {
      console.log(`Retrying OCR for page ${pageNumber} (attempt ${retryCount + 1})...`);
      return ocrImage(imageData, pageNumber, openaiApiKey, retryCount + 1);
    }
    
    // For rate limiting, throw a specific error
    if (response.status === 429) {
      throw new Error(`Rate limit exceeded for page ${pageNumber}. Please try again later.`);
    }
    
    throw new Error(`OCR failed for page ${pageNumber}: ${response.status} - ${errorText}`);
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

// Enhanced fallback processing chain for PDFs with resume support
async function processPdfWithOCR(pdfBuffer: ArrayBuffer, openaiApiKey: string, jobId?: string, filename?: string, isResume: boolean = false): Promise<BatchOCRResult> {
  console.log('Starting enhanced PDF OCR processing with multi-level fallback...');
  
  // Check if PDF might be password-protected
  const pdfBytes = new Uint8Array(pdfBuffer);
  const isPasswordProtected = checkIfPasswordProtected(pdfBytes);
  
  if (isPasswordProtected) {
    console.warn('PDF appears to be password-protected, attempting basic processing...');
    await updateJobProgress(jobId, {
      current_step: 'password_detected',
      progress: 5
    });
  }
  
  // Level 1: PDF/A optimized processing (already handled in upload-document)
  console.log('Starting PDF to images conversion...');
  
  // Update progress: PDF conversion starting
  await updateJobProgress(jobId, {
    status: 'processing',
    current_step: 'pdf_conversion',
    progress: 10
  });
  
  let conversionResult: any = null;
  
  // Level 2: Standard PDF to images conversion via pdfrest-converter
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
        console.warn('PDF-to-images returned no images, will try alternative methods:', conversionResult);
        conversionResult = null;
      } else {
        console.log(`PDF successfully converted to ${conversionResult.images.length} images`);
      }
    } else {
      const errorText = await conversionResponse.text();
      console.warn('PDF-to-images HTTP error, will try alternative methods:', errorText);
    }
  } catch (e) {
    console.warn('PDF-to-images conversion failed. Trying alternative methods.', e);
  }

  // If conversion succeeded, OCR all pages with progress tracking and resume support
  if (conversionResult) {
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

    // Process images sequentially to prevent rate limiting (reduced from batch processing)
    for (const image of imagesToProcess) {
      try {
        const pageContent = await ocrImage(image.imageData, image.pageNumber, openaiApiKey);
        pages.push(pageContent);
        languages[pageContent.language] = (languages[pageContent.language] || 0) + 1;
        
        // Save page immediately to database
        await savePageToDatabase(jobId, pageContent);
        
        // Calculate progress including existing pages
        const totalProcessed = existingPageNumbers.length + pages.length;
        const progressPercent = Math.round(20 + (totalProcessed / conversionResult.images.length) * 70);
        
        await updateJobProgress(jobId, {
          current_step: `ocr_page_${pageContent.pageNumber}`,
          progress: progressPercent,
          processed_pages: totalProcessed
        });
        
      } catch (error) {
        console.error(`Error processing page ${image.pageNumber}:`, error);
        
        // Save failed page as placeholder to prevent re-processing
        const failedPage = { pageNumber: image.pageNumber, content: '', confidence: 0, language: 'fr' } as PageContent;
        await savePageToDatabase(jobId, failedPage);
        
        // Continue with next page instead of stopping
        const totalProcessed = existingPageNumbers.length + pages.length + 1;
        await updateJobProgress(jobId, {
          current_step: `error_page_${image.pageNumber}`,
          progress: Math.round(20 + (totalProcessed / conversionResult.images.length) * 70),
          processed_pages: totalProcessed
        });
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
    
    // Calculate language distribution from all processed pages (including existing ones)
    for (const page of allPages) {
      languages[page.language] = (languages[page.language] || 0) + 1;
    }
    const dominantLanguage = Object.keys(languages).length > 0 
      ? Object.keys(languages).reduce((a, b) => (languages[a] > languages[b] ? a : b), 'fr')
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

    console.log(`PDF OCR batch completed successfully: ${totalProcessed}/${conversionResult.images.length} pages processed`);

    return {
      success: true,
      totalPages: conversionResult.images.length,
      processedPages: totalProcessed,
      pages: allPages.sort((a, b) => a.pageNumber - b.pageNumber),
      fullText,
      language: dominantLanguage,
    };
  }

  // Fallback Level 3: Enhanced pdf-to-images with direct text extraction
  console.log('Trying enhanced pdf-to-images conversion...');
  
  try {
    const headers: Record<string, string> = {};
    const anon = Deno.env.get('SUPABASE_ANON_KEY');
    if (anon) headers['Authorization'] = `Bearer ${anon}`;

    const enhancedFormData = new FormData();
    enhancedFormData.append('file', new Blob([pdfBuffer], { type: 'application/pdf' }));

    const enhancedResponse = await fetch('https://qpkybrcjcoxhkifnbxei.supabase.co/functions/v1/pdf-to-images', {
      method: 'POST',
      body: enhancedFormData,
      headers,
    });

    if (enhancedResponse.ok) {
      const enhancedResult = await enhancedResponse.json();
      if (enhancedResult.success && enhancedResult.images?.length) {
        console.log(`Enhanced PDF-to-images succeeded with ${enhancedResult.images.length} images`);
        conversionResult = enhancedResult;
      }
    }
  } catch (e) {
    console.warn('Enhanced pdf-to-images also failed:', e);
  }

  // If we still don't have images, try basic text extraction
  if (!conversionResult) {
    console.log('All conversion methods failed. Attempting basic text extraction...');
    
    try {
      // Use pdfjs-dist to extract text directly  
      const pdfjsLib = await import('https://esm.sh/pdfjs-dist@4.0.379');
      
      if (pdfjsLib.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.min.js';
      }
      
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(pdfBuffer),
        verbosity: 0,
        disableWorker: true,
      });
      
      const pdf = await loadingTask.promise;
      const totalPages = pdf.numPages;
      
      console.log(`Extracting text from ${totalPages} pages...`);
      
      const pages: PageContent[] = [];
      
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const textItems = textContent.items.map((item: any) => item.str).join(' ');
          
          if (textItems.trim()) {
            const pageContent: PageContent = {
              pageNumber: pageNum,
              content: textItems.trim(),
              confidence: 0.9, // High confidence for direct text extraction
              language: detectLanguage(textItems)
            };
            
            pages.push(pageContent);
            await savePageToDatabase(jobId, pageContent);
            
            const progressPercent = Math.round(50 + (pageNum / totalPages) * 40);
            await updateJobProgress(jobId, {
              current_step: `text_extract_page_${pageNum}`,
              progress: progressPercent,
              processed_pages: pageNum,
              total_pages: totalPages
            });
            
            console.log(`Page ${pageNum} text extracted: ${textItems.length} chars`);
          }
        } catch (pageError) {
          console.error(`Failed to extract text from page ${pageNum}:`, pageError);
        }
      }
      
      if (pages.length > 0) {
        const languages: { [key: string]: number } = {};
        pages.forEach(p => {
          languages[p.language] = (languages[p.language] || 0) + 1;
        });
        
        const dominantLanguage = Object.keys(languages).reduce((a, b) => 
          (languages[a] > languages[b] ? a : b), 'fr');
        
        const fullText = pages
          .sort((a, b) => a.pageNumber - b.pageNumber)
          .map(p => p.content)
          .join('\n\n');
        
        await updateJobProgress(jobId, {
          status: 'completed',
          current_step: 'text_extraction_completed',
          progress: 100,
          processed_pages: pages.length,
          total_pages: totalPages,
          result_data: {
            totalPages: totalPages,
            processedPages: pages.length,
            language: dominantLanguage,
            contentLength: fullText.length,
            method: 'text_extraction'
          }
        });
        
        // Update document with extracted text
        if (jobId) {
          await supabaseAdmin
            .from('documents')
            .update({
              content: fullText,
              language: dominantLanguage,
              processed_pages: pages.length,
              total_pages: totalPages,
              status: 'processed'
            })
            .eq('processing_job_id', jobId);
        }
        
        return {
          success: true,
          totalPages: totalPages,
          processedPages: pages.length,
          pages,
          fullText,
          language: dominantLanguage,
        };
      }
  }
  
  // If all methods failed, throw an error
  throw new Error("Impossible d'extraire le texte du PDF. Toutes les méthodes de conversion ont échoué.");
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
    const filename = formData.get('filename') as string || file?.name || 'unknown.pdf';

    let pdfBuffer: ArrayBuffer;
    let isResume = false;

    // Support both file upload and PDF URL for resume functionality
    if (file) {
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        throw new Error('File is not a PDF');
      }
      pdfBuffer = await file.arrayBuffer();
      console.log(`Processing PDF: ${filename} (${file.size} bytes) with enhanced multi-level OCR fallback`);
    } else if (pdfUrl) {
      // Resume mode: fetch PDF from URL
      console.log(`Resume mode: Fetching PDF from URL: ${pdfUrl}`);
      isResume = true;
      
      const pdfResponse = await fetch(pdfUrl);
      if (!pdfResponse.ok) {
        throw new Error('Failed to fetch PDF from URL');
      }
      pdfBuffer = await pdfResponse.arrayBuffer();
      console.log(`PDF fetched for resume: ${filename} (${pdfBuffer.byteLength} bytes)`);
    } else {
      throw new Error('No file or PDF URL provided');
    }

    // Enhanced file size limit (50MB) with better error messages
    if (pdfBuffer.byteLength > 50 * 1024 * 1024) {
      throw new Error('PDF trop volumineux. Limite : 50MB. Veuillez compresser le fichier ou le diviser en plusieurs parties.');
    }

    // Check for corrupted files
    if (pdfBuffer.byteLength < 100) {
      throw new Error('Fichier PDF trop petit ou corrompu');
    }

    // Update job status to processing if resuming
    if (isResume && jobId) {
      await updateJobProgress(jobId, {
        status: 'processing',
        current_step: 'resuming',
        error_message: null
      });
    }

    const result = await processPdfWithOCR(pdfBuffer, openaiApiKey, jobId, filename, isResume);

    if (!result.success) {
      throw new Error(result.error || 'Failed to process PDF with OCR');
    }

    console.log(`PDF OCR batch completed successfully: ${result.processedPages}/${result.totalPages} pages processed`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in pdf-ocr-batch function:', error);
    
    // Enhanced error handling with specific error types
    let errorMessage = error.message;
    if (error.message.includes('rate limit')) {
      errorMessage = 'Limite de débit API atteinte. Veuillez réessayer dans quelques minutes.';
    } else if (error.message.includes('timeout')) {
      errorMessage = 'Temps d\'attente dépassé. Le document est peut-être trop complexe.';
    } else if (error.message.includes('invalid') || error.message.includes('corrupt')) {
      errorMessage = 'Fichier PDF invalide ou corrompu. Vérifiez que le fichier n\'est pas endommagé.';
    }
    
    // Update job status to failed only if no pages were processed
    if (jobId) {
      // Check if any pages were processed before marking as failed
      const { data: document } = await supabaseAdmin
        .from('documents')
        .select('processed_pages')
        .eq('processing_job_id', jobId)
        .single();
      
      const hasProcessedPages = document?.processed_pages > 0;
      
      await updateJobProgress(jobId, {
        status: hasProcessedPages ? 'processing' : 'failed',
        error_message: errorMessage,
        progress: hasProcessedPages ? undefined : 0
      });
    }
    
    // Also update the document status but preserve content if pages were processed
    if (jobId) {
      try {
        const { data: document } = await supabaseAdmin
          .from('documents')
          .select('processed_pages, content')
          .eq('processing_job_id', jobId)
          .single();
        
        const hasContent = document?.processed_pages > 0;
        
        await supabaseAdmin
          .from('documents')
          .update({
            content: hasContent ? document.content : `Erreur de traitement: ${errorMessage}`,
            status: hasContent ? 'processing' : 'failed'
          })
          .eq('processing_job_id', jobId);
      } catch (dbError) {
        console.error('Failed to update document after OCR error:', dbError);
      }
    }
    
    const errorResult: BatchOCRResult = {
      success: false,
      totalPages: 0,
      processedPages: 0,
      pages: [],
      fullText: '',
      language: 'fr',
      error: errorMessage
    };

    return new Response(JSON.stringify(errorResult), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});