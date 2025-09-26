import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PDFADetectionResult {
  isPDFA: boolean;
  pdfaVersion?: string; // "PDF/A-1", "PDF/A-2", "PDF/A-3"
  conformanceLevel?: string; // "A", "B", "U"
  metadata: {
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    producer?: string;
    creationDate?: string;
    modificationDate?: string;
    keywords?: string;
  };
  archivalFeatures: {
    isArchival: boolean;
    hasEmbeddedFonts: boolean;
    hasColorProfile: boolean;
    compressionType?: string;
  };
  recommendations: {
    useNativeConversion: boolean;
    optimizedResolution: number;
    preserveMetadata: boolean;
  };
}

// Function to detect PDF/A format and extract archival metadata
async function detectPDFAFormat(pdfBuffer: ArrayBuffer): Promise<PDFADetectionResult> {
  try {
    // Convert ArrayBuffer to Uint8Array for analysis
    const uint8Array = new Uint8Array(pdfBuffer);
    const pdfContent = new TextDecoder('latin1').decode(uint8Array);
    
    console.log('Analyzing PDF for PDF/A compliance...');
    
    // Check for PDF/A identifiers in the document
    const pdfaMatches = pdfContent.match(/PDF\/A-([123])([ABU]?)/g) || [];
    const isPDFA = pdfaMatches.length > 0;
    
    let pdfaVersion = '';
    let conformanceLevel = '';
    
    if (isPDFA && pdfaMatches[0]) {
      const match = pdfaMatches[0].match(/PDF\/A-([123])([ABU]?)/);
      if (match) {
        pdfaVersion = `PDF/A-${match[1]}`;
        conformanceLevel = match[2] || 'B'; // Default to B if not specified
      }
    }
    
    // Extract metadata from PDF
    const metadata: any = {};
    
    // Look for standard PDF metadata
    const titleMatch = pdfContent.match(/\/Title\s*\(([^)]+)\)/);
    if (titleMatch) metadata.title = titleMatch[1];
    
    const authorMatch = pdfContent.match(/\/Author\s*\(([^)]+)\)/);
    if (authorMatch) metadata.author = authorMatch[1];
    
    const subjectMatch = pdfContent.match(/\/Subject\s*\(([^)]+)\)/);
    if (subjectMatch) metadata.subject = subjectMatch[1];
    
    const creatorMatch = pdfContent.match(/\/Creator\s*\(([^)]+)\)/);
    if (creatorMatch) metadata.creator = creatorMatch[1];
    
    const producerMatch = pdfContent.match(/\/Producer\s*\(([^)]+)\)/);
    if (producerMatch) metadata.producer = producerMatch[1];
    
    const keywordsMatch = pdfContent.match(/\/Keywords\s*\(([^)]+)\)/);
    if (keywordsMatch) metadata.keywords = keywordsMatch[1];
    
    // Check for creation and modification dates
    const creationDateMatch = pdfContent.match(/\/CreationDate\s*\(D:(\d{14})/);
    if (creationDateMatch) {
      const dateStr = creationDateMatch[1];
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      const day = dateStr.substring(6, 8);
      metadata.creationDate = `${year}-${month}-${day}`;
    }
    
    const modDateMatch = pdfContent.match(/\/ModDate\s*\(D:(\d{14})/);
    if (modDateMatch) {
      const dateStr = modDateMatch[1];
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      const day = dateStr.substring(6, 8);
      metadata.modificationDate = `${year}-${month}-${day}`;
    }
    
    // Analyze archival features
    const hasEmbeddedFonts = pdfContent.includes('/FontDescriptor') && pdfContent.includes('/FontFile');
    const hasColorProfile = pdfContent.includes('/ColorSpace') || pdfContent.includes('/ICCBased');
    
    // Detect compression types
    let compressionType = 'unknown';
    if (pdfContent.includes('/FlateDecode')) compressionType = 'Flate';
    else if (pdfContent.includes('/DCTDecode')) compressionType = 'JPEG';
    else if (pdfContent.includes('/JBIG2Decode')) compressionType = 'JBIG2';
    else if (pdfContent.includes('/JPXDecode')) compressionType = 'JPEG2000';
    else if (pdfContent.includes('/LZWDecode')) compressionType = 'LZW';
    
    const archivalFeatures = {
      isArchival: isPDFA,
      hasEmbeddedFonts,
      hasColorProfile,
      compressionType
    };
    
    // Generate recommendations based on analysis
    const recommendations = {
      useNativeConversion: isPDFA && (compressionType === 'Flate' || compressionType === 'JPEG'),
      optimizedResolution: isPDFA ? 300 : 200, // Higher resolution for archival documents
      preserveMetadata: isPDFA || Object.keys(metadata).length > 2
    };
    
    console.log(`PDF/A detection complete:`, {
      isPDFA,
      pdfaVersion,
      conformanceLevel,
      compressionType,
      hasMetadata: Object.keys(metadata).length > 0
    });
    
    return {
      isPDFA,
      pdfaVersion: pdfaVersion || undefined,
      conformanceLevel: conformanceLevel || undefined,
      metadata,
      archivalFeatures,
      recommendations
    };
    
  } catch (error) {
    console.error('Error detecting PDF/A format:', error);
    
    // Return safe defaults on error
    return {
      isPDFA: false,
      metadata: {},
      archivalFeatures: {
        isArchival: false,
        hasEmbeddedFonts: false,
        hasColorProfile: false
      },
      recommendations: {
        useNativeConversion: false,
        optimizedResolution: 200,
        preserveMetadata: false
      }
    };
  }
}

serve(async (req) => {
  console.log('PDF/A detector function called');

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

    console.log(`Analyzing PDF/A compliance: ${file.name} (${file.size} bytes)`);

    const pdfBuffer = await file.arrayBuffer();
    const result = await detectPDFAFormat(pdfBuffer);

    console.log(`PDF/A analysis completed for ${file.name}:`, {
      isPDFA: result.isPDFA,
      version: result.pdfaVersion,
      hasMetadata: Object.keys(result.metadata).length > 0
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in PDF/A detector function:', error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({
      isPDFA: false,
      metadata: {},
      archivalFeatures: {
        isArchival: false,
        hasEmbeddedFonts: false,
        hasColorProfile: false
      },
      recommendations: {
        useNativeConversion: false,
        optimizedResolution: 200,
        preserveMetadata: false
      },
      error: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});