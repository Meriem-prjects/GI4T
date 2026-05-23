import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Languages, FileText, Layers, Eye, Download, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Reuses the shape that AdminEditor passes into DocumentEditor — only
// the fields actually displayed here are required; everything else is
// passed through untouched.
interface DocumentData {
  id?: string;
  title?: string;
  title_ar?: string;
  subtitle?: string;
  subtitle_ar?: string;
  author?: string;
  author_ar?: string;
  summary?: string;
  summary_ar?: string;
  keywords?: string[];
  keywords_ar?: string[];
  content?: string;
  translated_content?: string;
  language?: 'fr' | 'ar';
  pdf_url?: string;
  file_url?: string;
  document_type?: { name?: string };
  documentType?: { name?: string };
}

interface DocumentAIViewProps {
  documentData: DocumentData;
}

interface Block {
  id: string;
  heading: string;
  level: 1 | 2;
  bodyHtml: string;
  fullHtml: string;
}

// Split the document body HTML into blocks at each <h1>/<h2> boundary.
// Each block carries the heading (as plain text) + the body HTML that
// follows until the next heading.
function splitHtmlIntoBlocks(html: string | undefined): Block[] {
  if (!html) return [];
  // Insert a sentinel before every <h1>/<h2> tag so a single split
  // produces one segment per section.
  const sentinel = '<<<<BLOCK>>>>';
  const marked = html.replace(/(<h[12][^>]*>)/gi, sentinel + '$1');
  const segments = marked.split(sentinel).filter((s) => s.trim());
  return segments.map((seg, i) => {
    const m = seg.match(/<h([12])[^>]*>([\s\S]*?)<\/h\1>/i);
    const heading = m ? m[2].replace(/<[^>]+>/g, '').trim() : '';
    const level = (m ? Number(m[1]) : 1) as 1 | 2;
    const bodyHtml = m
      ? seg.replace(/<h[12][^>]*>[\s\S]*?<\/h[12]>\s*/i, '').trim()
      : seg.trim();
    return {
      id: `block-${i}`,
      heading: heading || (i === 0 ? 'Préambule' : `Bloc ${i + 1}`),
      level,
      bodyHtml,
      fullHtml: seg.trim(),
    };
  });
}

const DocumentAIView: React.FC<DocumentAIViewProps> = ({ documentData }) => {
  const { toast } = useToast();
  const sourceLang = (documentData.language ?? 'ar') as 'fr' | 'ar';
  const otherLang: 'fr' | 'ar' = sourceLang === 'fr' ? 'ar' : 'fr';
  const [displayLang, setDisplayLang] = useState<'fr' | 'ar'>(sourceLang);
  const [activeTab, setActiveTab] = useState<'text' | 'visual' | 'articles'>('text');
  const [blockTranslations, setBlockTranslations] = useState<Record<string, string>>({});
  const [translatingId, setTranslatingId] = useState<string | null>(null);
  const [isReExtracting, setIsReExtracting] = useState(false);
  const pollTimerRef = useRef<number | null>(null);

  const content = useMemo(() => {
    if (displayLang === sourceLang) return documentData.content ?? '';
    return documentData.translated_content ?? '';
  }, [displayLang, sourceLang, documentData.content, documentData.translated_content]);

  const blocks = useMemo(() => splitHtmlIntoBlocks(content), [content]);
  const pdfUrl = documentData.pdf_url ?? documentData.file_url ?? '';

  const meta = useMemo(() => {
    const isAr = displayLang === 'ar';
    return {
      title: isAr ? documentData.title_ar : documentData.title,
      subtitle: isAr ? documentData.subtitle_ar : documentData.subtitle,
      author: isAr ? documentData.author_ar : documentData.author,
      summary: isAr ? documentData.summary_ar : documentData.summary,
      keywords: (isAr ? documentData.keywords_ar : documentData.keywords) ?? [],
    };
  }, [displayLang, documentData]);

  // Cleanup polling timer if the component unmounts mid-re-extraction.
  useEffect(() => {
    return () => {
      if (pollTimerRef.current !== null) {
        window.clearInterval(pollTimerRef.current);
      }
    };
  }, []);

  const handleReExtract = async () => {
    if (!documentData.id || isReExtracting) return;
    setIsReExtracting(true);
    try {
      const { data, error } = await supabase.functions.invoke('re-extract-document', {
        body: { documentId: documentData.id },
      });
      if (error) throw new Error(error.message ?? 'Erreur API');
      const success = (data as { success?: boolean } | null)?.success;
      if (!success) {
        const errMsg = (data as { error?: string } | null)?.error ?? 'Échec inconnu';
        throw new Error(errMsg);
      }
      toast({
        title: '🔄 Re-traitement lancé',
        description: 'OCR + filtres + structure (60-120 s). La page se rechargera dès que c\'est prêt.',
      });

      // Poll the document status every 3 s until it leaves "processing".
      const documentId = documentData.id;
      pollTimerRef.current = window.setInterval(async () => {
        const { data: row } = await supabase
          .from('documents')
          .select('status')
          .eq('id', documentId)
          .maybeSingle();
        const status = (row as { status?: string } | null)?.status;
        if (status && status !== 'processing') {
          if (pollTimerRef.current !== null) {
            window.clearInterval(pollTimerRef.current);
            pollTimerRef.current = null;
          }
          toast({
            title: '✅ Re-traitement terminé',
            description: 'Rechargement de la page…',
          });
          window.setTimeout(() => window.location.reload(), 600);
        }
      }, 3000);
    } catch (e) {
      setIsReExtracting(false);
      toast({
        title: '❌ Échec du re-traitement',
        description: (e as Error).message,
        variant: 'destructive',
      });
    }
  };

  const handleTranslateBlock = async (block: Block) => {
    if (translatingId) return;
    setTranslatingId(block.id);
    try {
      const { data, error } = await supabase.functions.invoke('translate-fields', {
        body: {
          fields: { [block.id]: block.fullHtml },
          sourceLang: displayLang,
          targetLang: displayLang === 'fr' ? 'ar' : 'fr',
        },
      });
      if (error) throw new Error(error.message ?? 'Erreur API');
      const tr = (data as { translations?: Record<string, string> })?.translations?.[block.id];
      if (!tr) throw new Error('Pas de traduction retournée');
      setBlockTranslations((prev) => ({ ...prev, [block.id]: tr }));
      toast({ title: '✅ Bloc traduit', description: block.heading });
    } catch (e) {
      toast({
        title: '❌ Échec de la traduction',
        description: (e as Error).message,
        variant: 'destructive',
      });
    } finally {
      setTranslatingId(null);
    }
  };

  const dir = displayLang === 'ar' ? 'rtl' : 'ltr';
  const oppositeDir = displayLang === 'ar' ? 'ltr' : 'rtl';

  return (
    <div className="space-y-3">
      {/* Top bar */}
      <Card className="p-3 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <FileText className="h-5 w-5 text-primary flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate" dir={dir}>
              {meta.title || documentData.title || 'Document'}
            </p>
            {meta.author && (
              <p className="text-xs text-muted-foreground truncate" dir={dir}>
                {meta.author}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-muted rounded-md p-0.5">
            <button
              className={`px-2.5 py-1 text-xs rounded ${displayLang === 'fr' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
              onClick={() => setDisplayLang('fr')}
            >
              FR
            </button>
            <button
              className={`px-2.5 py-1 text-xs rounded ${displayLang === 'ar' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
              onClick={() => setDisplayLang('ar')}
            >
              AR
            </button>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleReExtract}
            disabled={isReExtracting || !documentData.id}
            title="Relancer le pipeline complet sur le PDF stocké (OCR + filtres + structure Markdown)"
          >
            {isReExtracting ? (
              <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
            )}
            {isReExtracting ? 'Re-traitement…' : 'Re-traiter'}
          </Button>
          {pdfUrl && (
            <Button size="sm" variant="outline" asChild>
              <a href={pdfUrl} target="_blank" rel="noreferrer">
                <Download className="h-3.5 w-3.5 mr-1" />
                PDF
              </a>
            </Button>
          )}
        </div>
      </Card>

      {/* 3-panel layout: PDF left, tabs right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3" style={{ height: 'calc(100vh - 220px)' }}>
        {/* LEFT — PDF preview */}
        <Card className="overflow-hidden flex flex-col">
          <div className="bg-muted px-3 py-2 text-xs font-medium border-b flex items-center gap-2">
            <Eye className="h-3.5 w-3.5" />
            PDF source
          </div>
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              title="PDF source"
              className="flex-1 w-full border-0"
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              PDF non disponible
            </div>
          )}
        </Card>

        {/* RIGHT — tabs */}
        <Card className="overflow-hidden flex flex-col">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as typeof activeTab)}
            className="flex flex-col h-full"
          >
            <div className="border-b px-3 pt-2">
              <TabsList className="bg-transparent border-b-0 h-auto p-0 gap-1">
                <TabsTrigger value="text" className="data-[state=active]:bg-muted">
                  <FileText className="h-3.5 w-3.5 mr-1.5" />
                  Texte
                </TabsTrigger>
                <TabsTrigger value="visual" className="data-[state=active]:bg-muted">
                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                  Visuel
                </TabsTrigger>
                <TabsTrigger value="articles" className="data-[state=active]:bg-muted">
                  <Layers className="h-3.5 w-3.5 mr-1.5" />
                  Découpage
                  {blocks.length > 0 && (
                    <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">
                      {blocks.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TEXTE — full transcription as plain HTML stream */}
            <TabsContent value="text" className="flex-1 overflow-auto p-4 m-0" dir={dir}>
              {meta.summary && (
                <div className="mb-4 p-3 bg-muted/50 rounded text-sm italic">
                  {meta.summary}
                </div>
              )}
              {meta.keywords.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-1">
                  {meta.keywords.map((kw, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {kw}
                    </Badge>
                  ))}
                </div>
              )}
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: content || '<p class="text-muted-foreground">Aucun contenu</p>' }}
              />
            </TabsContent>

            {/* VISUEL — same content, formatted for reading */}
            <TabsContent value="visual" className="flex-1 overflow-auto p-6 m-0 bg-white" dir={dir}>
              {meta.title && (
                <h1 className="text-2xl font-bold mb-1 text-center">{meta.title}</h1>
              )}
              {meta.subtitle && (
                <p className="text-center text-muted-foreground mb-3">{meta.subtitle}</p>
              )}
              {meta.author && (
                <p className="text-center text-sm mb-6">{meta.author}</p>
              )}
              <div
                className="prose prose-sm lg:prose-base max-w-none mx-auto"
                dangerouslySetInnerHTML={{ __html: content || '<p class="text-muted-foreground">Aucun contenu</p>' }}
              />
            </TabsContent>

            {/* DÉCOUPAGE — blocks with per-block translation */}
            <TabsContent value="articles" className="flex-1 overflow-auto p-3 m-0 space-y-3 bg-muted/30">
              {blocks.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-8">
                  Aucun découpage détecté.
                  <br />
                  <span className="text-xs">
                    Le document n'a pas de titres H1/H2 — le pipeline d'upload n'a pas identifié de structure.
                  </span>
                </div>
              ) : (
                blocks.map((block) => {
                  const translation = blockTranslations[block.id];
                  const isTranslating = translatingId === block.id;
                  return (
                    <Card key={block.id} className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3
                          className={`font-semibold flex-1 ${block.level === 1 ? 'text-base' : 'text-sm'}`}
                          dir={dir}
                        >
                          <Badge variant="outline" className="mr-2 text-[10px]">
                            H{block.level}
                          </Badge>
                          {block.heading}
                        </h3>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTranslateBlock(block)}
                          disabled={isTranslating || !!translatingId}
                        >
                          {isTranslating ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                          ) : (
                            <Languages className="h-3.5 w-3.5 mr-1" />
                          )}
                          {isTranslating ? 'En cours…' : `Traduire (${displayLang === 'fr' ? 'AR' : 'FR'})`}
                        </Button>
                      </div>
                      <div
                        className="prose prose-sm max-w-none text-sm"
                        dir={dir}
                        dangerouslySetInnerHTML={{
                          __html: block.bodyHtml || '<p class="text-muted-foreground italic">Bloc vide</p>',
                        }}
                      />
                      {translation && (
                        <div className="mt-3 pt-3 border-t bg-primary/5 -mx-4 -mb-4 px-4 pb-4 rounded-b">
                          <div className="flex items-center gap-2 mb-2 text-xs text-primary font-medium">
                            <Languages className="h-3 w-3" />
                            Traduction ({displayLang === 'fr' ? 'arabe' : 'français'})
                          </div>
                          <div
                            className="prose prose-sm max-w-none text-sm"
                            dir={oppositeDir}
                            dangerouslySetInnerHTML={{ __html: translation }}
                          />
                        </div>
                      )}
                    </Card>
                  );
                })
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default DocumentAIView;
