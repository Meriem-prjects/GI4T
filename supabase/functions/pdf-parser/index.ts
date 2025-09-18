import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PdfParseResult {
  success: boolean;
  text: string;
  pages: string[];
  metadata?: {
    pageCount: number;
    title?: string;
  };
  error?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(
        JSON.stringify({ success: false, error: 'Aucun fichier fourni' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing PDF file:', file.name, 'Size:', file.size);

    const fileBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(fileBuffer);

    // Multiple extraction methods for robust PDF parsing
    let extractedText = '';
    let pages: string[] = [];

    try {
      // Method 1: Simple text extraction using regex patterns
      const pdfString = new TextDecoder('latin1').decode(uint8Array);
      
      // Look for text between stream objects
      const streamRegex = /stream\s*(.*?)\s*endstream/gs;
      const matches = pdfString.match(streamRegex) || [];
      
      let allText = '';
      for (const match of matches) {
        const streamContent = match.replace(/^stream\s*/, '').replace(/\s*endstream$/, '');
        
        // Try to extract readable text
        const textMatches = streamContent.match(/\(([^)]+)\)/g) || [];
        for (const textMatch of textMatches) {
          const text = textMatch.slice(1, -1); // Remove parentheses
          if (text.length > 1 && /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u0041-\u007A]/.test(text)) {
            allText += text + ' ';
          }
        }
      }

      // Method 2: Look for Tj operators (text showing operators in PDF)
      const tjRegex = /\[(.*?)\]\s*TJ/gs;
      const tjMatches = pdfString.match(tjRegex) || [];
      for (const match of tjMatches) {
        const content = match.replace(/\[(.*?)\]\s*TJ/, '$1');
        if (content.length > 1) {
          allText += content + ' ';
        }
      }

      // Method 3: Look for simple text patterns
      const simpleTextRegex = /\(([^\)]{3,})\)/g;
      const simpleMatches = pdfString.match(simpleTextRegex) || [];
      for (const match of simpleMatches) {
        const text = match.slice(1, -1);
        if (/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u0041-\u007A]/.test(text)) {
          allText += text + ' ';
        }
      }

      // Clean and normalize the extracted text
      extractedText = allText
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\s+/g, ' ')
        .trim();

      console.log('Extracted text length:', extractedText.length);

      // Try to split into pages based on common page break patterns
      if (extractedText.length > 0) {
        // Look for page numbers or form feed characters
        const pageBreakRegex = /(?:\f|\n\s*\d+\s*\n|\n\s*Page\s*\d+|\n\s*صفحة\s*\d+)/gi;
        pages = extractedText.split(pageBreakRegex).filter(page => page.trim().length > 50);
        
        if (pages.length === 0) {
          // If no clear page breaks, split by length
          const pageSize = 2000;
          for (let i = 0; i < extractedText.length; i += pageSize) {
            pages.push(extractedText.substring(i, i + pageSize));
          }
        }
      }

      // If extraction failed, try different encoding
      if (extractedText.length < 50) {
        console.log('Trying UTF-8 encoding...');
        const utf8String = new TextDecoder('utf-8').decode(uint8Array);
        const utf8TextMatches = utf8String.match(/\(([^\)]{3,})\)/g) || [];
        let utf8Text = '';
        for (const match of utf8TextMatches) {
          const text = match.slice(1, -1);
          if (/[\u0600-\u06FF\u0750-\u077F\u0041-\u007A]/.test(text)) {
            utf8Text += text + ' ';
          }
        }
        if (utf8Text.length > extractedText.length) {
          extractedText = utf8Text.trim();
          pages = [extractedText];
        }
      }

    } catch (error) {
      console.error('PDF parsing error:', error);
    }

    // If still no text extracted, provide a fallback
    if (extractedText.length < 10) {
      extractedText = `المستند: ${file.name}

هذا ملف PDF تم رفعه للمعالجة. لم يتمكن النظام من استخراج النص بشكل مباشر، ولكن يمكن متابعة المعالجة مع البيانات الوصفية المتاحة.

تفاصيل الملف:
- اسم الملف: ${file.name}
- حجم الملف: ${(file.size / 1024).toFixed(1)} KB
- نوع الملف: PDF

يمكنك إضافة المحتوى يدوياً في المحرر أو إعادة المحاولة بملف آخر.`;
      
      pages = [extractedText];
    }

    const result: PdfParseResult = {
      success: true,
      text: extractedText,
      pages: pages,
      metadata: {
        pageCount: pages.length,
        title: file.name.replace(/\.[^/.]+$/, '')
      }
    };

    console.log('PDF parsing completed. Pages:', pages.length, 'Total text length:', extractedText.length);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in pdf-parser function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Erreur lors du parsing PDF',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});