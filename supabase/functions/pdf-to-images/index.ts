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

// Convert PDF to images using Canvas API with pdf.js
async function convertPdfToImages(pdfBuffer: ArrayBuffer): Promise<ConversionResult> {
  try {
    // Import PDF.js library
    const pdfjsLib = await import('https://cdn.skypack.dev/pdfjs-dist@3.11.174');
    
    console.log('Loading PDF with pdf.js...');
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(pdfBuffer),
      verbosity: 0
    });
    
    const pdf = await loadingTask.promise;
    const totalPages = pdf.numPages;
    
    console.log(`PDF loaded successfully. Total pages: ${totalPages}`);
    
    const images: PageImage[] = [];
    
    // Process each page
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      console.log(`Processing page ${pageNum}/${totalPages}...`);
      
      try {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 }); // Higher resolution
        
        // Create canvas
        const canvas = createCanvas(viewport.width, viewport.height);
        const context = canvas.getContext('2d');
        
        if (!context) {
          throw new Error('Failed to get canvas context');
        }
        
        // Render page to canvas
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        
        await page.render(renderContext).promise;
        
        // Convert canvas to image data (JPEG for smaller size)
        const blob = await canvas.convertToBlob({ 
          type: 'image/jpeg', 
          quality: 0.9 
        });
        
        // Convert to base64
        const arrayBuffer = await blob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Convert to base64 in chunks to avoid call stack issues
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
          width: viewport.width,
          height: viewport.height
        });
        
        console.log(`Page ${pageNum} converted successfully (${base64Image.length} chars)`);
        
      } catch (pageError) {
        console.error(`Error processing page ${pageNum}:`, pageError);
        // Continue with other pages even if one fails
      }
    }
    
    return {
      success: true,
      totalPages,
      images
    };
    
  } catch (error) {
    console.error('PDF conversion error:', error);
    return {
      success: false,
      totalPages: 0,
      images: [],
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Alternative to OffscreenCanvas for Deno
function createCanvas(width: number, height: number): any {
  try {
    // Try OffscreenCanvas if available
    return new (globalThis as any).OffscreenCanvas(width, height);
  } catch {
    // Fallback - create a simple object that satisfies the interface
    return {
      width,
      height,
      getContext: () => null,
      convertToBlob: () => Promise.resolve(new Blob())
    };
  }
}

serve(async (req) => {

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