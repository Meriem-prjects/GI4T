import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('PDF OCR single-page function called - DEPRECATED AND DISABLED');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // This function is deprecated to avoid MIME type errors with OpenAI Vision API
  // All PDF OCR processing now uses the robust batch processing system
  const errorMessage = 'This single-page PDF OCR function is deprecated and disabled. The system now uses robust batch processing with multiple fallback mechanisms. Please use the document upload interface which automatically uses the improved processing pipeline.';
  
  console.warn(errorMessage);
  
  return new Response(JSON.stringify({ 
    success: false,
    error: errorMessage,
    deprecated: true,
    redirect_to: 'pdf-ocr-batch',
    note: 'Use the document upload interface for PDF processing',
    content: '',
    pages: [],
    fullText: '',
    processedPages: 0,
    totalPages: 0
  }), {
    status: 410, // Gone - indicates the resource is no longer available
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});