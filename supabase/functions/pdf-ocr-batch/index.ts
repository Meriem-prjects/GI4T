import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { sanitizeArabicText } from "../_shared/utils.ts";

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

// Detect password-protected PDFs by scanning header for encryption flags
function checkIfPasswordProtected(pdfBytes: Uint8Array): boolean {
  try {
    const head = new TextDecoder('latin1').decode(pdfBytes.slice(0, 2048));
    return head.includes('/Encrypt') || head.includes('/Filter/Standard');
  } catch {
    return false;
  }
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

// OCR a single image using Google Cloud Vision API
async function ocrImage(imageData: string, pageNumber: number, googleVisionApiKey: string, retryCount = 0): Promise<PageContent> {
  const maxRetries = 3;
  const baseDelay = 2000; // 2 seconds
  
  try {
    console.log(`🔍 Google Vision OCR Page ${pageNumber} (attempt ${retryCount + 1}/${maxRetries + 1})...`);

    // Call Google Cloud Vision API with DOCUMENT_TEXT_DETECTION
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${googleVisionApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [{
            image: { content: imageData },
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
      throw new Error(`Google Vision API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (data.responses[0]?.error) {
      throw new Error(`Google Vision error: ${data.responses[0].error.message}`);
    }

    const fullTextAnnotation = data.responses[0]?.fullTextAnnotation;
    
    if (!fullTextAnnotation?.text) {
      console.log(`⚠️ No text detected on page ${pageNumber}`);
      return {
        pageNumber,
        content: '',
        confidence: 0,
        language: 'fr'
      };
    }

    const extractedText = fullTextAnnotation.text;
    
    // Detect language and confidence from Google Vision
    const detectedLanguages = fullTextAnnotation.pages?.[0]?.property?.detectedLanguages || [];
    const detectedLanguage = detectedLanguages.length > 0
      ? detectedLanguages[0].languageCode
      : 'fr';
    const confidence = detectedLanguages.length > 0
      ? detectedLanguages[0].confidence
      : 0.95; // Default high confidence for Google Vision

    // Sanitize Arabic text if detected
    let sanitizedContent = detectedLanguage === 'ar' ? sanitizeArabicText(extractedText) : extractedText;

    console.log(`✅ Page ${pageNumber} extracted: ${sanitizedContent.length} chars, language: ${detectedLanguage}, confidence: ${confidence}`);

    return {
      pageNumber,
      content: sanitizedContent,
      confidence: confidence,
      language: detectedLanguage
    };

  } catch (error) {
    // Enhanced error handling with specific error types
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Check for rate limit errors
    if (errorMessage.includes('rate_limit') || errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
      console.error(`⚠️ Rate limit hit on page ${pageNumber}, attempt ${retryCount + 1}`);
      
      if (retryCount < maxRetries) {
        const delay = baseDelay * Math.pow(2, retryCount); // Exponential backoff
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return ocrImage(imageData, pageNumber, googleVisionApiKey, retryCount + 1);
      }
    }
    
    console.error(`❌ Google Vision OCR failed for page ${pageNumber}:`, errorMessage);
    
    return {
      pageNumber,
      content: `[Erreur OCR page ${pageNumber}: ${errorMessage}]`,
      confidence: 0,
      language: 'fr'
    };
  }
}

// Enhanced fallback processing chain for PDFs with resume support
async function processPdfWithOCR(pdfBuffer: ArrayBuffer, googleVisionApiKey: string, jobId: string, filename?: string, isResume: boolean = false, preservedLanguage: string = 'fr'): Promise<BatchOCRResult> {
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
  
  // Level 0: Try direct text extraction with pdf-reader first (NEW STEP)
  console.log('Attempting direct PDF text extraction with pdf-reader...');
  
    await updateJobProgress(jobId, {
    current_step: 'pdf_text_extraction',
    progress: 15
  });
  
  try {
    const headers: Record<string, string> = {};
    const anon = Deno.env.get('SUPABASE_ANON_KEY');
    if (anon) headers['Authorization'] = `Bearer ${anon}`;

    const readerResponse = await fetch('https://qpkybrcjcoxhkifnbxei.supabase.co/functions/v1/pdf-reader', {
      method: 'POST',
      body: pdfBuffer,
      headers: { ...headers, 'Content-Type': 'application/pdf' },
    });

    if (readerResponse.ok) {
      const readerResult = await readerResponse.json();
      
      if (readerResult.success && readerResult.texts && readerResult.texts.length > 0) {
        const fullText = readerResult.texts.join('\n\n').trim();
        const avgCharsPerPage = fullText.length / readerResult.numPages;
        
        console.log(`PDF text extraction successful: ${readerResult.numPages} pages, ${fullText.length} chars, avg ${Math.round(avgCharsPerPage)} chars/page`);
        
        // Check if text extraction is sufficient (>50 chars per page average)
        if (avgCharsPerPage > 50 && fullText.length > 100) {
          console.log('Direct text extraction sufficient, skipping OCR processing');
          
          // Create page content from extracted text
          const pages: PageContent[] = readerResult.texts.map((text: string, index: number) => ({
            pageNumber: index + 1,
            content: text.trim(),
            confidence: 1.0, // High confidence for direct text extraction
            language: preservedLanguage
          }));
          
          // Save pages to database if jobId exists
          if (jobId) {
            for (const page of pages) {
              await savePageToDatabase(jobId, page);
            }
            
            // Update job and document with final results
            await updateJobProgress(jobId, {
              status: 'completed',
              current_step: 'text_extraction_completed',
              progress: 100,
              processed_pages: pages.length,
              total_pages: pages.length,
            result_data: {
              totalPages: pages.length,
              processedPages: pages.length,
              language: preservedLanguage,
              contentLength: fullText.length,
              method: 'direct_text_extraction'
            }
            });
            
            // Update document
            await supabaseAdmin
              .from('documents')
              .update({
                content: fullText,
                language: preservedLanguage,
                processed_pages: pages.length,
                total_pages: pages.length,
                status: 'draft' // Always draft after processing, must go through validation
              })
              .eq('processing_job_id', jobId);
          }
          
          return {
            success: true,
            totalPages: pages.length,
            processedPages: pages.length,
            pages,
            fullText,
            language: preservedLanguage,
          };
        } else {
          console.log(`Text extraction insufficient (${Math.round(avgCharsPerPage)} chars/page), falling back to OCR`);
        }
      } else {
        console.log('PDF text extraction failed, falling back to OCR');
      }
    } else {
      console.log('PDF-reader service unavailable, falling back to OCR');
    }
  } catch (readerError) {
    console.warn('PDF text extraction error, falling back to OCR:', readerError);
  }
  
  // Level 1: PDF to images conversion (existing workflow)
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
    const imagesToProcess = conversionResult.images.filter((img: any) => !existingPageNumbers.includes(img.pageNumber));
    
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
        const pageContent = await ocrImage(image.imageData, image.pageNumber, googleVisionApiKey);
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
        const failedPage = { pageNumber: image.pageNumber, content: '', confidence: 0, language: preservedLanguage } as PageContent;
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

    let fullText = allPages
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
        language: preservedLanguage,
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
            language: preservedLanguage,
            processed_pages: totalProcessed,
            total_pages: conversionResult.images.length,
            status: 'draft' // Always draft after processing, must go through validation
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
    language: preservedLanguage,
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
    const langToPersist = preservedLanguage || language;

    // Update final progress and document
    await updateJobProgress(jobId, {
      status: 'completed',
      current_step: 'completed',
      progress: 100,
      processed_pages: 1,
      total_pages: 1,
      result_data: {
        totalPages: 1,
        language: langToPersist,
        contentLength: fullText.length
      }
    });
    
    // Update the document with extracted content
    if (jobId) {
      try {
        await supabaseAdmin
          .from('documents')
          .update({
            content: fullText,
            language: langToPersist,
            processed_pages: 1,
            total_pages: 1,
            status: 'processed'
          })
          .eq('processing_job_id', jobId);
      } catch (dbError) {
        console.error('Failed to update document after successful PDF OCR:', dbError);
      }
    }

  return {
    success: true,
    totalPages: 1,
    processedPages: 1,
    pages: [{ pageNumber: 1, content: fullText, confidence: parsed.confidence || 0.9, language: langToPersist }],
    fullText,
    language: langToPersist,
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
    const googleVisionApiKey = Deno.env.get('GOOGLE_VISION_API_KEY');
    if (!googleVisionApiKey) {
      throw new Error('Google Vision API key not configured');
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const pdfUrl = formData.get('pdfUrl') as string;
    const providedJobId = formData.get('jobId') as string;
    jobId = providedJobId || crypto.randomUUID(); // Ensure jobId is always a string
    const filename = formData.get('filename') as string || file?.name || 'unknown.pdf';
    const preservedLanguage = (formData.get('language') as string) || 'fr';

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
    if (isResume) {
      await updateJobProgress(jobId, {
        status: 'processing',
        current_step: 'resuming',
        error_message: null
      });
    }

    const result = await processPdfWithOCR(pdfBuffer, googleVisionApiKey, jobId, filename, isResume, preservedLanguage);

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
    let errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('rate limit')) {
      errorMessage = 'Limite de débit API atteinte. Veuillez réessayer dans quelques minutes.';
    } else if (errorMessage.includes('timeout')) {
      errorMessage = 'Temps d\'attente dépassé. Le document est peut-être trop complexe.';
    } else if (errorMessage.includes('invalid') || errorMessage.includes('corrupt')) {
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
            content: hasContent ? (document?.content || '') : `Erreur de traitement: ${errorMessage}`,
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