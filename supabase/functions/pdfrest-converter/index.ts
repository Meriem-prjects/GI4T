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

// Convert PDF to images using pdfRest API with PDF/A optimization
async function convertPdfWithPdfRest(pdfBuffer: ArrayBuffer, optimizedResolution?: number, preserveMetadata?: boolean): Promise<ConversionResult> {
  const pdfRestApiKey = Deno.env.get('PDFREST_API_KEY');
  
  if (!pdfRestApiKey) {
    throw new Error('PDFREST_API_KEY not configured');
  }

  try {
    console.log('Starting async PDF conversion with pdfRest API...');
    
    // Step 1: Submit PDF for conversion (async)
    const formData = new FormData();
    const pdfBlob = new Blob([pdfBuffer], { type: 'application/pdf' });
    formData.append('file', pdfBlob, 'document.pdf');
    formData.append('pages', '1-last');
    // Use optimized resolution for PDF/A documents (higher quality for archival)
    const resolution = optimizedResolution || 200;
    formData.append('resolution', resolution.toString());
    formData.append('color_model', 'rgb');

    // Use /jpg endpoint for async processing
    const submitResponse = await fetch('https://api.pdfrest.com/jpg', {
      method: 'POST',
      headers: {
        'Api-Key': pdfRestApiKey,
        'Response-Type': 'requestId'
      },
      body: formData
    });

    if (!submitResponse.ok) {
      const errorText = await submitResponse.text();
      console.error('pdfRest submit error:', submitResponse.status, errorText);
      throw new Error(`pdfRest submit error: ${submitResponse.status} - ${errorText}`);
    }

    const submitResult = await submitResponse.json();
    console.log('pdfRest submit response:', JSON.stringify(submitResult, null, 2));

    const requestId = submitResult.requestId;
    if (!requestId) {
      throw new Error('No requestId received from pdfRest');
    }

    console.log(`Request submitted with ID: ${requestId}, polling for completion...`);

    // Step 2: Poll for completion
    const maxWaitTime = 60000; // 60 seconds max
    const pollInterval = 2000; // Check every 2 seconds
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      console.log(`Polling request status for ${requestId}...`);
      
      const statusResponse = await fetch(`https://api.pdfrest.com/request-status/${requestId}`, {
        method: 'GET',
        headers: {
          'Api-Key': pdfRestApiKey,
        }
      });

      if (!statusResponse.ok) {
        console.error('Status check failed:', statusResponse.status);
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        continue;
      }

      const statusResult = await statusResponse.json();
      console.log(`Status: ${JSON.stringify(statusResult, null, 2)}`);

      if (statusResult.status === 'completed') {
        console.log('Conversion completed, extracting results...');
        
        // Extract resource IDs from completed response
        let resourceIds = [];
        
        if (statusResult.outputId && Array.isArray(statusResult.outputId)) {
          resourceIds = statusResult.outputId;
        } else if (statusResult.outputIds && Array.isArray(statusResult.outputIds)) {
          resourceIds = statusResult.outputIds;
        } else if (statusResult.outputUrl && Array.isArray(statusResult.outputUrl)) {
          // Extract IDs from URLs like: https://api.pdfrest.com/resource/ID?format=file
          resourceIds = statusResult.outputUrl.map((url: string) => {
            const match = url.match(/\/resource\/([^?]+)/);
            return match ? match[1] : null;
          }).filter(Boolean);
        } else {
          console.error('No output IDs found in completed response:', Object.keys(statusResult));
          throw new Error('No output IDs found in completed response');
        }

        console.log(`Found ${resourceIds.length} resource IDs:`, resourceIds);

        // Step 3: Download images
        const images: PageImage[] = [];

        for (let i = 0; i < resourceIds.length; i++) {
          const resourceId = resourceIds[i];
          console.log(`Downloading image ${i + 1}/${resourceIds.length}: ${resourceId}`);
          
          const imageResponse = await fetch(`https://api.pdfrest.com/resource/${resourceId}`, {
            method: 'GET',
            headers: {
              'Api-Key': pdfRestApiKey,
            }
          });
          
          if (!imageResponse.ok) {
            console.error(`Failed to download image ${i + 1}:`, imageResponse.status);
            continue;
          }

          const imageBuffer = await imageResponse.arrayBuffer();
          const uint8Array = new Uint8Array(imageBuffer);
          
          // Convert to base64 in chunks
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
            width: 2480,
            height: 3508
          });

          console.log(`Page ${i + 1} converted successfully (${base64Image.length} chars)`);
        }

        return {
          success: true,
          totalPages: images.length,
          images
        };

      } else if (statusResult.status === 'failed') {
        throw new Error(`pdfRest processing failed: ${statusResult.message || 'Unknown error'}`);
      } else {
        // Still processing, wait and retry
        console.log(`Status: ${statusResult.status}, waiting ${pollInterval}ms...`);
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
    }

    throw new Error('Timeout waiting for pdfRest processing to complete');

  } catch (error) {
    console.error('pdfRest conversion error:', error);
    return {
      success: false,
      totalPages: 0,
      images: [],
      error: error instanceof Error ? error.message : String(error)
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
    
    // Get PDF/A optimization parameters
    const optimizedResolution = parseInt(formData.get('optimizedResolution') as string) || 200;
    const preserveMetadata = (formData.get('preserveMetadata') as string) === 'true';
    const isArchival = (formData.get('isArchival') as string) === 'true';
    
    console.log('PDF conversion with optimization:', {
      resolution: optimizedResolution,
      preserveMetadata,
      isArchival
    });

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
    const result = await convertPdfWithPdfRest(pdfBuffer, optimizedResolution, preserveMetadata);

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
      error: error instanceof Error ? error.message : String(error)
    };

    return new Response(JSON.stringify(errorResult), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});