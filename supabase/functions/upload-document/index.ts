import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const categoryId = formData.get('categoryId') as string;
    const documentTypeId = formData.get('documentTypeId') as string;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'Aucun fichier fourni' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing document upload:', file.name, 'Type:', file.type, 'Size:', file.size);

    // Step 1: Upload file to Supabase Storage
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageFileName = `${timestamp}-${sanitizedFileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(storageFileName, file);

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error(`Erreur lors de l'upload: ${uploadError.message}`);
    }

    console.log('File uploaded to storage:', storageFileName);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(storageFileName);

    // Step 2: Extract content based on file type
    let extractedContent = '';
    let pages: string[] = [];
    let pageCount = 1;

    if (file.type === 'application/pdf') {
      console.log('Parsing PDF...');
      
      try {
        // Use our PDF parser function
        const pdfFormData = new FormData();
        pdfFormData.append('file', file);
        
        const pdfResponse = await fetch(`${supabaseUrl}/functions/v1/pdf-parser`, {
          method: 'POST',
          body: pdfFormData,
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
          }
        });

        if (pdfResponse.ok) {
          const pdfResult = await pdfResponse.json();
          if (pdfResult.success) {
            extractedContent = pdfResult.text;
            pages = pdfResult.pages || [extractedContent];
            pageCount = pdfResult.metadata?.pageCount || pages.length;
            console.log('PDF parsed successfully. Pages:', pageCount);
          } else {
            console.error('PDF parsing failed:', pdfResult.error);
            throw new Error(pdfResult.error);
          }
        } else {
          throw new Error(`PDF parser error: ${pdfResponse.status}`);
        }
      } catch (pdfError) {
        console.error('PDF parsing error:', pdfError);
        // Fallback for PDF
        extractedContent = `المستند: ${file.name}

تم رفع ملف PDF بنجاح. لم يتمكن النظام من استخراج النص تلقائياً، لكن يمكن إضافة المحتوى يدوياً في المحرر.

معلومات الملف:
- الاسم: ${file.name}
- الحجم: ${(file.size / 1024).toFixed(1)} KB
- النوع: PDF

يرجى إضافة النص والمحتوى في المحرر المخصص لذلك.`;
        pages = [extractedContent];
      }
    } else if (file.type === 'text/plain') {
      extractedContent = await file.text();
      pages = [extractedContent];
    } else if (file.type.includes('word') || file.type.includes('document')) {
      // For Word documents, provide a placeholder
      extractedContent = `المستند: ${file.name}

تم رفع مستند Word بنجاح. يرجى نسخ المحتوى ولصقه يدوياً في المحرر أدناه.

معلومات الملف:
- الاسم: ${file.name}  
- الحجم: ${(file.size / 1024).toFixed(1)} KB
- النوع: ${file.type}

لاستخراج النص بشكل تلقائي، يفضل استخدام ملفات PDF أو النص العادي.`;
      pages = [extractedContent];
    }

    console.log('Content extracted, length:', extractedContent.length);

    // Step 3: Analyze content with AI
    let analysisResult = null;
    try {
      console.log('Starting AI analysis...');
      
      const analysisResponse = await fetch(`${supabaseUrl}/functions/v1/document-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          content: extractedContent,
          language: 'ar'
        })
      });

      if (analysisResponse.ok) {
        analysisResult = await analysisResponse.json();
        console.log('AI analysis completed:', analysisResult);
      } else {
        console.error('Analysis failed:', analysisResponse.status);
      }
    } catch (analysisError) {
      console.error('Analysis error:', analysisError);
    }

    // Step 4: Save to database
    const documentData = {
      title: analysisResult?.title || file.name,
      title_ar: analysisResult?.title_ar || null,
      summary: analysisResult?.summary || '',
      summary_ar: analysisResult?.summary_ar || null,
      content: extractedContent,
      keywords: analysisResult?.keywords || [],
      keywords_ar: analysisResult?.keywords_ar || [],
      language: analysisResult?.language || 'ar',
      category_id: categoryId || null,
      document_type_id: documentTypeId || null,
      original_filename: file.name,
      file_url: urlData.publicUrl,
      file_size: file.size,
      page_count: pageCount,
      status: 'processed',
      // Enhanced metadata fields
      document_type: analysisResult?.document_type || null,
      main_topics: analysisResult?.main_topics || [],
      legal_references: analysisResult?.legal_references || [],
      entities: analysisResult?.entities || [],
      dates: analysisResult?.dates || [],
      jurisdiction: analysisResult?.jurisdiction || null,
      case_numbers: analysisResult?.case_numbers || [],
      legal_domains: analysisResult?.legal_domains || []
    };

    console.log('Saving document to database...');

    const { data: docData, error: docError } = await supabase
      .from('documents')
      .insert(documentData)
      .select()
      .single();

    if (docError) {
      console.error('Database insert error:', docError);
      throw new Error(`Erreur lors de la sauvegarde: ${docError.message}`);
    }

    console.log('Document saved successfully:', docData.id);

    return new Response(JSON.stringify({
      success: true,
      document: docData,
      pages: pages,
      message: 'Document uploaded and processed successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in upload-document function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erreur lors du traitement du document',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});