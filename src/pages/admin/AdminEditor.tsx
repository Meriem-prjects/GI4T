import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload, FileText, Loader2, Sparkles, Edit3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import BatchDocumentUploader from '@/components/admin/BatchDocumentUploader';
import DocumentEditor from '@/components/admin/DocumentEditor';
import DocumentAIView from '@/components/admin/DocumentAIView';
import { Progress } from '@/components/ui/progress';

interface DocumentData {
  id?: string;
  content: string;
  title: string;
  title_ar?: string;
  subtitle?: string;
  subtitle_ar?: string;
  summary: string;
  summary_ar?: string;
  keywords: string[];
  keywords_ar?: string[];
  language: string;
  originalFileName: string;
  category_id?: string;
  document_type_id?: string;
  file_url?: string;
  pdf_url?: string;
  fullContent?: string;
  translated_content?: string;
  textual_metadata?: string;
  author?: string;
  author_ar?: string;
  court?: string;
  court_ar?: string;
  court_category?: string;
  court_category_ar?: string;
  court_category_type?: string;
  court_level?: string;
  court_level_ar?: string;
  case_number?: string;
  year?: number;
  plaintiff?: string;
  plaintiff_ar?: string;
  defendant?: string;
  defendant_ar?: string;
  validation_date?: string;
  legal_references?: string[];
  legal_references_ar?: string[];
  bibliography?: string;
  bibliography_ar?: string;
  page_contents?: any[];
  total_pages?: number;
  processed_pages?: number;
}


const STEP_LABELS: Record<string, string> = {
  queued: 'En attente de traitement',
  extracting_text: 'Extraction du texte (OCR)',
  ai_structure_metadata: 'Détection de la structure + métadonnées',
  translating: 'Traduction bilingue',
  saving: 'Enregistrement',
  generating_embedding: 'Indexation sémantique',
  done: 'Terminé',
  no_text_extracted: 'Échec : aucun texte extrait',
};

const AdminEditor = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentDocument, setCurrentDocument] = useState<DocumentData | null>(null);
  const [processedDocuments, setProcessedDocuments] = useState<DocumentData[]>([]);
  const [showUploader, setShowUploader] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [aiStatus, setAiStatus] = useState<"idle" | "processing" | "ready" | "failed">("idle");
  const [jobProgress, setJobProgress] = useState<{ progress: number; step: string } | null>(null);
  // "edit"  — classic form-based editor (DocumentEditor) for curation.
  // "ai"    — Mistral Document AI style 3-panel view: PDF | Texte/Visuel/Découpage.
  const [viewMode, setViewMode] = useState<'edit' | 'ai'>('ai');

  // Load existing document if doc parameter is present
  useEffect(() => {
    const docId = searchParams.get('doc');
    if (docId) {
      loadExistingDocument(docId);
    }
  }, [searchParams]);

  // Background poll: if the currently-loaded document is still being
  // processed by the upload pipeline, keep refetching every 3s until
  // status flips. Also pulls the processing_job progress so the UI can
  // show a real progress bar with the current step.
  useEffect(() => {
    if (!currentDocument?.id) return;
    if (aiStatus !== "processing") return;
    const interval = window.setInterval(async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('status, processing_job_id')
        .eq('id', currentDocument.id!)
        .maybeSingle();
      if (error) return;
      const row = data as { status?: string; processing_job_id?: string } | null;
      const s = row?.status;
      // Pull job progress (separate row).
      const jobId = row?.processing_job_id;
      if (jobId) {
        const { data: job } = await supabase
          .from('processing_jobs')
          .select('progress, current_step')
          .eq('id', jobId)
          .maybeSingle();
        const j = job as { progress?: number; current_step?: string } | null;
        if (j) setJobProgress({ progress: j.progress ?? 0, step: j.current_step ?? '' });
      }
      if (s && s !== 'processing') {
        await loadExistingDocument(currentDocument.id!);
        setAiStatus(s === 'extraction_failed' ? 'failed' : 'ready');
        setJobProgress(null);
        toast({
          title: s === 'extraction_failed' ? '❌ Extraction échouée' : '✅ Document prêt',
          description: s === 'extraction_failed'
            ? "L'OCR ou l'IA n'a pas pu traiter ce document."
            : "Tous les champs ont été remplis automatiquement.",
        });
      }
    }, 3000);
    return () => window.clearInterval(interval);
  }, [currentDocument?.id, aiStatus]);

  const loadExistingDocument = async (documentId: string) => {
    setIsLoading(true);
    setIsEditingExisting(true);
    
    try {
      const { data: document, error } = await supabase
        .from('documents')
        .select(`
          *,
          categories (id, name, color),
          document_types (id, name)
        `)
        .eq('id', documentId)
        .maybeSingle();

      console.log('[AdminEditor] loadExistingDocument', documentId, { document, error });

      if (error) {
        console.error('Error loading document:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger le document",
          variant: "destructive",
        });
        return;
      }

      if (!document) {
        toast({
          title: "Document introuvable",
          description: "Le document demandé n'existe pas",
          variant: "destructive",
        });
        return;
      }

      // Map document data to DocumentData format
      const mappedDocument: DocumentData = {
        id: document.id,
        content: document.content,
        title: document.title,
        title_ar: document.title_ar || '',
        subtitle: document.subtitle || '',
        subtitle_ar: document.subtitle_ar || '',
        summary: document.summary || '',
        summary_ar: document.summary_ar || '',
        keywords: document.keywords || [],
        keywords_ar: document.keywords_ar || [],
        language: document.language || 'fr',
        originalFileName: document.original_filename,
        category_id: document.category_id,
        document_type_id: document.document_type_id,
        file_url: document.file_url,
        pdf_url: document.pdf_url,
        fullContent: document.content,
        translated_content: document.translated_content || '',
        textual_metadata: document.textual_metadata || '',
        author: document.author || '',
        author_ar: document.author_ar || '',
        court: document.court || '',
        court_ar: document.court_ar || '',
        court_category: document.court_category || '',
        court_category_ar: document.court_category_ar || '',
        court_category_type: document.court_category_type || '',
        court_level: document.court_level || '',
        court_level_ar: document.court_level_ar || '',
        case_number: document.case_number || '',
        year: document.year || undefined,
        plaintiff: document.plaintiff || '',
        plaintiff_ar: document.plaintiff_ar || '',
        defendant: document.defendant || '',
        defendant_ar: document.defendant_ar || '',
        validation_date: document.validation_date || '',
        legal_references: document.legal_references || [],
        legal_references_ar: document.legal_references_ar || [],
        bibliography: document.bibliography || '',
        bibliography_ar: document.bibliography_ar || '',
        page_contents: (document.page_contents as any[]) || [],
        total_pages: document.total_pages || 0,
        processed_pages: document.processed_pages || 0,
      };

      setCurrentDocument(mappedDocument);
      setShowUploader(false);

      // Drive the background-poll: if the pipeline is still running,
      // mark the editor as "processing" so the useEffect above keeps
      // refetching until the AI fills the structured fields.
      const docStatus = (document as { status?: string }).status;
      if (docStatus === "processing") {
        setAiStatus("processing");
      } else if (docStatus === "extraction_failed") {
        setAiStatus("failed");
      } else {
        setAiStatus("ready");
      }
    } catch (error) {
      console.error('Error loading document:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors du chargement du document",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentsProcessed = async (documents: DocumentData[]) => {
    console.log('[AdminEditor] handleDocumentsProcessed', documents);
    setProcessedDocuments(documents);
    if (documents.length === 1) {
      const doc = documents[0];
      setShowUploader(false);
      // Always refetch by id — the upstream uploader may have handed us a
      // stale or empty row (e.g. fetched before the background pipeline
      // finished writing content/title/summary).
      if (doc.id) {
        await loadExistingDocument(doc.id);
        // Final guard: if the refetch left currentDocument null (API
        // 404 / permission issue) fall back to whatever the uploader gave us.
        setCurrentDocument((cur) => cur ?? doc);
      } else {
        setCurrentDocument(doc);
      }
    } else if (documents.length > 1) {
      // Show list of processed documents for selection
      setShowUploader(false);
    }
  };

  const handleSave = (data: DocumentData) => {
    setCurrentDocument(data);
    console.log('Document saved:', data);
  };

  const selectDocument = (doc: DocumentData) => {
    setCurrentDocument(doc);
  };

  const handleNewDocument = () => {
    if (isEditingExisting) {
      // If we were editing an existing document, go back to contents
      navigate('/admin/observatoire/contenus');
    } else {
      // If we were uploading new documents, reset the state
      setCurrentDocument(null);
      setProcessedDocuments([]);
      setShowUploader(true);
      setIsEditingExisting(false);
    }
  };

  return (
    <div className="p-6 space-y-6" dir="ltr">
      {/* Afficher le header seulement quand l'uploader est visible OU quand il y a plusieurs documents à sélectionner */}
      {(showUploader || (!currentDocument && processedDocuments.length > 1)) && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Éditeur de Documents
            </h1>
            <p className="text-muted-foreground">
              Téléchargez et éditez des documents avec l'aide de l'IA
            </p>
          </div>
        </div>
      )}

      {/* Bouton "Retour" + bascule de vue affichés seulement quand un document est actif */}
      {currentDocument && aiStatus !== 'processing' && (
        <div className="flex justify-between items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={handleNewDocument}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{isEditingExisting ? 'Retour aux contenus' : 'Nouveaux documents'}</span>
          </Button>
          <div className="flex items-center bg-muted rounded-md p-0.5">
            <button
              className={`px-3 py-1.5 text-sm rounded flex items-center gap-1.5 ${
                viewMode === 'ai' ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground'
              }`}
              onClick={() => setViewMode('ai')}
              title="Vue Document AI : PDF + transcription + découpage"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Document AI
            </button>
            <button
              className={`px-3 py-1.5 text-sm rounded flex items-center gap-1.5 ${
                viewMode === 'edit' ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground'
              }`}
              onClick={() => setViewMode('edit')}
              title="Vue éditeur classique : formulaire de curation"
            >
              <Edit3 className="h-3.5 w-3.5" />
              Édition
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <Card className="p-8">
          <div className="flex items-center justify-center space-x-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-muted-foreground">Chargement du document...</p>
          </div>
        </Card>
      ) : showUploader ? (
        <BatchDocumentUploader onDocumentsProcessed={handleDocumentsProcessed} />
      ) : currentDocument && aiStatus === "processing" ? (
        // Pipeline in flight — show ONLY the progress card. The editor
        // appears once status flips to pending_validation / completed.
        <Card className="p-8 max-w-2xl mx-auto">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <div className="flex-1">
                <h3 className="text-base font-semibold">Traitement du document en cours</h3>
                <p className="text-sm text-muted-foreground">
                  OCR → structuration → extraction des métadonnées → traduction bilingue
                </p>
              </div>
            </div>
            <Progress value={jobProgress?.progress ?? 0} className="h-2" />
            <div className="text-xs text-muted-foreground text-center">
              {jobProgress?.step
                ? STEP_LABELS[jobProgress.step] ?? jobProgress.step
                : 'Initialisation…'}
              {' • '}
              {jobProgress?.progress ?? 0}%
            </div>
            <p className="text-xs text-muted-foreground text-center italic">
              L'éditeur s'ouvrira automatiquement avec tous les champs déjà remplis (60-120 s).
            </p>
          </div>
        </Card>
      ) : currentDocument ? (
        viewMode === 'ai' ? (
          <DocumentAIView documentData={currentDocument} />
        ) : (
          <DocumentEditor documentData={currentDocument} onSave={handleSave} />
        )
      ) : processedDocuments.length > 1 ? (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            Documents traités ({processedDocuments.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {processedDocuments.map((doc, index) => (
              <Card 
                key={index} 
                className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => selectDocument(doc)}
              >
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{doc.title}</h4>
                    <p className="text-sm text-muted-foreground truncate">
                      {doc.originalFileName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {doc.keywords.slice(0, 3).join(', ')}
                      {doc.keywords.length > 3 && '...'}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
};

export default AdminEditor;