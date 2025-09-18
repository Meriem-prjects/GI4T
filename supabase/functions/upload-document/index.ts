import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to sanitize filename for storage
function sanitizeFilename(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.');
  const name = lastDotIndex !== -1 ? filename.slice(0, lastDotIndex) : filename;
  const extension = lastDotIndex !== -1 ? filename.slice(lastDotIndex) : '';
  
  // Replace special characters with underscores and remove consecutive underscores
  const sanitizedName = name
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

    if (!file) {
      throw new Error('No file provided');
    }

    console.log(`Processing file: ${file.name}, size: ${file.size}`);

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
      language: 'fr',
      document_type: null,
      main_topics: [],
      legal_references: [],
      entities: [],
      dates: [],
      jurisdiction: null,
      case_numbers: [],
      legal_domains: []
    };
    
    // Handle different file types
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      console.log('Processing PDF file - detecting PDF/A compliance first...');
      
      // First, detect if this is a PDF/A document for optimized processing
      let pdfaInfo = null;
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
        const pdfFormData = new FormData();
        pdfFormData.append('file', file);
        
        // Add PDF/A optimization parameters if detected
        if (pdfaInfo?.recommendations) {
          pdfFormData.append('optimizedResolution', pdfaInfo.recommendations.optimizedResolution.toString());
          pdfFormData.append('preserveMetadata', pdfaInfo.recommendations.preserveMetadata.toString());
          pdfFormData.append('isArchival', pdfaInfo.archivalFeatures.isArchival.toString());
        }
        
        const { data: pdfData, error: pdfError } = await supabaseAdmin.functions.invoke('pdf-ocr-batch', {
          body: pdfFormData
        });
        
        console.log('PDF OCR batch response:', {
          success: pdfData?.success,
          totalPages: pdfData?.totalPages,
          processedPages: pdfData?.processedPages,
          language: pdfData?.language,
          contentLength: pdfData?.fullText?.length || 0
        });
        
        if (pdfError) {
          console.error('PDF OCR batch error:', pdfError);
          fileContent = `Erreur PDF OCR: ${pdfError.message}`;
        } else if (pdfData?.success && pdfData?.fullText && pdfData.fullText.length > 5) {
          fileContent = pdfData.fullText;
          extractionSuccess = true;
          
          // Update analysis data with detected language
          if (pdfData.language) {
            analysisData.language = pdfData.language;
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
          
          // Store page-specific data
          if (pdfData.pages && pdfData.pages.length > 0) {
            pageContents = pdfData.pages.map((page: any) => ({
              pageNumber: page.pageNumber,
              content: page.content,
              confidence: page.confidence || 0.9,
              language: page.language || 'fr'
            }));
          }
          processedPages = pdfData.processedPages || 0;
          totalPagesVar = pdfData.totalPages || 0;
          
          console.log(`PDF OCR extraction successful: ${processedPages}/${totalPagesVar} pages, content length: ${fileContent.length}, language: ${pdfData.language}`);
        } else {
          console.warn('PDF OCR returned insufficient content:', pdfData);
          fileContent = 'PDF OCR n\'a pas pu extraire le contenu';
        }
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
      language: analysisData.language || 'fr',
      file_size: file.size,
      page_count: totalPagesVar || 1,
      category_id: categoryId || null,
      document_type_id: documentTypeId || null,
      user_id: null, // Public upload - no user required
      status: 'processed',
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
      archival_features: pdfaInfo?.archivalFeatures || null
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
      .insert(documentData)
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    console.log('Document saved to database:', document.id);

    return new Response(JSON.stringify({ 
      success: true, 
      document,
      message: 'Document uploaded and processed successfully'
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