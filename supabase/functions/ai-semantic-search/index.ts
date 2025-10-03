import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { 
      query, 
      filters = {},
      limit = 20 
    } = await req.json();

    // Normalize the query to avoid issues with trailing spaces, multiple spaces, etc.
    const normalizedQuery = query.trim().replace(/\s+/g, ' ').toLowerCase();

    console.log('AI semantic search - Original query:', query);
    console.log('AI semantic search - Normalized query:', normalizedQuery);
    console.log('Filters:', filters);

    // Generate embedding for the search query
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: normalizedQuery,
      }),
    });

    if (!embeddingResponse.ok) {
      const errorText = await embeddingResponse.text();
      console.error('OpenAI API error:', embeddingResponse.status, errorText);
      throw new Error(`OpenAI API error: ${embeddingResponse.status}`);
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0].embedding;

    console.log('Query embedding generated');

    // Try multiple thresholds for better recall with increasing match_count
    let matches: any[] = [];
    let usedThreshold = 0;
    const thresholds = [
      { threshold: 0.5, match_count: 20 },
      { threshold: 0.4, match_count: 30 },
      { threshold: 0.3, match_count: 40 }
    ];
    
    for (const { threshold, match_count } of thresholds) {
      console.log(`Trying threshold: ${threshold} with match_count: ${match_count}`);
      
      const { data, error: searchError } = await supabase.rpc('match_documents', {
        query_embedding: queryEmbedding,
        match_threshold: threshold,
        match_count: match_count,
      });

      if (searchError) {
        console.error('Search error:', searchError);
        throw new Error(`Search failed: ${searchError.message}`);
      }

      if (data && data.length > 0) {
        matches = data;
        usedThreshold = threshold;
        console.log(`Found ${data.length} documents with threshold ${threshold}`);
        console.log('Sample similarity scores:', data.slice(0, 5).map((d: any) => ({ id: d.id, similarity: d.similarity })));
        break;
      }
    }

    if (!matches || matches.length === 0) {
      console.log('No matches found with any threshold');
      return new Response(
        JSON.stringify({ results: [], total: 0, noResults: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${matches.length} matches before filtering (threshold: ${usedThreshold})`);

    // Fetch full document details
    const documentIds = matches.map((m: any) => m.id);
    
    let documentsQuery = supabase
      .from('documents')
      .select(`
        id,
        title,
        title_ar,
        case_number,
        court,
        court_ar,
        year,
        summary,
        summary_ar,
        keywords,
        keywords_ar,
        status,
        created_at,
        document_type,
        court_level,
        court_category,
        document_categories (
          category_id,
          categories (
            id,
            name,
            name_ar,
            color
          )
        )
      `)
      .in('id', documentIds)
      .eq('published', true);

    // Apply additional filters
    if (filters.courtType && filters.courtType !== 'all') {
      documentsQuery = documentsQuery.or(
        `court.ilike.%${filters.courtType}%,court_category.ilike.%${filters.courtType}%`
      );
    }

    if (filters.yearFrom) {
      documentsQuery = documentsQuery.gte('year', parseInt(filters.yearFrom));
    }

    if (filters.yearTo) {
      documentsQuery = documentsQuery.lte('year', parseInt(filters.yearTo));
    }

    if (filters.jurisdictionLevel && filters.jurisdictionLevel !== 'all') {
      documentsQuery = documentsQuery.ilike('court_level', `%${filters.jurisdictionLevel}%`);
    }

    if (filters.documentType && filters.documentType !== 'all') {
      documentsQuery = documentsQuery.eq('document_type_id', filters.documentType);
    }

    const { data: documents, error: docsError } = await documentsQuery;

    if (docsError) {
      throw new Error(`Failed to fetch documents: ${docsError.message}`);
    }

    // Merge similarity scores with documents
    const results = documents?.map((doc: any) => {
      const match = matches.find((m: any) => m.id === doc.id);
      const categories = doc.document_categories
        ?.map((dc: any) => dc.categories)
        .filter(Boolean) || [];
      
      return {
        ...doc,
        similarity: match?.similarity || 0,
        categories,
        primaryCategory: categories[0] || null,
      };
    }).sort((a: any, b: any) => b.similarity - a.similarity)
      .slice(0, limit) || [];

    console.log(`Returning ${results.length} results after filtering`);

    return new Response(
      JSON.stringify({ 
        results,
        total: results.length,
        noResults: results.length === 0,
        threshold: usedThreshold,
        aiPowered: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in AI semantic search:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        results: [],
        total: 0
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
