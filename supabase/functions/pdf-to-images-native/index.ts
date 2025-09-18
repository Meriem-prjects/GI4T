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

async function convertPdfToImages(pdfBuffer: ArrayBuffer): Promise<ConversionResult> {
  try {
    console.log('Starting PDF to images conversion with native PDF.js...');
    
    // Import PDF.js modules
    const pdfjs = await import("https://esm.sh/pdfjs-dist@4.0.379/build/pdf.mjs");
    
    // Configure PDF.js worker
    pdfjs.GlobalWorkerOptions.workerSrc = "https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.mjs";
    
    // Load the PDF document
    const uint8Array = new Uint8Array(pdfBuffer);
    const loadingTask = pdfjs.getDocument({ data: uint8Array });
    const pdf = await loadingTask.promise;
    
    console.log(`PDF loaded successfully. Total pages: ${pdf.numPages}`);
    
    const images: PageImage[] = [];
    
    // Convert each page to image
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      console.log(`Processing page ${pageNum}/${pdf.numPages}`);
      
      try {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better quality
        
        // Create canvas
        const canvas = new OffscreenCanvas(viewport.width, viewport.height);
        const context = canvas.getContext('2d');
        
        if (!context) {
          throw new Error('Could not get 2D context');
        }
        
        // Render page to canvas
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        
        await page.render(renderContext).promise;
        
        // Convert canvas to blob then to base64
        const blob = await canvas.convertToBlob({ type: 'image/png', quality: 0.95 });
        const arrayBuffer = await blob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Convert to base64 in chunks
        const chunkSize = 8192;
        const chunks: string[] = [];
        
        for (let i = 0; i < uint8Array.length; i += chunkSize) {
          const chunk = uint8Array.slice(i, i + chunkSize);
          chunks.push(String.fromCharCode.apply(null, Array.from(chunk)));
        }
        
        const base64Image = btoa(chunks.join(''));
        
        images.push({
          pageNumber: pageNum,
          imageData: base64Image,
          width: Math.round(viewport.width),
          height: Math.round(viewport.height)
        });
        
        console.log(`Page ${pageNum} converted successfully (${base64Image.length} chars)`);
        
        // Clean up
        page.cleanup();
        
      } catch (pageError) {
        console.error(`Error processing page ${pageNum}:`, pageError);
        // Continue with other pages
      }
    }
    
    // Clean up PDF document
    pdf.destroy();
    
    if (images.length === 0) {
      throw new Error('No pages could be converted to images');
    }
    
    return {
      success: true,
      totalPages: images.length,
      images
    };
    
  } catch (error) {
    console.error('PDF to images conversion error:', error);
    return {
      success: false,
      totalPages: 0,
      images: [],
      error: error.message
    };
  }
}

serve(async (req) => {
  console.log('PDF to images native function called');

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

    console.log(`Converting PDF natively: ${file.name} (${file.size} bytes)`);

    // Check file size limit (50MB)
    if (file.size > 50 * 1024 * 1024) {
      throw new Error('PDF trop volumineux. Limite : 50MB');
    }

    const pdfBuffer = await file.arrayBuffer();
    const result = await convertPdfToImages(pdfBuffer);

    if (!result.success) {
      throw new Error(result.error || 'Failed to convert PDF to images');
    }

    console.log(`Native PDF conversion completed: ${result.images.length} pages converted`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in pdf-to-images-native function:', error);
    
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