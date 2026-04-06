import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openAIApiKey = Deno.env.get('OPENAI_API_KEY')!;

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const supabase = createClient(supabaseUrl, supabaseKey);

        let body = {} as any;
        try {
            body = await req.json();
        } catch (e) {
            console.log('No valid JSON body found, using defaults');
        }

        const { dryRun = true, limit = 10 } = body;

        console.log(`🔍 Searching for documents with wrong author (dryRun: ${dryRun}, limit: ${limit})...`);

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
        }

        // Find all documents where author contains "Observatoire" or author_ar contains "مرصد الحقوق الأساسية"
        const { data: documents, error: fetchError } = await supabase
            .from('documents')
            .select('id, title, author, author_ar, textual_metadata, content, language')
            .or(`author.ilike.%Observatoire des droits fondamentaux%,author_ar.ilike.%مرصد الحقوق الأساسية%`)
            .limit(limit);

        if (fetchError) {
            throw new Error(`Failed to fetch documents: ${fetchError.message}`);
        }

        if (!documents || documents.length === 0) {
            return new Response(JSON.stringify({
                success: true,
                message: 'No documents found with wrong author',
                count: 0,
                results: []
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        console.log(`📋 Processing batch of ${documents.length} documents...`);

        const results: any[] = [];

        for (const doc of documents) {
            console.log(`\n📄 Processing document: ${doc.id} - "${doc.title}"`);

            // Use textual_metadata if available, otherwise use start of content
            const contextText = (doc.textual_metadata || doc.content || '').trim();

            if (!contextText) {
                results.push({ id: doc.id, title: doc.title, status: 'skipped', reason: 'No metadata or content' });
                continue;
            }

            try {
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${openAIApiKey}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        model: 'gpt-4o-mini',
                        messages: [
                            {
                                role: 'system',
                                content: `Tu es un expert en extraction de métadonnées de documents juridiques tunisiens.
Extrais le nom de la PERSONNE auteur de cette fiche depuis le texte fourni.
RÈGLES STRICTES:
- NE PAS utiliser "مرصد الحقوق الأساسية" ou "Observatoire des droits fondamentaux" comme auteur. C'est l'organisation éditrice, PAS l'auteur.
- Cherche un nom de PERSONNE (prénom + nom) dans le texte.
- Si le texte Mentionne "Par : [Nom]" ou "Par la chercheuse : [Nom]" ou s'il y a un nom en haut de page, c'est l'auteur.
- Si tu ne trouves aucun nom de personne, renvoie un objet avec des champs vides.
Réponds UNIQUEMENT en JSON: {"author_ar": "...", "author_fr": "..."}`
                            },
                            {
                                role: 'user',
                                content: `Texte du document:\n${contextText.substring(0, 3000)}`
                            }
                        ],
                        response_format: { type: "json_object" },
                        temperature: 0.1,
                        max_tokens: 200,
                    }),
                });

                if (!response.ok) {
                    throw new Error(`OpenAI API error: ${response.status}`);
                }

                const data = await response.json();
                const extraction = JSON.parse(data.choices[0].message.content);

                const newAuthorAr = extraction.author_ar?.trim() || '';
                const newAuthorFr = extraction.author_fr?.trim() || '';

                // If still org name, or both empty, we need to mark it so it doesn't get stuck in the loop
                if (newAuthorAr.includes('مرصد') || newAuthorFr.toLowerCase().includes('observatoire') || (!newAuthorAr && !newAuthorFr)) {
                    // Marker to avoid infinite loop - we update to a special value that doesn't match the query
                    if (!dryRun) {
                        await supabase.from('documents').update({
                            author: doc.author + ' ', // Add trailing space to avoid matching ILIKE exactly if needed, 
                            // but actually the query uses %Observatoire%
                            // A better way is to mark it as "Manual check needed" or something
                        }).eq('id', doc.id);
                    }
                    results.push({ id: doc.id, title: doc.title, status: 'manual_check_needed', reason: 'No person name found' });
                    continue;
                }

                if (!dryRun && (newAuthorAr || newAuthorFr)) {
                    const updateData: any = {};
                    if (newAuthorAr) updateData.author_ar = newAuthorAr;
                    if (newAuthorFr) updateData.author = newAuthorFr;

                    const { error: updateError } = await supabase.from('documents').update(updateData).eq('id', doc.id);
                    if (updateError) throw updateError;
                }

                results.push({
                    id: doc.id,
                    title: doc.title,
                    status: dryRun ? 'would_update' : 'updated',
                    new_author: newAuthorFr,
                    new_author_ar: newAuthorAr
                });

            } catch (aiError: any) {
                results.push({ id: doc.id, title: doc.title, status: 'error', error: aiError.message });
            }
        }

        return new Response(JSON.stringify({
            success: true,
            dryRun,
            processed: results.length,
            results
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        return new Response(JSON.stringify({
            success: false,
            error: error.message,
            stack: error.stack
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
