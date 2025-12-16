import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

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
  
  console.log(`Re-processing: Attempting content separation on text of ${text.length} characters`);
  
  // Try exact matches first
  for (const keyword of keywords) {
    const keywordIndex = text.indexOf(keyword);
    if (keywordIndex !== -1) {
      const textualMetadata = text.substring(0, keywordIndex).trim();
      const content = text.substring(keywordIndex).trim();
      
      console.log(`✓ Re-processing: Content separated at exact match \\"${keyword}\\" (index: ${keywordIndex})`);
      console.log(`  → Metadata: ${textualMetadata.length} chars`);
      console.log(`  → Content: ${content.length} chars`);
      
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
      
      console.log(`✓ Re-processing: Content separated at normalized match \\"${keyword}\\"`);
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
      
      console.log(`✓ Re-processing: Content separated at line ${i} containing pattern`);
      console.log(`  → Metadata: ${textualMetadata.length} chars`);
      console.log(`  → Content: ${content.length} chars`);
      
      return {
        textualMetadata,
        content
      };
    }
  }
  
  // If no keyword found, keep original text as content
  console.log('⚠ Re-processing: No separation keyword found, keeping full text as content');
  return {
    textualMetadata: '',
    content: text
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Re-process document function called');
    
    const { documentId } = await req.json();
    
    if (!documentId) {
      throw new Error('Document ID is required');
    }
    
    console.log(`Re-processing document: ${documentId}`);
    
    // Get the document from database
    const { data: document, error: fetchError } = await supabaseAdmin
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();
    
    if (fetchError) {
      throw new Error(`Failed to fetch document: ${fetchError.message}`);
    }
    
    if (!document) {
      throw new Error('Document not found');
    }
    
    console.log(`Document found: ${document.title}`);
    console.log(`Current content length: ${document.content?.length || 0} chars`);
    console.log(`Current textual_metadata length: ${document.textual_metadata?.length || 0} chars`);
    
    // If document doesn't have content, we can't re-process it
    if (!document.content) {
      throw new Error('Document has no content to re-process');
    }
    
    // Combine existing textual_metadata and content for re-processing
    const fullText = document.textual_metadata 
      ? `${document.textual_metadata}\n${document.content}`
      : document.content;
    
    console.log(`Re-processing full text of ${fullText.length} characters`);
    
    // Apply the enhanced separation logic
    const separated = separateContent(fullText);
    
    console.log(`Separation result:`);
    console.log(`  → New metadata: ${separated.textualMetadata.length} chars`);
    console.log(`  → New content: ${separated.content.length} chars`);
    
    // Update the document in database
    const { error: updateError } = await supabaseAdmin
      .from('documents')
      .update({
        textual_metadata: separated.textualMetadata,
        content: separated.content,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId);
    
    if (updateError) {
      throw new Error(`Failed to update document: ${updateError.message}`);
    }
    
    console.log(`✓ Document ${documentId} successfully re-processed`);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Document re-processed successfully',
        documentId,
        textualMetadataLength: separated.textualMetadata.length,
        contentLength: separated.content.length,
        separated: separated.textualMetadata.length > 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
    
  } catch (error) {
    console.error('Re-process document error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
