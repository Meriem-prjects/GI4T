import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { sanitizeArabicForDisplay } from "../_shared/utils.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// Function to sanitize filename for storage
function sanitizeFilename(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.');
  const name = lastDotIndex !== -1 ? filename.slice(0, lastDotIndex) : filename;
  const extension = lastDotIndex !== -1 ? filename.slice(lastDotIndex) : '';
  
  // Replace special characters with underscores and remove consecutive underscores
  // Also handle Unicode characters properly
  const sanitizedName = name
    .normalize('NFD') // Normalize Unicode
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-zA-Z0-9\-_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
    
  return sanitizedName + extension;
}

// Initialize Supabase client with service role key for admin access
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Helper function to detect password-protected PDFs
function checkIfPasswordProtected(pdfBytes: Uint8Array): boolean {
  try {
    const pdfString = new TextDecoder('latin1').decode(pdfBytes.slice(0, 1024));
    // Look for encryption indicators in PDF header
    return pdfString.includes('/Encrypt') || pdfString.includes('/Filter/Standard');
  } catch {
    return false;
  }
}

// Enhanced file content extraction with multiple fallback methods
async function extractFileContent(file: File, isPDF: boolean): Promise<{ success: boolean; content: string; contentLength: number; preview: string; error?: string }> {
  try {
    if (!isPDF) {
      // Handle non-PDF files (images, text files)
      if (file.type.startsWith('image/')) {
        return {
          success: true,
          content: 'Image en cours de traitement par OCR...',
          contentLength: 39,
          preview: 'Image en cours de traitement par OCR...'
        };
      } else if (file.type === 'text/plain') {
        const text = await file.text();
        return {
          success: true,
          content: text,
          contentLength: text.length,
          preview: text.substring(0, 200)
        };
      } else {
        return {
          success: true,
          content: 'Document en cours de traitement...',
          contentLength: 33,
          preview: 'Document en cours de traitement...'
        };
      }
    }

    // PDF processing with enhanced error handling
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    
    // Check if it's a valid PDF
    const header = new TextDecoder().decode(bytes.slice(0, 5));
    if (!header.startsWith('%PDF-')) {
      throw new Error('Fichier PDF invalide ou corrompu');
    }
    
    // Check for password protection
    const isProtected = checkIfPasswordProtected(bytes);
    if (isProtected) {
      console.log('PDF password-protected detected, will attempt OCR processing');
    }
    
    return {
      success: true,
      content: 'Document PDF en cours de traitement...',
      contentLength: 38,
      preview: 'Document PDF en cours de traitement...'
    };
    
  } catch (error) {
    console.error('File content extraction error:', error);
    return {
      success: false,
      content: '',
      contentLength: 0,
      preview: '',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

// Sanitize strings to avoid null bytes that Postgres rejects ("unsupported Unicode escape sequence")
function sanitizeString(input: string): string {
  try {
    return input.replace(/\u0000/g, '');
  } catch {
    return input;
  }
}

function deepSanitize(value: any): any {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') return sanitizeString(value);
  if (Array.isArray(value)) return value.map((v) => deepSanitize(v));
  if (typeof value === 'object') {
    const result: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) {
      result[k] = deepSanitize(v);
    }
    return result;
  }
  return value;
}

// Function to separate content based on Arabic keyword "المشكل" 
function separateContent(text: string): { textualMetadata: string; content: string } {
  // Enhanced keyword detection with more variations and better encoding handling
  const keywords = [
    'اﻟﻤﺸﻜﻞ',     // Original with long vowels
    'المشكل',      // Standard form
    'المشكلة',     // Feminine form
    'المسألة',     // Alternative word
    'الإشكال',     // Synonym
    'الإشكالية',   // Variant
    'المشكل الدستوري',  // Full constitutional problem phrase
    'اﻟﻤﺸﻜﻞ اﻟﺪّﺳﺘﻮري', // With diacritics
    'الإشكال الدستوري',   // Alternative full phrase
    'المسألة الدستورية',  // Constitutional matter
    'اﻟﻤﺸﻜﻠﺔ',     // With diacritics feminine
    'الموضوع',     // The subject/topic
    'القضية'       // The case/issue
  ];
  
  console.log(`Attempting content separation on text of ${text.length} characters`);
  
  // Try exact matches first
  for (const keyword of keywords) {
    const keywordIndex = text.indexOf(keyword);
    if (keywordIndex !== -1) {
      const textualMetadata = text.substring(0, keywordIndex).trim();
      const content = text.substring(keywordIndex).trim();
      
      console.log(`✓ Content separated at exact match "${keyword}" (index: ${keywordIndex})`);
      console.log(`  → Metadata: ${textualMetadata.length} chars`);
      console.log(`  → Content: ${content.length} chars`);
      console.log(`  → Metadata preview: "${textualMetadata.substring(0, 100)}..."`);
      console.log(`  → Content preview: "${content.substring(0, 100)}..."`);
      
      return {
        textualMetadata,
        content
      };
    }
  }
  
  // Try case-insensitive and normalized matches
  const normalizedText = text.replace(/[\u064B-\u065F\u0670\u0640]/g, ''); // Remove diacritics and tatweel
  
  for (const keyword of keywords) {
    const normalizedKeyword = keyword.replace(/[\u064B-\u065F\u0670\u0640]/g, '');
    const keywordIndex = normalizedText.toLowerCase().indexOf(normalizedKeyword.toLowerCase());
    if (keywordIndex !== -1) {
      // Find the actual position in the original text
      let actualIndex = 0;
      let normalizedIndex = 0;
      while (normalizedIndex < keywordIndex && actualIndex < text.length) {
        const char = text[actualIndex];
        if (!/[\u064B-\u065F\u0670\u0640]/.test(char)) {
          normalizedIndex++;
        }
        actualIndex++;
      }
      
      const textualMetadata = text.substring(0, actualIndex).trim();
      const content = text.substring(actualIndex).trim();
      
      console.log(`✓ Content separated at normalized match "${keyword}" → "${normalizedKeyword}"`);
      console.log(`  → Actual index: ${actualIndex}, normalized index: ${keywordIndex}`);
      console.log(`  → Metadata: ${textualMetadata.length} chars`);
      console.log(`  → Content: ${content.length} chars`);
      
      return {
        textualMetadata,
        content
      };
    }
  }
  
  // Final fallback: look for any line that starts with similar patterns
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.includes('مشكل') || line.includes('إشكال') || line.includes('مسألة') || line.includes('قضية')) {
      const beforeLines = lines.slice(0, i);
      const fromLines = lines.slice(i);
      
      const textualMetadata = beforeLines.join('\n').trim();
      const content = fromLines.join('\n').trim();
      
      console.log(`✓ Content separated at line ${i} containing pattern: "${line.substring(0, 50)}..."`);
      console.log(`  → Metadata: ${textualMetadata.length} chars`);
      console.log(`  → Content: ${content.length} chars`);
      
      return {
        textualMetadata,
        content
      };
    }
  }
  
  // If no keyword found, keep original text as content
  console.log('⚠ No separation keyword found in any form, keeping full text as content');
  console.log(`  → Available keywords: ${keywords.slice(0, 5).join(', ')}...`);
  console.log(`  → Text preview: "${text.substring(0, 200)}..."`);
  
  return {
    textualMetadata: '',
    content: text
  };
}

// Function to detect Arabic text quality issues (spaced letters)
function hasArabicSpacingIssues(text: string): boolean {
  if (!text) return false;
  
  // Count Arabic characters
  const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
  if (arabicChars < 50) return false; // Not enough Arabic text to analyze
  
  // Detect patterns typical of incorrect spacing
  // Pattern: Arabic letter + space + Arabic letter (repeated)
  const spacedLetters = (text.match(/[\u0600-\u06FF]\s[\u0600-\u06FF]\s[\u0600-\u06FF]/g) || []).length;
  
  // Calculate ratio of spaced patterns to total Arabic text
  const ratio = spacedLetters / (arabicChars / 3);
  console.log(`📊 Arabic spacing analysis: ${spacedLetters} spaced patterns, ${arabicChars} Arabic chars, ratio: ${ratio.toFixed(3)}`);
  
  // If more than 10% of text has spaced patterns, it's likely malformed
  return ratio > 0.1;
}

// Helper function to access EdgeRuntime safely
function getEdgeRuntime(): any {
  try {
    return (globalThis as any).EdgeRuntime;
  } catch {
    return null;
  }
}

serve(async (req) => {
  console.log('Upload document function called');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const categoryId = formData.get('categoryId') as string;
    const documentTypeId = formData.get('documentTypeId') as string;
    const language = formData.get('language') as string || 'fr';

    if (!file) {
      throw new Error('No file provided');
    }

    console.log(`Processing file: ${file.name}, size: ${file.size}`);

    // Enhanced file validation and content extraction
    const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const extractionResult = await extractFileContent(file, isPDF);
    
    if (!extractionResult.success && extractionResult.error) {
      throw new Error(extractionResult.error);
    }

    // Upload file to Supabase Storage
    const sanitizedName = sanitizeFilename(file.name);
    const fileName = `${Date.now()}-${sanitizedName}`;
    console.log(`Sanitized filename: ${sanitizedName} -> ${fileName}`);
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('documents')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    console.log('File uploaded successfully:', uploadData.path);

    // Get file content for parsing
    let fileContent = '';
    let extractionSuccess = false;
    let pageContents: any[] | null = null;
    let processedPages: number | null = null;
    let totalPagesVar: number | null = null;
    
          // Initialize analysis data at the beginning
    let analysisData = {
      title: file.name,
      title_ar: null,
      summary: 'Document uploadé sans analyse complète',
      summary_ar: null,
      keywords: [],
      keywords_ar: [],
      language: language, // Use the provided language
      document_type: null,
      main_topics: [],
      legal_references: [],
      entities: [],
      dates: [],
      jurisdiction: null,
      case_numbers: [],
      legal_domains: []
    };
    
    // Shared variables across processing flow
    let pdfaInfo: any = null;
    let jobData: any = null;
    let shouldUsePDFReader = false; // Track if direct text extraction was successful
    
    // Handle different file types with enhanced processing
    if (isPDF) {
      console.log('Processing PDF file with enhanced multi-level fallback system...');
      
      // Create processing job for progress tracking
      const { data: jobDataResult, error: jobError } = await supabaseAdmin
        .from('processing_jobs')
        .insert({
          file_name: file.name,
          file_size: file.size,
          status: 'pending',
          progress: 0,
          current_step: 'initializing'
        })
        .select()
        .single();
      
      if (jobError) {
        console.error('Failed to create processing job:', jobError);
      } else {
        jobData = jobDataResult;
      }
      
      const jobId = jobData?.id;
      
      // First, detect if this is a PDF/A document for optimized processing
      pdfaInfo = null;
      try {
        const pdfaFormData = new FormData();
        pdfaFormData.append('file', file);
        
        const { data: pdfaData, error: pdfaError } = await supabaseAdmin.functions.invoke('pdf-a-detector', {
          body: pdfaFormData
        });
        
        if (!pdfaError && pdfaData) {
          pdfaInfo = pdfaData;
          console.log('PDF/A detection result:', {
            isPDFA: pdfaInfo.isPDFA,
            version: pdfaInfo.pdfaVersion,
            useNative: pdfaInfo.recommendations?.useNativeConversion
          });
        }
      } catch (pdfaException) {
        console.warn('PDF/A detection failed, continuing with standard processing:', pdfaException);
      }
      
      try {
        // First attempt: Direct text extraction with pdf-reader
        console.log('Attempting direct PDF text extraction...');
        
        const { data: readerData, error: readerError } = await supabaseAdmin.functions.invoke('pdf-reader', {
          body: file
        });
        
        if (!readerError && readerData?.success) {
          // Use pdf-reader results - prefer HTML if available, otherwise use structured text
          const extractedHtml = (readerData.htmlTexts || []).join('\n').trim();
          const extractedText = (readerData.texts || []).join('\n\n').trim();
          const avgCharsPerPage = extractedText.length / (readerData.numPages || 1);
          
          console.log(`PDF text extraction result: ${readerData.numPages} pages, ${extractedText.length} chars text, ${extractedHtml.length} chars HTML, avg ${Math.round(avgCharsPerPage)} chars/page`);
          
          // Always use direct extraction - no more OCR fallback
          console.log('Using PDF direct extraction result with structure preservation');
          
          // Use RAW sanitization for 100% PDF fidelity - no transformations
          let sanitizedExtractedText = sanitizeArabicForDisplay(extractedText);
          
          // Store HTML content for CKEditor (preserves structure like headings and paragraphs)
          const htmlContent = extractedHtml || sanitizedExtractedText;
          
          fileContent = htmlContent.length > 0 ? htmlContent : 'Document PDF sans texte extractible';
          extractionSuccess = true;
          totalPagesVar = readerData.numPages || 1;
          shouldUsePDFReader = true;
           
          // Check Arabic text quality - force OCR if badly encoded
          if (language === 'ar' && sanitizedExtractedText.length > 0 && hasArabicSpacingIssues(sanitizedExtractedText)) {
            console.log('⚠️ Arabic text quality issues detected - forcing Google Vision OCR');
            shouldUsePDFReader = false;
            fileContent = 'Document PDF avec texte mal encodé - OCR requis';
            extractionSuccess = false;
          }
           
          // Create page contents from extracted text - use HTML if available
          pageContents = (readerData.texts || []).map((text: string, index: number) => {
            const pageHtml = readerData.htmlTexts?.[index] || '';
            const pageContent = pageHtml || sanitizeArabicForDisplay(text.trim());
            return {
              pageNumber: index + 1,
              content: pageContent,
              confidence: 1.0,
              language: language
            };
          });
          
          processedPages = readerData.numPages || 1;
          
          // Enhanced analysis data with extracted content
          analysisData.title = file.name.replace(/\.[^/.]+$/, "");
          analysisData.summary = extractedText.length > 0 
            ? `Document PDF traité: ${extractedText.substring(0, 200)}...`
            : 'Document PDF traité sans texte extractible';
          analysisData.language = language; // Use the provided language
          
          console.log('PDF direct extraction completed successfully with structure preservation');
        } else {
          // PDF reading failed completely - save file but mark as unprocessed
          console.log('PDF text extraction failed completely, saving file without content');
          
          fileContent = 'Document PDF non lisible - fichier sauvegardé sans extraction de texte';
          extractionSuccess = false; // Mark as failed extraction
          totalPagesVar = 1;
          pageContents = [{
            pageNumber: 1,
            content: 'Contenu non extractible',
            confidence: 0.0,
            language: language // Use the provided language
          }];
          processedPages = 1;
          
          analysisData.title = file.name.replace(/\.[^/.]+$/, "");
          analysisData.summary = 'Document PDF non lisible - extraction échouée';
          analysisData.language = language; // Use the provided language
        }

        // Enhance analysis data with PDF/A metadata if available
        if (pdfaInfo?.isPDFA) {
          // Use any casting to avoid type conflicts
          const anyAnalysisData = analysisData as any;
          anyAnalysisData.document_type = `PDF/A Document (${pdfaInfo.pdfaVersion || 'Unknown version'})`;
          
          // Add PDF/A metadata to analysis
          if (pdfaInfo.metadata?.title) {
            analysisData.title = pdfaInfo.metadata.title;
          }
          if (pdfaInfo.metadata?.keywords) {
            anyAnalysisData.keywords = pdfaInfo.metadata.keywords.split(',').map((k: string) => k.trim()).filter(Boolean);
          }
          if (pdfaInfo.metadata?.subject) {
            analysisData.summary = `Document d'archivage PDF/A: ${pdfaInfo.metadata.subject}`;
          }
          
          // Add archival information to legal domains
          anyAnalysisData.legal_domains = ['Document d\'archivage', 'PDF/A Standard'];
          if (pdfaInfo.conformanceLevel) {
            anyAnalysisData.legal_domains.push(`Conformité niveau ${pdfaInfo.conformanceLevel}`);
          }
        }
          
        // Page contents populated from pdf-reader extraction
        console.log(`PDF processing completed with ${processedPages || 0} pages`);
      } catch (pdfException) {
        console.error('PDF OCR processing exception:', pdfException);
        fileContent = `Exception PDF OCR: ${pdfException instanceof Error ? pdfException.message : String(pdfException)}`;
      }
      
    } else if (file.type?.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|bmp|tiff)$/i.test(file.name)) {
      // Handle image files with OCR
      console.log('Processing image file with OCR...');
      
      try {
        const imageFormData = new FormData();
        imageFormData.append('file', file);
        
        const { data: ocrData, error: ocrError } = await supabaseAdmin.functions.invoke('image-ocr', {
          body: imageFormData
        });

        console.log('Image OCR response:', ocrData);

        if (ocrError) {
          console.error('Image OCR error:', ocrError);
          fileContent = `Erreur OCR: ${ocrError.message}`;
        } else if (ocrData?.success && ocrData?.content && ocrData.content.length > 2) {
          // Sanitize Arabic content from image OCR
          fileContent = ocrData.language === 'ar' ? sanitizeArabicText(ocrData.content) : ocrData.content;
          extractionSuccess = true;
          analysisData.language = ocrData.language || 'fr';
          console.log(`Image OCR successful: ${fileContent.length} chars, language: ${analysisData.language}`);
        } else {
          console.warn('Image OCR returned insufficient content:', ocrData);
          fileContent = 'Image ne contient pas de texte lisible';
        }
      } catch (ocrException) {
        console.error('Image OCR exception:', ocrException);
        fileContent = `Exception OCR: ${ocrException instanceof Error ? ocrException.message : String(ocrException)}`;
      }
    } else {
      // For text files, read as text
      try {
        fileContent = await file.text();
        extractionSuccess = fileContent.length > 10;
      } catch (textError) {
        console.error('Text reading error:', textError);
        fileContent = 'Erreur lors de la lecture du fichier';
      }
    }
    
    console.log('File content extraction completed:', {
      success: extractionSuccess,
      contentLength: fileContent.length,
      preview: fileContent.substring(0, 100)
    });
    
    // Update analysis data based on extraction results
    if (extractionSuccess) {
      analysisData.title = file.name.replace(/\.[^/.]+$/, ""); // Remove file extension
      analysisData.summary = `Document traité avec succès: ${fileContent.substring(0, 100)}...`;
    }

    console.log('Document processing completed');

    // Get public URL for the uploaded file
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('documents')
      .getPublicUrl(uploadData.path);

    // Apply content separation for Arabic documents
    let textualMetadata = '';
    let finalContent = fileContent;
    
    if (fileContent && language === 'ar') {
      const separated = separateContent(fileContent);
      textualMetadata = separated.textualMetadata;
      finalContent = separated.content;
      
      console.log('Content separated:', {
        textualMetadataLength: textualMetadata.length,
        contentLength: finalContent.length,
        textualMetadataPreview: textualMetadata.substring(0, 100) + '...',
        contentPreview: finalContent.substring(0, 100) + '...'
      });
    }

    // Start AI analysis with exhaustive translation if extraction was successful
    let translatedContentVar = '';
    if (extractionSuccess && finalContent.length > 100) {
      console.log('🤖 Starting AI analysis with exhaustive translation...');
      
      try {
        const { data: aiAnalysis, error: aiError } = await supabaseAdmin.functions.invoke(
          'smart-document-analysis', 
          {
            body: {
              textualMetadata: textualMetadata || '',
              content: finalContent,
              currentLanguage: language
            }
          }
        );
        
        if (aiError) {
          console.error('AI analysis error:', aiError);
        } else if (aiAnalysis?.analysis) {
          const result = aiAnalysis.analysis;
          
          // Update analysis data with AI results
          analysisData = {
            ...analysisData,
            title: result.title || analysisData.title,
            title_ar: result.translatedTitle || analysisData.title_ar,
            summary: result.summary || analysisData.summary,
            summary_ar: result.translatedSummary || analysisData.summary_ar,
            keywords: result.existingKeywords || result.keywords || [],
            keywords_ar: result.translatedKeywords || [],
            main_topics: result.main_topics || [],
            legal_references: result.legal_references || [],
            entities: result.entities || [],
            dates: result.dates || [],
            jurisdiction: result.metadata?.court_level || null,
            case_numbers: result.metadata?.case_number ? [result.metadata.case_number] : []
          };
          
          // Store the complete translation
          if (result.translatedContent) {
            translatedContentVar = result.translatedContent;
            console.log('✅ Full translation received:', translatedContentVar.length, 'characters');
          }
          
          console.log('✅ AI analysis completed with full translation');
        }
      } catch (error) {
        console.error('AI analysis exception:', error);
      }
    }

    // Save document to database with enhanced metadata
    const documentData = {
      original_filename: file.name,
      file_url: publicUrl,
      title: analysisData.title || file.name,
      title_ar: analysisData.title_ar || null,
      summary: analysisData.summary || '',
      summary_ar: analysisData.summary_ar || null,
      content: finalContent, // Store separated main content
      translated_content: translatedContentVar || null, // Store exhaustive translation
      textual_metadata: textualMetadata || null, // Store separated textual metadata
      keywords: analysisData.keywords || [],
      keywords_ar: analysisData.keywords_ar || [],
      language: language, // Use the provided language
      file_size: file.size,
      page_count: totalPagesVar || 1,
      category_id: categoryId || null,
      document_type_id: documentTypeId || null,
      user_id: null, // Public upload - no user required
      status: 'draft', // Always start as draft, must go through validation workflow
      // Enhanced metadata fields
      document_type: analysisData.document_type,
      main_topics: analysisData.main_topics || [],
      legal_references: analysisData.legal_references || [],
      entities: analysisData.entities || [],
      dates: analysisData.dates || [],
      jurisdiction: analysisData.jurisdiction,
      case_numbers: analysisData.case_numbers || [],
      legal_domains: analysisData.legal_domains || [],
      // Page-specific content for enhanced display
      page_contents: pageContents || null,
      processed_pages: processedPages || null,
      total_pages: totalPagesVar || null,
      // PDF/A specific metadata
      pdfa_compliance: pdfaInfo?.isPDFA || false,
      pdfa_version: pdfaInfo?.pdfaVersion || null,
      pdfa_conformance_level: pdfaInfo?.conformanceLevel || null,
      archival_metadata: pdfaInfo?.metadata || null,
      archival_features: pdfaInfo?.archivalFeatures || null,
      // Processing job reference for tracking
      processing_job_id: jobData?.id || null
    };

    console.log('Saving document with enhanced metadata:', {
      title: documentData.title,
      language: documentData.language,
      keywords_count: documentData.keywords.length,
      content_length: documentData.content.length,
      summary_length: documentData.summary.length,
      document_type: documentData.document_type,
      main_topics_count: documentData.main_topics.length,
      legal_references_count: documentData.legal_references.length,
      entities_count: documentData.entities.length
    });

    const { data: document, error: dbError } = await supabaseAdmin
      .from('documents')
      .insert(deepSanitize(documentData))
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    console.log('Document saved to database:', document.id);

    // Only trigger OCR in background if direct text extraction wasn't sufficient
    if (isPDF && !shouldUsePDFReader) {
      try {
        const pdfFormData = new FormData();
        pdfFormData.append('file', file);
        if (jobData?.id) {
          pdfFormData.append('jobId', jobData.id);
          pdfFormData.append('filename', file.name);
        }
        pdfFormData.append('language', language);
        if (pdfaInfo?.recommendations) {
          pdfFormData.append('optimizedResolution', String(pdfaInfo.recommendations.optimizedResolution));
          pdfFormData.append('preserveMetadata', String(pdfaInfo.recommendations.preserveMetadata));
          pdfFormData.append('isArchival', String(pdfaInfo.archivalFeatures?.isArchival || false));
        }
        
        console.log('Triggering background OCR processing (direct extraction was insufficient)...');
        try {
          const edgeRuntime = getEdgeRuntime();
          if (edgeRuntime && edgeRuntime.waitUntil) {
            edgeRuntime.waitUntil(
            supabaseAdmin.functions.invoke('pdf-ocr-batch', { body: pdfFormData })
              .then(() => console.log('Background PDF OCR completed successfully'))
              .catch((error) => console.error('Background PDF OCR failed:', error))
            );
          } else {
            // Fallback if EdgeRuntime is not available
            supabaseAdmin.functions.invoke('pdf-ocr-batch', { body: pdfFormData })
              .then(() => console.log('Background PDF OCR completed successfully'))
              .catch((err) => console.error('Background PDF OCR failed:', err));
          }
        } catch {
          // Fallback if EdgeRuntime.waitUntil is not available
          supabaseAdmin.functions.invoke('pdf-ocr-batch', { body: pdfFormData })
            .catch((error) => console.error('Background PDF OCR failed:', error));
        }
      } catch (triggerErr) {
        console.error('Failed to trigger OCR after saving document:', triggerErr);
      }
    } else if (isPDF && shouldUsePDFReader) {
      console.log('Skipping OCR processing - direct text extraction was successful');
      
      // Update job status to completed since no further processing needed
      if (jobData?.id) {
        await supabaseAdmin
          .from('processing_jobs')
          .update({
            status: 'completed',
            progress: 100,
            current_step: 'direct_extraction_completed'
          })
          .eq('id', jobData.id);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      document,
      jobId: jobData?.id,
      message: 'Document uploaded successfully. Processing in background...'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in upload-document function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : String(error),
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});