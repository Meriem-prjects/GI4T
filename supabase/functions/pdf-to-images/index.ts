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

interface PDFInfo {
  isPasswordProtected: boolean;
  isCorrupted: boolean;
  pageCount: number;
  version: string;
}

// Enhanced PDF validation
async function validatePDF(pdfBuffer: ArrayBuffer): Promise<PDFInfo> {
  const bytes = new Uint8Array(pdfBuffer);
  const text = new TextDecoder('latin1').decode(bytes.slice(0, 2048));
  
  // Check PDF header
  if (!text.startsWith('%PDF-')) {
    throw new Error('Fichier PDF invalide: signature manquante');
  }
  
  // Extract version
  const versionMatch = text.match(/%PDF-(\d+\.\d+)/);
  const version = versionMatch ? versionMatch[1] : 'unknown';
  
  // Check for password protection
  const isPasswordProtected = text.includes('/Encrypt') || 
                              text.includes('/Filter /Standard') ||
                              text.includes('/Type /Encrypt');
  
  // Check for corruption indicators
  const isCorrupted = !text.includes('%%EOF') && bytes.length > 1024;
  
  // Estimate page count (rough approximation)
  const pageMatches = text.match(/\/Type\s*\/Page\b/g);
  const pageCount = pageMatches ? pageMatches.length : 1;
  
  return {
    isPasswordProtected,
    isCorrupted,
    pageCount: Math.max(pageCount, 1),
    version
  };
}

// Multi-strategy PDF conversion with robust fallbacks
async function convertPdfToImages(pdfBuffer: ArrayBuffer): Promise<ConversionResult> {
  console.log(`Converting PDF: blob (${pdfBuffer.byteLength} bytes)`);
  
  try {
    // Step 1: Validate PDF first
    const pdfInfo = await validatePDF(pdfBuffer);
    console.log('PDF validation result:', pdfInfo);
    
    if (pdfInfo.isPasswordProtected) {
      throw new Error('PDF protégé par mot de passe non supporté');
    }
    
    if (pdfInfo.isCorrupted) {
      throw new Error('Fichier PDF corrompu ou endommagé');
    }
    
    // Strategy 1: Try native Deno PDF processing with pdf2pic-like approach
    try {
      console.log('Attempting native PDF conversion...');
      const result = await convertWithNativeStrategy(pdfBuffer, pdfInfo);
      if (result.success && result.images.length > 0) {
        console.log(`Native conversion successful: ${result.images.length} pages`);
        return result;
      }
    } catch (nativeError) {
      console.warn('Native conversion failed:', nativeError);
    }
    
    // Strategy 2: Try PDF.js with better error handling
    try {
      console.log('Attempting PDF.js conversion...');
      const result = await convertWithPdfJs(pdfBuffer);
      if (result.success && result.images.length > 0) {
        console.log(`PDF.js conversion successful: ${result.images.length} pages`);
        return result;
      }
    } catch (pdfjsError) {
      console.warn('PDF.js conversion failed:', pdfjsError);
    }
    
    // Strategy 3: Fallback to simple image extraction
    try {
      console.log('Attempting image extraction fallback...');
      const result = await extractImagesFromPdf(pdfBuffer);
      if (result.success && result.images.length > 0) {
        console.log(`Image extraction successful: ${result.images.length} images`);
        return result;
      }
    } catch (extractError) {
      console.warn('Image extraction failed:', extractError);
    }
    
    // All strategies failed
    throw new Error('Toutes les méthodes de conversion ont échoué. Service temporairement indisponible.');
    
  } catch (error) {
    console.error('PDF conversion error:', error);
    return {
      success: false,
      totalPages: 0,
      images: [],
      error: error.message || 'Erreur de conversion PDF inconnue'
    };
  }
}

// Native strategy using modern web APIs
async function convertWithNativeStrategy(pdfBuffer: ArrayBuffer, pdfInfo: PDFInfo): Promise<ConversionResult> {
  // This is a placeholder for a native implementation
  // In a real scenario, we'd use a robust PDF processing library
  throw new Error('Native strategy not implemented yet');
}

// Enhanced PDF.js strategy with better dependency management
async function convertWithPdfJs(pdfBuffer: ArrayBuffer): Promise<ConversionResult> {
  try {
    // Use a more stable PDF.js version from jsDelivr
    const pdfjsLib = await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/+esm');
    
    console.log('Loading PDF with PDF.js (jsDelivr)...');
    
    // Configure PDF.js
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
    
    // Load PDF document with better error handling
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(pdfBuffer),
      verbosity: 0,
      disableAutoFetch: false,
      disableStream: false,
    });
    
    // Add timeout handling
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('PDF loading timeout')), 30000);
    });
    
    const pdf = await Promise.race([loadingTask.promise, timeoutPromise]);
    const totalPages = pdf.numPages;
    
    console.log(`PDF loaded successfully. Total pages: ${totalPages}`);
    
    if (totalPages > 50) {
      throw new Error(`PDF trop volumineux: ${totalPages} pages (maximum: 50)`);
    }
    
    const images: PageImage[] = [];
    
    // Process pages with better memory management
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      console.log(`Processing page ${pageNum}/${totalPages}...`);
      
      try {
        const page = await pdf.getPage(pageNum);
        
        // Calculate optimal scale for good quality without excessive memory usage
        const viewport = page.getViewport({ scale: 1.5 });
        
        // Limit image size to prevent memory issues
        const maxDimension = 2048;
        let scale = 1.5;
        if (Math.max(viewport.width, viewport.height) > maxDimension) {
          scale = maxDimension / Math.max(viewport.width, viewport.height);
        }
        
        const scaledViewport = page.getViewport({ scale });
        
        // Create canvas with size limits
        const canvas = new OffscreenCanvas(
          Math.min(scaledViewport.width, maxDimension),
          Math.min(scaledViewport.height, maxDimension)
        );
        const context = canvas.getContext('2d');
        
        if (!context) {
          throw new Error('Failed to get canvas context');
        }
        
        // Render with timeout
        const renderPromise = page.render({
          canvasContext: context,
          viewport: scaledViewport,
        }).promise;
        
        const renderTimeout = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Page render timeout')), 15000);
        });
        
        await Promise.race([renderPromise, renderTimeout]);
        
        // Convert to JPEG with quality optimization
        const blob = await canvas.convertToBlob({ 
          type: 'image/jpeg', 
          quality: 0.85 
        });
        
        if (blob.size > 5 * 1024 * 1024) { // 5MB limit per image
          throw new Error('Image trop volumineuse après conversion');
        }
        
        // Convert to base64 efficiently
        const arrayBuffer = await blob.arrayBuffer();
        const base64Image = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        
        images.push({
          pageNumber: pageNum,
          imageData: base64Image,
          width: scaledViewport.width,
          height: scaledViewport.height
        });
        
        console.log(`Page ${pageNum} converted (${(blob.size / 1024).toFixed(1)}KB)`);
        
        // Clean up page resources
        page.cleanup();
        
      } catch (pageError) {
        console.error(`Error processing page ${pageNum}:`, pageError);
        // Continue with other pages rather than failing completely
        if (images.length === 0 && pageNum === 1) {
          throw pageError; // If first page fails, something is seriously wrong
        }
      }
    }
    
    if (images.length === 0) {
      throw new Error('Aucune page n\'a pu être convertie');
    }
    
    return {
      success: true,
      totalPages: images.length,
      images
    };
    
  } catch (error) {
    console.error('PDF.js conversion error:', error);
    throw error;
  }
}

// Fallback strategy: Extract existing images from PDF
async function extractImagesFromPdf(pdfBuffer: ArrayBuffer): Promise<ConversionResult> {
  const bytes = new Uint8Array(pdfBuffer);
  const images: PageImage[] = [];
  
  // Simple image extraction - look for JPEG headers in PDF stream
  let pageNum = 1;
  for (let i = 0; i < bytes.length - 10; i++) {
    if (bytes[i] === 0xFF && bytes[i + 1] === 0xD8) { // JPEG header
      // Find JPEG end
      for (let j = i + 2; j < bytes.length - 1; j++) {
        if (bytes[j] === 0xFF && bytes[j + 1] === 0xD9) { // JPEG end
          const jpegData = bytes.slice(i, j + 2);
          const base64Image = btoa(String.fromCharCode(...jpegData));
          
          images.push({
            pageNumber: pageNum++,
            imageData: base64Image,
            width: 800, // Estimated
            height: 1000 // Estimated
          });
          
          i = j + 2;
          break;
        }
      }
    }
  }
  
  if (images.length === 0) {
    throw new Error('Aucune image trouvée dans le PDF');
  }
  
  return {
    success: true,
    totalPages: images.length,
    images
  };
}

serve(async (req) => {
  console.log('Enhanced PDF to images function called');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      throw new Error('Aucun fichier fourni');
    }

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      throw new Error('Le fichier n\'est pas un PDF valide');
    }

    // Enhanced file size limits
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      throw new Error('PDF trop volumineux. Limite: 50MB');
    }

    if (file.size < 100) {
      throw new Error('Fichier PDF trop petit ou corrompu');
    }

    console.log(`Processing PDF: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

    const pdfBuffer = await file.arrayBuffer();
    const result = await convertPdfToImages(pdfBuffer);

    if (!result.success) {
      console.error('Conversion failed:', result.error);
      return new Response(JSON.stringify(result), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`PDF conversion completed successfully: ${result.images.length} pages`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in enhanced pdf-to-images function:', error);
    
    const errorResult: ConversionResult = {
      success: false,
      totalPages: 0,
      images: [],
      error: error.message || 'Erreur interne du service de conversion'
    };

    return new Response(JSON.stringify(errorResult), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});