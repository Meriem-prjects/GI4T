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
    
    // Handle PDF files with dedicated parser
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      console.log('Processing PDF file...');
      
      // Call PDF parser function
      const pdfFormData = new FormData();
      pdfFormData.append('file', file);
      
      const { data: pdfData, error: pdfError } = await supabaseAdmin.functions.invoke('pdf-parser', {
        body: pdfFormData
      });

      if (pdfError) {
        console.error('PDF parsing error:', pdfError);
        fileContent = 'Erreur lors de l\'extraction du contenu PDF';
      } else {
        fileContent = pdfData.text || 'Contenu PDF extrait';
      }
    } else {
      // For text files, read as text
      fileContent = await file.text();
    }
    
    // Call document-analysis function for AI processing
    let analysisData = {
      title: file.name,
      summary: 'Document uploadé',
      keywords: [],
      language: 'fr'
    };
    
    if (fileContent && fileContent.length > 10) {
      console.log('Calling document analysis...');
      const { data, error: analysisError } = await supabaseAdmin.functions.invoke('document-analysis', {
        body: {
          content: fileContent,
          language: 'auto'
        }
      });

      if (analysisError) {
        console.error('Analysis error:', analysisError);
      } else {
        analysisData = data;
      }
    } else {
      console.log('Skipping analysis - insufficient content');
    }

    console.log('Document processing completed');

    // Get public URL for the uploaded file
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('documents')
      .getPublicUrl(uploadData.path);

    // Save document to database with null user_id (public upload)
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
      page_count: 1,
      category_id: categoryId || null,
      document_type_id: documentTypeId || null,
      user_id: null, // Public upload - no user required
      status: 'processed'
    };

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