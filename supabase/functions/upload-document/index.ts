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
    
    // Handle PDF files with page-by-page OpenAI parser
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      console.log('Processing PDF file with page-by-page OpenAI parser...');
      
      // Call PDF page parser function
      const pdfFormData = new FormData();
      pdfFormData.append('file', file);
      pdfFormData.append('maxPages', '15'); // Limit to 15 pages for performance
      
      try {
        const { data: pdfData, error: pdfError } = await supabaseAdmin.functions.invoke('pdf-page-parser', {
          body: pdfFormData
        });

        console.log('PDF page parser response:', pdfData);

        if (pdfError) {
          console.error('PDF parsing error:', pdfError);
          fileContent = `Erreur PDF: ${pdfError.message}`;
        } else if (pdfData?.success && pdfData?.fullText && pdfData.fullText.length > 20) {
          fileContent = pdfData.fullText;
          extractionSuccess = true;
          console.log(`PDF extraction successful: ${pdfData.processedPages}/${pdfData.totalPages} pages, content length: ${fileContent.length}`);
          
          // Store page-specific data for later use
          if (pdfData.pages && pdfData.pages.length > 0) {
            analysisData.page_contents = pdfData.pages;
            analysisData.total_pages = pdfData.totalPages;
            analysisData.processed_pages = pdfData.processedPages;
          }
        } else {
          console.warn('PDF parser returned insufficient content:', pdfData);
          fileContent = 'Contenu PDF non extractible - format nécessitant traitement manuel';
        }
      } catch (pdfException) {
        console.error('PDF processing exception:', pdfException);
        fileContent = `Exception PDF: ${pdfException.message}`;
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
    
    // Call document-analysis function for AI processing with enhanced metadata
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
    
    // Only analyze if we have sufficient content
    if (extractionSuccess && fileContent && fileContent.length > 50) {
      console.log('Calling enhanced document analysis...');
      try {
        const { data, error: analysisError } = await supabaseAdmin.functions.invoke('document-analysis', {
          body: {
            content: fileContent,
            language: 'auto'
          }
        });

        if (analysisError) {
          console.error('Analysis error:', analysisError);
        } else if (data) {
          analysisData = { ...analysisData, ...data };
          console.log('AI analysis successful:', {
            title: analysisData.title,
            language: analysisData.language,
            keywordsCount: analysisData.keywords?.length || 0,
            summaryLength: analysisData.summary?.length || 0,
            documentType: analysisData.document_type,
            mainTopicsCount: analysisData.main_topics?.length || 0
          });
        }
      } catch (analysisException) {
        console.error('Analysis exception:', analysisException);
      }
    } else {
      console.log('Skipping AI analysis - insufficient or failed content extraction');
    }

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
      page_count: analysisData.total_pages || 1,
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
      page_contents: analysisData.page_contents || null,
      processed_pages: analysisData.processed_pages || null
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