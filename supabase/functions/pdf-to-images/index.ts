import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PageImage {
  pageNumber: number;
  imageData: string; // base64
  width: number;
  height: number;
}

interface ConversionResult {
  success: boolean;
  totalPages: number;
  images: PageImage[];
  error?: string;
}

// Convert PDF to images - Simplified for Deno environment
async function convertPdfToImages(pdfBuffer: ArrayBuffer): Promise<ConversionResult> {
  try {
    console.log('PDF to images conversion not fully supported in Deno edge functions');
    console.log('This is a placeholder implementation that extracts basic PDF info');
    
    // Basic PDF validation
    const pdfHeader = new TextDecoder('latin1').decode(new Uint8Array(pdfBuffer).slice(0, 10));
    if (!pdfHeader.includes('%PDF')) {
      throw new Error('Invalid PDF file');
    }
    
    // Return a minimal result - in practice, this would need a different approach
    // for full PDF to images conversion in Deno edge functions
    return {
      success: false,
      totalPages: 0,
      images: [],
      error: 'PDF to images conversion requires server-side processing with canvas support'
    };
    
  } catch (error) {
    console.error('PDF conversion error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      totalPages: 0,
      images: [],
      error: errorMessage
    };
  }
}

serve(async (req) => {
  console.log('PDF to images function called');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      throw new Error('No file provided');
    }

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      throw new Error('File is not a PDF');
    }

    console.log(`Converting PDF: ${file.name} (${file.size} bytes)`);

    // Check file size limit (50MB for PDF processing)
    if (file.size > 50 * 1024 * 1024) {
      throw new Error('PDF trop volumineux. Limite : 50MB');
    }

    const pdfBuffer = await file.arrayBuffer();
    const result = await convertPdfToImages(pdfBuffer);

    if (!result.success) {
      throw new Error(result.error || 'Failed to convert PDF to images');
    }

    console.log(`PDF conversion completed: ${result.images.length} pages converted`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in pdf-to-images function:', error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorResult: ConversionResult = {
      success: false,
      totalPages: 0,
      images: [],
      error: errorMessage
    };

    return new Response(JSON.stringify(errorResult), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});