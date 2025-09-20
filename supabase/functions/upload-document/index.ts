import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// Function to sanitize filename for storage
function sanitizeFilename(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.');
  const name = lastDotIndex !== -1 ? filename.slice(0, lastDotIndex) : filename;
  const extension = lastDotIndex !== -1 ? filename.slice(lastDotIndex) : '';
  
  // Replace special characters with underscores and remove consecutive underscores
  // Also handle Unicode characters properly
  const sanitizedName = name
    .normalize('NFD') // Normalize Unicode
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-zA-Z0-9\-_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
    
  return sanitizedName + extension;
}

// Initialize Supabase client with service role key for admin access
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Helper function to detect password-protected PDFs
function checkIfPasswordProtected(pdfBytes: Uint8Array): boolean {
  try {
    const pdfString = new TextDecoder('latin1').decode(pdfBytes.slice(0, 1024));
    // Look for encryption indicators in PDF header
    return pdfString.includes('/Encrypt') || pdfString.includes('/Filter/Standard');
  } catch {
    return false;
  }
}

// Enhanced file content extraction with multiple fallback methods
async function extractFileContent(file: File, isPDF: boolean): Promise<{ success: boolean; content: string; contentLength: number; preview: string; error?: string }> {
  try {
    if (!isPDF) {
      // Handle non-PDF files (images, text files)
      if (file.type.startsWith('image/')) {
        return {
          success: true,
          content: 'Image en cours de traitement par OCR...',
          contentLength: 39,
          preview: 'Image en cours de traitement par OCR...'
        };
      } else if (file.type === 'text/plain') {
        const text = await file.text();
        return {
          success: true,
          content: text,
          contentLength: text.length,
          preview: text.substring(0, 200)
        };
      } else {
        return {
          success: true,
          content: 'Document en cours de traitement...',
          contentLength: 33,
          preview: 'Document en cours de traitement...'
        };
      }
    }

    // PDF processing with enhanced error handling
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    
    // Check if it's a valid PDF
    const header = new TextDecoder().decode(bytes.slice(0, 5));
    if (!header.startsWith('%PDF-')) {
      throw new Error('Fichier PDF invalide ou corrompu');
    }
    
    // Check for password protection
    const isProtected = checkIfPasswordProtected(bytes);
    if (isProtected) {
      console.log('PDF password-protected detected, will attempt OCR processing');
    }
    
    return {
      success: true,
      content: 'Document PDF en cours de traitement...',
      contentLength: 38,
      preview: 'Document PDF en cours de traitement...'
    };
    
  } catch (error) {
    console.error('File content extraction error:', error);
    return {
      success: false,
      content: '',
      contentLength: 0,
      preview: '',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

// Sanitize strings to avoid null bytes that Postgres rejects ("unsupported Unicode escape sequence")
function sanitizeString(input: string): string {
  try {
    return input.replace(/\u0000/g, '');
  } catch {
    return input;
  }
}

function deepSanitize(value: any): any {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') return sanitizeString(value);
  if (Array.isArray(value)) return value.map((v) => deepSanitize(v));
  if (typeof value === 'object') {
    const result: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) {
      result[k] = deepSanitize(v);
    }
    return result;
  }
  return value;
}

serve(async (req) => {
  console.log('Upload document function called');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const categoryId = formData.get('categoryId') as string;
    const documentTypeId = formData.get('documentTypeId') as string;
    const language = formData.get('language') as string || 'fr';

    if (!file) {
      throw new Error('No file provided');
    }

    console.log(`Processing file: ${file.name}, size: ${file.size}`);

    // Enhanced file validation and content extraction
    const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const extractionResult = await extractFileContent(file, isPDF);
    
    if (!extractionResult.success && extractionResult.error) {
      throw new Error(extractionResult.error);
    }

    // Upload file to Supabase Storage
    const sanitizedName = sanitizeFilename(file.name);
    const fileName = `${Date.now()}-${sanitizedName}`;
    console.log(`Sanitized filename: ${sanitizedName} -> ${fileName}`);
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('documents')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    console.log('File uploaded successfully:', uploadData.path);

    // Get file content for parsing
    let fileContent = '';
    let extractionSuccess = false;
    let pageContents: any[] | null = null;
    let processedPages: number | null = null;
    let totalPagesVar: number | null = null;
    
          // Initialize analysis data at the beginning
    let analysisData = {
      title: file.name,
      title_ar: null,
      summary: 'Document uploadé sans analyse complète',
      summary_ar: null,
      keywords: [],
      keywords_ar: [],
      language: language, // Use the provided language
      document_type: null,
      main_topics: [],
      legal_references: [],
      entities: [],
      dates: [],
      jurisdiction: null,
      case_numbers: [],
      legal_domains: []
    };
    
    // Shared variables across processing flow
    let pdfaInfo: any = null;
    let jobData: any = null;
    let shouldUsePDFReader = false; // Track if direct text extraction was successful
    
    // Handle different file types with enhanced processing
    if (isPDF) {
      console.log('Processing PDF file with enhanced multi-level fallback system...');
      
      // Create processing job for progress tracking
      const { data: jobDataResult, error: jobError } = await supabaseAdmin
        .from('processing_jobs')
        .insert({
          file_name: file.name,
          file_size: file.size,
          status: 'pending',
          progress: 0,
          current_step: 'initializing'
        })
        .select()
        .single();
      
      if (jobError) {
        console.error('Failed to create processing job:', jobError);
      } else {
        jobData = jobDataResult;
      }
      
      const jobId = jobData?.id;
      
      // First, detect if this is a PDF/A document for optimized processing
      pdfaInfo = null;
      try {
        const pdfaFormData = new FormData();
        pdfaFormData.append('file', file);
        
        const { data: pdfaData, error: pdfaError } = await supabaseAdmin.functions.invoke('pdf-a-detector', {
          body: pdfaFormData
        });
        
        if (!pdfaError && pdfaData) {
          pdfaInfo = pdfaData;
          console.log('PDF/A detection result:', {
            isPDFA: pdfaInfo.isPDFA,
            version: pdfaInfo.pdfaVersion,
            useNative: pdfaInfo.recommendations?.useNativeConversion
          });
        }
      } catch (pdfaException) {
        console.warn('PDF/A detection failed, continuing with standard processing:', pdfaException);
      }
      
      try {
        // First attempt: Direct text extraction with pdf-reader
        console.log('Attempting direct PDF text extraction...');
        
        const { data: readerData, error: readerError } = await supabaseAdmin.functions.invoke('pdf-reader', {
          body: file
        });
        
        let shouldUsePDFReader = false;
        
        if (!readerError && readerData?.success) {
          // Use pdf-reader results regardless of text quantity
          const extractedText = (readerData.texts || []).join('\n\n').trim();
          const avgCharsPerPage = extractedText.length / (readerData.numPages || 1);
          
          console.log(`PDF text extraction result: ${readerData.numPages} pages, ${extractedText.length} chars, avg ${Math.round(avgCharsPerPage)} chars/page`);
          
          // Always use direct extraction - no more OCR fallback
          console.log('Using PDF direct extraction result');
          
          fileContent = extractedText.length > 0 ? extractedText : 'Document PDF sans texte extractible';
          extractionSuccess = true;
          totalPagesVar = readerData.numPages || 1;
          
          // Create page contents from extracted text
          pageContents = (readerData.texts || []).map((text: string, index: number) => ({
            pageNumber: index + 1,
            content: text.trim(),
            confidence: 1.0,
            language: language // Use the provided language
          }));
          
          processedPages = readerData.numPages || 1;
          
            // Enhanced analysis data with extracted content
          analysisData.title = file.name.replace(/\.[^/.]+$/, "");
          analysisData.summary = extractedText.length > 0 
            ? `Document PDF traité: ${extractedText.substring(0, 200)}...`
            : 'Document PDF traité sans texte extractible';
          analysisData.language = language; // Use the provided language
          
          console.log('PDF direct extraction completed successfully');
        } else {
          // PDF reading failed completely - save file but mark as unprocessed
          console.log('PDF text extraction failed completely, saving file without content');
          
          fileContent = 'Document PDF non lisible - fichier sauvegardé sans extraction de texte';
          extractionSuccess = false; // Mark as failed extraction
          totalPagesVar = 1;
          pageContents = [{
            pageNumber: 1,
            content: 'Contenu non extractible',
            confidence: 0.0,
            language: language // Use the provided language
          }];
          processedPages = 1;
          
          analysisData.title = file.name.replace(/\.[^/.]+$/, "");
          analysisData.summary = 'Document PDF non lisible - extraction échouée';
          analysisData.language = language; // Use the provided language
        }

        // Enhance analysis data with PDF/A metadata if available
        if (pdfaInfo?.isPDFA) {
            analysisData.document_type = `PDF/A Document (${pdfaInfo.pdfaVersion || 'Unknown version'})`;
            
            // Add PDF/A metadata to analysis
            if (pdfaInfo.metadata?.title) {
              analysisData.title = pdfaInfo.metadata.title;
            }
            if (pdfaInfo.metadata?.keywords) {
              analysisData.keywords = pdfaInfo.metadata.keywords.split(',').map(k => k.trim()).filter(Boolean);
            }
            if (pdfaInfo.metadata?.subject) {
              analysisData.summary = `Document d'archivage PDF/A: ${pdfaInfo.metadata.subject}`;
            }
            
            // Add archival information to legal domains
            analysisData.legal_domains = ['Document d\'archivage', 'PDF/A Standard'];
            if (pdfaInfo.conformanceLevel) {
              analysisData.legal_domains.push(`Conformité niveau ${pdfaInfo.conformanceLevel}`);
            }
          }
          
        // Page contents populated from pdf-reader extraction
        console.log(`PDF processing completed with ${processedPages || 0} pages`);
      } catch (pdfException) {
        console.error('PDF OCR processing exception:', pdfException);
        fileContent = `Exception PDF OCR: ${pdfException.message}`;
      }
      
    } else if (file.type?.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|bmp|tiff)$/i.test(file.name)) {
      // Handle image files with OCR
      console.log('Processing image file with OCR...');
      
      try {
        const imageFormData = new FormData();
        imageFormData.append('file', file);
        
        const { data: ocrData, error: ocrError } = await supabaseAdmin.functions.invoke('image-ocr', {
          body: imageFormData
        });

        console.log('Image OCR response:', ocrData);

        if (ocrError) {
          console.error('Image OCR error:', ocrError);
          fileContent = `Erreur OCR: ${ocrError.message}`;
        } else if (ocrData?.success && ocrData?.content && ocrData.content.length > 2) {
          fileContent = ocrData.content;
          extractionSuccess = true;
          analysisData.language = ocrData.language || 'fr';
          console.log(`Image OCR successful: ${fileContent.length} chars, language: ${analysisData.language}`);
        } else {
          console.warn('Image OCR returned insufficient content:', ocrData);
          fileContent = 'Image ne contient pas de texte lisible';
        }
      } catch (ocrException) {
        console.error('Image OCR exception:', ocrException);
        fileContent = `Exception OCR: ${ocrException.message}`;
      }
    } else {
      // For text files, read as text
      try {
        fileContent = await file.text();
        extractionSuccess = fileContent.length > 10;
      } catch (textError) {
        console.error('Text reading error:', textError);
        fileContent = 'Erreur lors de la lecture du fichier';
      }
    }
    
    console.log('File content extraction completed:', {
      success: extractionSuccess,
      contentLength: fileContent.length,
      preview: fileContent.substring(0, 100)
    });
    
    // Update analysis data based on extraction results
    if (extractionSuccess) {
      analysisData.title = file.name.replace(/\.[^/.]+$/, ""); // Remove file extension
      analysisData.summary = `Document traité avec succès: ${fileContent.substring(0, 100)}...`;
    }
    
    // Skip AI analysis for now per user request (transcription only)
    console.log('Skipping AI analysis - transcription only requested');

    console.log('Document processing completed');

    // Get public URL for the uploaded file
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('documents')
      .getPublicUrl(uploadData.path);

    // Save document to database with enhanced metadata
    const documentData = {
      original_filename: file.name,
      file_url: publicUrl,
      title: analysisData.title || file.name,
      title_ar: analysisData.title_ar || null,
      summary: analysisData.summary || '',
      summary_ar: analysisData.summary_ar || null,
      content: fileContent, // Store extracted content for all file types
      keywords: analysisData.keywords || [],
      keywords_ar: analysisData.keywords_ar || [],
      language: language, // Use the provided language
      file_size: file.size,
      page_count: totalPagesVar || 1,
      category_id: categoryId || null,
      document_type_id: documentTypeId || null,
      user_id: null, // Public upload - no user required
      status: extractionSuccess ? 'processed' : 'failed',
      // Enhanced metadata fields
      document_type: analysisData.document_type,
      main_topics: analysisData.main_topics || [],
      legal_references: analysisData.legal_references || [],
      entities: analysisData.entities || [],
      dates: analysisData.dates || [],
      jurisdiction: analysisData.jurisdiction,
      case_numbers: analysisData.case_numbers || [],
      legal_domains: analysisData.legal_domains || [],
      // Page-specific content for enhanced display
      page_contents: pageContents || null,
      processed_pages: processedPages || null,
      total_pages: totalPagesVar || null,
      // PDF/A specific metadata
      pdfa_compliance: pdfaInfo?.isPDFA || false,
      pdfa_version: pdfaInfo?.pdfaVersion || null,
      pdfa_conformance_level: pdfaInfo?.conformanceLevel || null,
      archival_metadata: pdfaInfo?.metadata || null,
      archival_features: pdfaInfo?.archivalFeatures || null,
      // Processing job reference for tracking
      processing_job_id: jobData?.id || null
    };

    console.log('Saving document with enhanced metadata:', {
      title: documentData.title,
      language: documentData.language,
      keywords_count: documentData.keywords.length,
      content_length: documentData.content.length,
      summary_length: documentData.summary.length,
      document_type: documentData.document_type,
      main_topics_count: documentData.main_topics.length,
      legal_references_count: documentData.legal_references.length,
      entities_count: documentData.entities.length
    });

    const { data: document, error: dbError } = await supabaseAdmin
      .from('documents')
      .insert(deepSanitize(documentData))
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    console.log('Document saved to database:', document.id);

    // Only trigger OCR in background if direct text extraction wasn't sufficient
    if (isPDF && !shouldUsePDFReader) {
      try {
        const pdfFormData = new FormData();
        pdfFormData.append('file', file);
        if (jobData?.id) {
          pdfFormData.append('jobId', jobData.id);
          pdfFormData.append('filename', file.name);
        }
        if (pdfaInfo?.recommendations) {
          pdfFormData.append('optimizedResolution', String(pdfaInfo.recommendations.optimizedResolution));
          pdfFormData.append('preserveMetadata', String(pdfaInfo.recommendations.preserveMetadata));
          pdfFormData.append('isArchival', String(pdfaInfo.archivalFeatures?.isArchival || false));
        }
        
        console.log('Triggering background OCR processing (direct extraction was insufficient)...');
        try {
          EdgeRuntime.waitUntil(
            supabaseAdmin.functions.invoke('pdf-ocr-batch', { body: pdfFormData })
              .then(() => console.log('Background PDF OCR completed successfully'))
              .catch((error) => console.error('Background PDF OCR failed:', error))
          );
        } catch {
          // Fallback if EdgeRuntime.waitUntil is not available
          supabaseAdmin.functions.invoke('pdf-ocr-batch', { body: pdfFormData })
            .catch((error) => console.error('Background PDF OCR failed:', error));
        }
      } catch (triggerErr) {
        console.error('Failed to trigger OCR after saving document:', triggerErr);
      }
    } else if (isPDF && shouldUsePDFReader) {
      console.log('Skipping OCR processing - direct text extraction was successful');
      
      // Update job status to completed since no further processing needed
      if (jobData?.id) {
        await supabaseAdmin
          .from('processing_jobs')
          .update({
            status: 'completed',
            progress: 100,
            current_step: 'direct_extraction_completed'
          })
          .eq('id', jobData.id);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      document,
      jobId: jobData?.id,
      message: 'Document uploaded successfully. Processing in background...'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in upload-document function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});