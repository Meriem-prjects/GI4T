import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('PDF OCR single-page function called - DEPRECATED');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // This function is deprecated to avoid MIME type errors
  // All PDF OCR processing should use the pdf-ocr-batch function instead
  const errorMessage = 'This function is deprecated. Please use the batch PDF OCR processing instead.';
  
  console.warn(errorMessage);
  
  return new Response(JSON.stringify({ 
    error: errorMessage,
    redirect_to: 'pdf-ocr-batch'
  }), {
    status: 410, // Gone - indicates the resource is no longer available
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});