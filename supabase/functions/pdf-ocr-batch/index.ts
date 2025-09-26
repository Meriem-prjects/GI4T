import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BatchOCRResult {
  success: boolean;
  totalPages: number;
  processedPages: number;
  pages: any[];
  fullText: string;
  language: string;
  error?: string;
}

serve(async (req) => {
  console.log('PDF OCR batch function called');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const result: BatchOCRResult = {
      success: false,
      totalPages: 0,
      processedPages: 0,
      pages: [],
      fullText: '',
      language: 'fr',
      error: 'Batch OCR processing is currently simplified for stability'
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in pdf-ocr-batch function:', error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorResult: BatchOCRResult = {
      success: false,
      totalPages: 0,
      processedPages: 0,
      pages: [],
      fullText: '',
      language: 'fr',
      error: errorMessage
    };

    return new Response(JSON.stringify(errorResult), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});