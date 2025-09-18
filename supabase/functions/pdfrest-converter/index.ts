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

async function convertPdfWithPdfRest(pdfBuffer: ArrayBuffer): Promise<ConversionResult> {
  const pdfRestApiKey = Deno.env.get('PDFREST_API_KEY');
  
  if (!pdfRestApiKey) {
    throw new Error('PDFREST_API_KEY not configured');
  }

  try {
    console.log('Converting PDF with pdfRest API...');
    
    // Create form data with the PDF
    const formData = new FormData();
    const pdfBlob = new Blob([pdfBuffer], { type: 'application/pdf' });
    formData.append('file', pdfBlob, 'document.pdf');
    formData.append('pages', 'all');
    formData.append('resolution', '300'); // High resolution for better OCR
    formData.append('format', 'png'); // PNG format for quality

    // Call pdfRest API
    const response = await fetch('https://api.pdfrest.com/pdf-to-images', {
      method: 'POST',
      headers: {
        'Api-Key': pdfRestApiKey,
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('pdfRest API error:', response.status, errorText);
      throw new Error(`pdfRest API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('pdfRest response:', result);

    // Check if the conversion was successful
    if (!result.outputUrl && !result.outputUrls) {
      throw new Error('No output URLs returned from pdfRest');
    }

    // Handle both single URL and multiple URLs
    const imageUrls = result.outputUrls || [result.outputUrl];
    const images: PageImage[] = [];

    // Download each image and convert to base64
    for (let i = 0; i < imageUrls.length; i++) {
      const imageUrl = imageUrls[i];
      console.log(`Downloading image ${i + 1}/${imageUrls.length}: ${imageUrl}`);
      
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        console.error(`Failed to download image ${i + 1}:`, imageResponse.status);
        continue;
      }

      const imageBuffer = await imageResponse.arrayBuffer();
      const uint8Array = new Uint8Array(imageBuffer);
      
      // Convert to base64 in chunks to avoid call stack issues
      const chunkSize = 8192;
      const chunks: string[] = [];
      
      for (let j = 0; j < uint8Array.length; j += chunkSize) {
        const chunk = uint8Array.slice(j, j + chunkSize);
        chunks.push(String.fromCharCode.apply(null, Array.from(chunk)));
      }
      
      const base64Image = btoa(chunks.join(''));

      images.push({
        pageNumber: i + 1,
        imageData: base64Image,
        width: 2480, // Approximate width at 300 DPI for A4
        height: 3508 // Approximate height at 300 DPI for A4
      });

      console.log(`Page ${i + 1} converted successfully (${base64Image.length} chars)`);
    }

    return {
      success: true,
      totalPages: images.length,
      images
    };

  } catch (error) {
    console.error('pdfRest conversion error:', error);
    return {
      success: false,
      totalPages: 0,
      images: [],
      error: error.message
    };
  }
}

serve(async (req) => {
  console.log('pdfRest converter function called');

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

    console.log(`Converting PDF with pdfRest: ${file.name} (${file.size} bytes)`);

    // Check file size limit (50MB)
    if (file.size > 50 * 1024 * 1024) {
      throw new Error('PDF trop volumineux. Limite : 50MB');
    }

    const pdfBuffer = await file.arrayBuffer();
    const result = await convertPdfWithPdfRest(pdfBuffer);

    if (!result.success) {
      throw new Error(result.error || 'Failed to convert PDF with pdfRest');
    }

    console.log(`pdfRest conversion completed: ${result.images.length} pages converted`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in pdfrest-converter function:', error);
    
    const errorResult: ConversionResult = {
      success: false,
      totalPages: 0,
      images: [],
      error: error.message
    };

    return new Response(JSON.stringify(errorResult), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});