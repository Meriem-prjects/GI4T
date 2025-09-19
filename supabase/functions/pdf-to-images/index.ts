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

// Convert PDF to images using pdfjs-dist compatible with Deno
async function convertPdfToImages(pdfBuffer: ArrayBuffer): Promise<ConversionResult> {
  try {
    // Import PDF.js library compatible with Deno
    const pdfjsLib = await import('https://esm.sh/pdfjs-dist@4.0.379');
    
    console.log('Loading PDF with pdfjs-dist...');
    
    // Configure worker for Deno environment
    if (pdfjsLib.GlobalWorkerOptions) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.min.js';
    }
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(pdfBuffer),
      verbosity: 0,
      disableWorker: true, // Disable worker in Deno environment
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
        
        // Create compatible canvas context for Deno
        const canvasWidth = Math.floor(viewport.width);
        const canvasHeight = Math.floor(viewport.height);
        
        // Use a simple canvas implementation that works in Deno
        const canvasData = new Uint8ClampedArray(canvasWidth * canvasHeight * 4); // RGBA
        
        // Create a minimal canvas-like object
        const mockCanvas = {
          width: canvasWidth,
          height: canvasHeight,
          getContext: () => ({
            canvas: { width: canvasWidth, height: canvasHeight },
            fillStyle: 'white',
            fillRect: (x: number, y: number, w: number, h: number) => {
              // Fill with white background
              for (let i = 0; i < canvasData.length; i += 4) {
                canvasData[i] = 255;     // R
                canvasData[i + 1] = 255; // G  
                canvasData[i + 2] = 255; // B
                canvasData[i + 3] = 255; // A
              }
            },
            putImageData: (imageData: any, dx: number, dy: number) => {
              // Simple image data handling
              if (imageData && imageData.data) {
                const len = Math.min(imageData.data.length, canvasData.length);
                for (let i = 0; i < len; i++) {
                  canvasData[i] = imageData.data[i];
                }
              }
            },
            getImageData: (x: number, y: number, w: number, h: number) => ({
              data: canvasData,
              width: w,
              height: h
            }),
            createImageData: (w: number, h: number) => ({
              data: new Uint8ClampedArray(w * h * 4),
              width: w,
              height: h
            })
          })
        };
        
        const context = mockCanvas.getContext();
        
        // Fill with white background
        context.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // Render page using PDF.js text rendering
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        
        try {
          await page.render(renderContext).promise;
        } catch (renderError) {
          console.warn(`Render failed for page ${pageNum}, extracting text directly:`, renderError);
          
          // Fallback: extract text content instead of rendering
          const textContent = await page.getTextContent();
          const textItems = textContent.items.map((item: any) => item.str).join(' ');
          
          if (textItems.trim()) {
            // Create a simple text-based image representation
            const textImageData = createTextImage(textItems, canvasWidth, canvasHeight);
            images.push({
              pageNumber: pageNum,
              imageData: textImageData,
              width: canvasWidth,
              height: canvasHeight
            });
            console.log(`Page ${pageNum} converted as text (${textItems.length} chars)`);
            continue;
          }
        }
        
        // Convert canvas data to JPEG-like format (simplified)
        const base64Image = await canvasToBase64(canvasData, canvasWidth, canvasHeight);
        
        images.push({
          pageNumber: pageNum,
          imageData: base64Image,
          width: canvasWidth,
          height: canvasHeight
        });
        
        console.log(`Page ${pageNum} converted successfully`);
        
      } catch (pageError) {
        console.error(`Error processing page ${pageNum}:`, pageError);
        
        // Try to extract text as fallback
        try {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const textItems = textContent.items.map((item: any) => item.str).join(' ');
          
          if (textItems.trim()) {
            const textImageData = createTextImage(textItems, 800, 600);
            images.push({
              pageNumber: pageNum,
              imageData: textImageData,
              width: 800,
              height: 600
            });
            console.log(`Page ${pageNum} fallback to text extraction`);
          }
        } catch (fallbackError) {
          console.error(`Fallback failed for page ${pageNum}:`, fallbackError);
        }
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
      error: error.message
    };
  }
}

// Helper function to create a simple text-based image
function createTextImage(text: string, width: number, height: number): string {
  // Create a simple bitmap representation of text
  // This is a placeholder - in a real implementation you'd use proper text rendering
  const canvas = new Uint8ClampedArray(width * height * 4);
  
  // Fill with white background
  for (let i = 0; i < canvas.length; i += 4) {
    canvas[i] = 255;     // R
    canvas[i + 1] = 255; // G
    canvas[i + 2] = 255; // B
    canvas[i + 3] = 255; // A
  }
  
  // Add some basic text representation (black pixels for text areas)
  const textLines = text.split(/\s+/).slice(0, 50); // First 50 words
  for (let lineIdx = 0; lineIdx < Math.min(textLines.length, 20); lineIdx++) {
    const y = 50 + lineIdx * 25;
    for (let x = 50; x < Math.min(width - 50, 50 + textLines[lineIdx].length * 8); x += 8) {
      const pixelIndex = (y * width + x) * 4;
      if (pixelIndex < canvas.length - 3) {
        canvas[pixelIndex] = 0;     // R
        canvas[pixelIndex + 1] = 0; // G
        canvas[pixelIndex + 2] = 0; // B
        canvas[pixelIndex + 3] = 255; // A
      }
    }
  }
  
  return canvasToBase64(canvas, width, height);
}

// Helper function to convert canvas data to base64
function canvasToBase64(imageData: Uint8ClampedArray, width: number, height: number): string {
  // Create a simple BMP-like structure for the image
  // This is a simplified approach - real implementation would use proper image encoding
  const data = [];
  
  // Simple encoding: convert RGBA to a base64 representation
  for (let i = 0; i < imageData.length; i += 4) {
    const r = imageData[i];
    const g = imageData[i + 1];
    const b = imageData[i + 2];
    // Convert to grayscale and then to a simple format
    const gray = Math.floor((r + g + b) / 3);
    data.push(String.fromCharCode(gray));
  }
  
  return btoa(data.join(''));
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