import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import JSZip from "https://esm.sh/jszip@3.10.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Parse DOCX file and extract text content
 * DOCX files are ZIP archives containing XML files
 * The main text content is in word/document.xml
 */
async function parseDocxContent(file: File): Promise<{ success: boolean; content: string; error?: string }> {
  try {
    console.log('Starting DOCX parsing for:', file.name);
    
    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load as ZIP
    const zip = await JSZip.loadAsync(arrayBuffer);
    
    // Get the main document.xml file
    const documentXml = zip.file('word/document.xml');
    
    if (!documentXml) {
      console.error('No word/document.xml found in DOCX');
      return { success: false, content: '', error: 'Invalid DOCX structure: no document.xml found' };
    }
    
    // Get XML content
    const xmlContent = await documentXml.async('string');
    console.log('Extracted XML content length:', xmlContent.length);
    
    // Extract text from XML
    const extractedText = extractTextFromWordXml(xmlContent);
    
    console.log('Extracted text length:', extractedText.length);
    console.log('Text preview:', extractedText.substring(0, 200));
    
    return { success: true, content: extractedText };
  } catch (error) {
    console.error('DOCX parsing error:', error);
    return { 
      success: false, 
      content: '', 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}

/**
 * Extract text from Word document XML
 * Handles <w:t> elements and preserves paragraph structure
 */
function extractTextFromWordXml(xmlContent: string): string {
  const textParts: string[] = [];
  
  // Split by paragraphs <w:p>
  const paragraphs = xmlContent.split(/<w:p[^>]*>/);
  
  for (const para of paragraphs) {
    // Extract all text elements <w:t> within this paragraph
    const textMatches = para.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
    
    if (textMatches && textMatches.length > 0) {
      const paraText = textMatches
        .map(match => {
          // Extract text content from <w:t>text</w:t>
          const textContent = match.replace(/<w:t[^>]*>/, '').replace(/<\/w:t>/, '');
          return textContent;
        })
        .join('');
      
      if (paraText.trim()) {
        textParts.push(paraText.trim());
      }
    }
  }
  
  // Join paragraphs with double newlines
  return textParts.join('\n\n');
}

/**
 * Detect document language based on content
 */
function detectLanguage(text: string): string {
  // Simple Arabic detection
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
  const arabicMatches = text.match(arabicRegex);
  const arabicRatio = arabicMatches ? (text.match(new RegExp(arabicRegex, 'g'))?.length || 0) / text.length : 0;
  
  if (arabicRatio > 0.1) {
    return 'ar';
  }
  
  return 'fr';
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('DOCX Parser function called');
    
    // Parse form data
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      console.error('No file provided');
      return new Response(
        JSON.stringify({ success: false, error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Processing file:', file.name, 'Type:', file.type, 'Size:', file.size);
    
    // Validate file type
    const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                   file.name.toLowerCase().endsWith('.docx');
    const isDoc = file.type === 'application/msword' || 
                  file.name.toLowerCase().endsWith('.doc');
    
    if (!isDocx && !isDoc) {
      console.error('Invalid file type:', file.type);
      return new Response(
        JSON.stringify({ success: false, error: 'File must be a Word document (.docx or .doc)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // .doc files (old format) are not ZIP-based, we can't parse them the same way
    if (isDoc && !isDocx) {
      console.warn('Old .doc format detected - limited support');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Le format .doc ancien n\'est pas supporté. Veuillez convertir en .docx' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Parse DOCX
    const result = await parseDocxContent(file);
    
    if (!result.success) {
      return new Response(
        JSON.stringify({ success: false, error: result.error }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Detect language
    const language = detectLanguage(result.content);
    
    console.log('DOCX parsing successful:', {
      contentLength: result.content.length,
      language,
      preview: result.content.substring(0, 100)
    });
    
    return new Response(
      JSON.stringify({
        success: true,
        content: result.content,
        language,
        filename: file.name,
        fileSize: file.size
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('DOCX Parser error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
