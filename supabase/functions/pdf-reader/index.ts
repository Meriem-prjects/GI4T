// Import unpdf for serverless PDF text extraction
import { getDocumentProxy } from "https://esm.sh/unpdf@0.11.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TextItem {
  str: string;
  transform?: number[];
  height?: number;
  width?: number;
  dir?: string;
}

interface TextContent {
  items: TextItem[];
}

/**
 * Removes page numbers typically found at top or bottom of PDF pages
 * Detects isolated numbers at start or end of text
 */
function removePageNumbers(text: string, pageNumber: number): string {
  // Remove standalone page number at the very start (with optional whitespace)
  let cleaned = text.replace(new RegExp(`^\\s*${pageNumber}\\s*$`, 'm'), '');
  
  // Also remove if it's on the first line alone
  cleaned = cleaned.replace(new RegExp(`^\\s*${pageNumber}\\s*\\n`, ''), '');
  
  // Remove standalone page number at the very end
  cleaned = cleaned.replace(new RegExp(`\\n\\s*${pageNumber}\\s*$`), '');
  
  // Remove generic page number patterns like "- 1 -", "[ 1 ]", "page 1", "صفحة 1"
  cleaned = cleaned.replace(/^\s*[-–—]\s*\d+\s*[-–—]\s*$/gm, '');
  cleaned = cleaned.replace(/^\s*\[\s*\d+\s*\]\s*$/gm, '');
  cleaned = cleaned.replace(/^\s*page\s+\d+\s*$/gim, '');
  cleaned = cleaned.replace(/^\s*صفحة\s+\d+\s*$/gm, '');
  
  // Remove any standalone single or double digit number on its own line (common page number format)
  cleaned = cleaned.replace(/^\s*\d{1,3}\s*$/gm, '');
  
  // Clean up multiple empty lines that may result from removal
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  return cleaned.trim();
}

/**
 * Reconstructs text structure from PDF text content items
 * Analyzes X/Y positions, font sizes, and text direction to preserve original layout
 */
function reconstructTextStructure(textContent: TextContent): string {
  // Keep all items, including those with only spaces (important for spacing)
  const items = textContent.items.filter((item: TextItem) => item.str);
  
  if (items.length === 0) return '';
  
  // Calculate average height (font size) for detecting titles
  const heights = items.map((item: TextItem) => item.height || 10).filter(h => h > 0);
  const avgHeight = heights.length > 0 
    ? heights.reduce((sum: number, h: number) => sum + h, 0) / heights.length 
    : 10;
  
  // Calculate average character width for space detection
  const charWidths: number[] = [];
  for (const item of items) {
    if (item.width && item.str.length > 0) {
      charWidths.push(item.width / item.str.length);
    }
  }
  const avgCharWidth = charWidths.length > 0
    ? charWidths.reduce((sum, w) => sum + w, 0) / charWidths.length
    : 5;
  
  let result = '';
  let lastY: number | null = null;
  let lastX: number | null = null;
  let lastWidth: number = 0;
  let lastDir: string | null = null;
  let currentLine = '';
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const currentX = item.transform ? item.transform[4] : 0;
    const currentY = item.transform ? item.transform[5] : 0;
    const currentHeight = item.height || 10;
    const currentWidth = item.width || 0;
    const text = item.str;
    const isRTL = item.dir === 'rtl';
    
    if (lastY !== null) {
      const deltaY = Math.abs(lastY - currentY);
      
      // Large gap = new paragraph (> 1.8x average font height)
      if (deltaY > avgHeight * 1.8) {
        if (currentLine.trim()) {
          result += currentLine.trim() + '\n\n';
          currentLine = '';
        }
        lastX = null;
        lastWidth = 0;
      }
      // Small gap = new line (> 0.4x average font height)
      else if (deltaY > avgHeight * 0.4) {
        if (currentLine.trim()) {
          result += currentLine.trim() + '\n';
          currentLine = '';
        }
        lastX = null;
        lastWidth = 0;
      }
      // Same line - check horizontal spacing
      else if (lastX !== null) {
        // Calculate gap between end of last item and start of current
        let gap: number;
        if (isRTL || lastDir === 'rtl') {
          // For RTL, items are ordered right-to-left
          gap = lastX - (currentX + currentWidth);
        } else {
          // For LTR, items are ordered left-to-right
          gap = currentX - (lastX + lastWidth);
        }
        
        // Only add space if there's a significant gap (> 0.3x avg char width)
        // This preserves original spacing without adding unwanted spaces
        if (gap > avgCharWidth * 0.3) {
          currentLine += ' ';
        }
        // No space added if gap is small - text fragments are concatenated directly
      }
    }
    
    // Detect potential heading (font size > 1.35x average and short text)
    const isHeading = currentHeight > avgHeight * 1.35 && text.trim().length < 100 && text.trim().length > 2;
    
    if (isHeading && currentLine.trim() === '') {
      currentLine = `## ${text}`;
    } else if (isHeading && currentLine.startsWith('## ')) {
      currentLine += text; // No automatic space for headings either
    } else {
      currentLine += text; // Direct concatenation - no automatic space
    }
    
    lastX = currentX;
    lastY = currentY;
    lastWidth = currentWidth;
    lastDir = item.dir || null;
  }
  
  // Flush remaining content
  if (currentLine.trim()) {
    result += currentLine.trim();
  }
  
  return result.trim();
}

/**
 * Common Arabic section titles that should be formatted as headings
 * These are standalone words/phrases that don't end with colon
 */
const arabicSectionTitles = [
  'المقدمة',
  'الخاتمة',
  'التعليق',
  'الملخص',
  'المراجع',
  'الفهرس',
  'التمهيد',
  'خلاصة',
  'الخلاصة',
  'تمهيد',
  'مقدمة',
  'خاتمة',
  'توصيات',
  'التوصيات',
  'نتائج',
  'النتائج'
];

/**
 * Common French section titles that should be formatted as headings
 */
const frenchSectionTitles = [
  'Introduction',
  'Conclusion',
  'Commentaire',
  'Résumé',
  'Références',
  'Sommaire',
  'Préambule',
  'Recommandations',
  'Résultats'
];

/**
 * Detects and bolds Arabic/French labels that end with colon
 * Common patterns in legal documents
 */
function detectAndBoldLabels(text: string): string {
  // Common Arabic legal labels to bold
  const arabicLabels = [
    'المشكل القانوني',
    'الحلّ المقدّم',
    'الحل المقدّم',
    'الكلمات المفاتيح',
    'المحكمة',
    'القرار',
    'التاريخ',
    'الأطراف',
    'المدعي',
    'المدعى عليه',
    'الوقائع',
    'الحيثيات',
    'المنطوق',
    'رقم القضية',
    'تاريخ القرار',
    'النص القانوني',
    'المرجع',
    'الملخص',
    'التعليق',
    'الفصل',
    'المادة',
    'البند'
  ];
  
  // Common French legal labels to bold
  const frenchLabels = [
    'Problème juridique',
    'Solution proposée',
    'Mots-clés',
    'Mots clés',
    'Tribunal',
    'Décision',
    'Date',
    'Parties',
    'Demandeur',
    'Défendeur',
    'Faits',
    'Motifs',
    'Dispositif',
    'Numéro d\'affaire',
    'Date de décision',
    'Texte juridique',
    'Référence',
    'Résumé',
    'Commentaire',
    'Article',
    'Chapitre',
    'Section'
  ];
  
  let result = text;
  
  // Detect standalone section titles (Arabic) - convert to ## heading markers
  for (const title of arabicSectionTitles) {
    // Match standalone title on its own line (with optional whitespace)
    const regex = new RegExp(`^(\\s*)(${title})(\\s*)$`, 'gm');
    result = result.replace(regex, '$1## $2$3');
  }
  
  // Detect standalone section titles (French) - convert to ## heading markers
  for (const title of frenchSectionTitles) {
    const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`^(\\s*)(${escapedTitle})(\\s*)$`, 'gim');
    result = result.replace(regex, '$1## $2$3');
  }
  
  // Bold Arabic labels with colon
  for (const label of arabicLabels) {
    // Match label followed by colon (with optional space before colon)
    const regex = new RegExp(`(${label}\\s*:)`, 'g');
    result = result.replace(regex, '<strong>$1</strong>');
  }
  
  // Bold French labels with colon (case insensitive)
  for (const label of frenchLabels) {
    const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedLabel}\\s*:)`, 'gi');
    result = result.replace(regex, '<strong>$1</strong>');
  }
  
  // Also detect short lines (< 60 chars) ending with colon as potential subtitles
  // This catches labels not in our predefined list
  result = result.replace(/^(.{3,60})\s*:\s*$/gm, (match, content) => {
    // Skip if already contains <strong> or ## heading marker
    if (content.includes('<strong>') || content.includes('##')) return match;
    return `<strong>${content.trim()} :</strong>`;
  });
  
  return result;
}

/**
 * Converts structured text (with ## markers and \n) to HTML for CKEditor
 */
function convertStructuredTextToHTML(text: string): string {
  if (!text) return '';
  
  let html = text;
  
  // Apply label detection and bolding first
  html = detectAndBoldLabels(html);
  
  // Convert heading markers to HTML
  // ## Heading -> <h2>Heading</h2>
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  // # Heading -> <h1>Heading</h1>
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  
  // Split by paragraph breaks (double newlines)
  const blocks = html.split(/\n\n+/);
  
  html = blocks
    .map(block => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      
      // Don't wrap headings in <p>
      if (trimmed.startsWith('<h1>') || trimmed.startsWith('<h2>')) {
        return trimmed;
      }
      
      // Wrap regular text in paragraphs, convert single newlines to <br/>
      const withBreaks = trimmed.replace(/\n/g, '<br/>');
      return `<p>${withBreaks}</p>`;
    })
    .filter(block => block)
    .join('\n');
  
  return html;
}

Deno.serve(async (req) => {
  console.log('PDF reader function called');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Récupérer le PDF envoyé
    const arrayBuffer = await req.arrayBuffer();
    
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      throw new Error('No PDF data provided');
    }

    console.log(`Processing PDF: ${arrayBuffer.byteLength} bytes`);

    // Check file size limit (50MB for PDF processing)
    if (arrayBuffer.byteLength > 50 * 1024 * 1024) {
      throw new Error('PDF trop volumineux. Limite : 50MB');
    }

    const typedArray = new Uint8Array(arrayBuffer);

    // Enhanced PDF validation - check for PDF header with multiple valid formats
    const pdfHeader = new TextDecoder('latin1').decode(typedArray.slice(0, 10));
    const validHeaders = ['%PDF-1.', '%PDF-2.', '%PDF', 'PDF-'];
    const isValidPDF = validHeaders.some(header => pdfHeader.includes(header));
    
    if (!isValidPDF) {
      console.warn(`Invalid PDF header detected: ${pdfHeader}`);
      // Still try to process - some PDFs have non-standard headers
    }

    // Load PDF document using unpdf with robust error handling
    console.log('Loading PDF document with unpdf...');
    let pdf;
    try {
      pdf = await getDocumentProxy(typedArray);
      console.log(`PDF loaded successfully. Total pages: ${pdf.numPages}`);
    } catch (loadError) {
      console.error('Failed to load PDF with unpdf:', loadError);
      throw new Error(`Impossible de charger le PDF: ${loadError instanceof Error ? loadError.message : String(loadError)}`);
    }

    // Extract text from all pages using getTextContent() for position analysis
    const texts: string[] = [];
    const htmlTexts: string[] = [];
    const totalPages = pdf.numPages || 0;

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Reconstruct structured text with layout analysis
        let structuredText = reconstructTextStructure(textContent as TextContent);
        
        // Remove page numbers from extracted text
        structuredText = removePageNumbers(structuredText, pageNum);
        
        texts.push(structuredText);
        
        // Convert to HTML for CKEditor
        const htmlContent = convertStructuredTextToHTML(structuredText);
        htmlTexts.push(htmlContent);
        
        console.log(`Page ${pageNum}: ${structuredText.length} chars extracted, ${htmlContent.length} chars HTML`);
      } catch (pageError) {
        console.error(`Error extracting page ${pageNum}:`, pageError);
        texts.push('');
        htmlTexts.push('');
      }
    }

    const totalCharacters = texts.reduce((sum: number, page: string) => sum + (page || '').length, 0);
    
    console.log(`PDF text extraction completed: ${totalPages} pages, ${totalCharacters} total characters`);

    const result = {
      success: true,
      numPages: totalPages,
      texts,           // Structured text with ## markers and \n
      htmlTexts,       // HTML formatted for CKEditor
      totalCharacters
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error('Error in pdf-reader function:', error);
    
    const errorResult = {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      numPages: 0,
      texts: [],
      htmlTexts: []
    };

    return new Response(JSON.stringify(errorResult), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
