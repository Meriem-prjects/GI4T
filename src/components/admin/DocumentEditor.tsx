import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SimpleTextEditor from './SimpleTextEditor';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Eye, EyeOff, X, AlertTriangle, FileText, ChevronLeft, ChevronRight, BookOpen, Brain, Loader2, CheckCircle, XCircle, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCourtTypes } from '@/hooks/useCourtTypes';
import { useJurisdictionLevels } from '@/hooks/useJurisdictionLevels';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MultiCategorySelector } from './MultiCategorySelector';
import { useDocumentCategories, useUpdateDocumentCategories } from '@/hooks/useDocumentCategories';
import PDFViewer from './PDFViewer';
import { renderFormattedContent, formatContent } from '@/utils/contentFormatter';
import { normalizeArabicText, normalizeArabicForDisplay, handleArabicInput } from '@/lib/arabicUtils';

interface PageContent {
  pageNumber: number;
  content: string;
  confidence?: number;
  translated_content?: string;
  translation_status?: 'pending' | 'translating' | 'completed' | 'error';
}

interface DocumentData {
  id?: string;
  title: string;
  title_ar?: string;
  subtitle?: string;
  subtitle_ar?: string;
  content: string;
  textual_metadata?: string;
  summary: string;
  summary_ar?: string;
  keywords: string[];
  keywords_ar?: string[];
  language: string;
  originalFileName: string;
  document_type_id?: string;
  category_id?: string;
  file_url?: string;
  pdf_url?: string;
  fullContent?: string;
  translated_content?: string;
  page_contents?: PageContent[];
  total_pages?: number;
  processed_pages?: number;
  author?: string;
  author_ar?: string;
  court?: string;
  court_ar?: string;
  court_category_type?: string;
  court_category_type_ar?: string;
  court_level?: string;
  court_level_ar?: string;
  case_number?: string;
  year?: number;
  plaintiff?: string;
  plaintiff_ar?: string;
  defendant?: string;
  defendant_ar?: string;
}

interface Category {
  id: string;
  name: string;
  name_ar?: string;
  color: string;
}

interface DocumentType {
  id: string;
  name: string;
  name_ar?: string;
}

interface DocumentEditorProps {
  documentData: DocumentData;
  onSave: (data: DocumentData) => void;
}

const DocumentEditor: React.FC<DocumentEditorProps> = ({ documentData, onSave }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isFromValidation = searchParams.get('source') === 'validation';
  
  const [editedData, setEditedData] = useState<DocumentData>(documentData);
  const [showPreview, setShowPreview] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [selectedCourtType, setSelectedCourtType] = useState<string>('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  
  // Track if we've already normalized data on load to avoid re-normalizing
  const hasNormalizedOnLoad = React.useRef(false);
  
  // Hook pour récupérer les types de tribunaux et niveaux de juridiction
  const { data: courtTypes = [] } = useCourtTypes();
  const { data: jurisdictionLevels = [] } = useJurisdictionLevels();
  
  // Hooks pour les catégories de documents
  const { data: documentCategories = [] } = useDocumentCategories(editedData.id);
  const updateDocumentCategories = useUpdateDocumentCategories();
  const [newKeyword, setNewKeyword] = useState('');
  const [newKeywordAr, setNewKeywordAr] = useState('');
  const [currentView, setCurrentView] = useState<'editor' | 'pdf' | 'pages'>('editor');
  const [currentLanguage, setCurrentLanguage] = useState<'fr' | 'ar'>('fr');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [translatedByAI, setTranslatedByAI] = useState<{fr: boolean, ar: boolean}>({fr: false, ar: false});
  const [currentPage, setCurrentPage] = useState(1);
  const [translatedContent, setTranslatedContent] = useState<string>('');
  const [validationRemarks, setValidationRemarks] = useState<string>('');
  const [isReprocessing, setIsReprocessing] = useState(false);
  const [translatedTextualMetadata, setTranslatedTextualMetadata] = useState<string>('');
  const [isCleaningArabic, setIsCleaningArabic] = useState(false);
  const [isCorrectingSpacing, setIsCorrectingSpacing] = useState(false);
  const [fullTranslationJob, setFullTranslationJob] = useState<{
    jobId: string | null;
    status: 'idle' | 'processing' | 'completed' | 'failed';
    progress: number;
    currentStep: string;
    errorMessage?: string;
  }>({
    jobId: null,
    status: 'idle',
    progress: 0,
    currentStep: ''
  });
  const [isPollingJob, setIsPollingJob] = useState(false);
  const [translatingPages, setTranslatingPages] = useState<Set<number>>(new Set());

  useEffect(() => {
    setEditedData(documentData);
    setTranslatedContent(documentData.translated_content || '');
    setHasChanges(false);
    // Set default tab based on document language - force refresh
    const docLang = documentData.language || 'fr';
    setCurrentLanguage(docLang === 'ar' ? 'ar' : 'fr');
    console.log('DocumentEditor loaded with language:', docLang, 'Setting currentLanguage to:', docLang === 'ar' ? 'ar' : 'fr');
    console.log('Document subtitle_ar:', documentData.subtitle_ar);
    console.log('Document subtitle_ar length:', documentData.subtitle_ar?.length);
    console.log('Document subtitle_ar chars:', documentData.subtitle_ar?.split('').map(c => c.charCodeAt(0)));
    
    // Initialize selectedCourtType if document has court_category_type
    if (documentData.court_category_type) {
      setSelectedCourtType(documentData.court_category_type);
    }
    
    // Note: We no longer normalize Arabic fields on load to preserve original spacing and syntax
    // Normalization will only happen during save to ensure data consistency in database
    
    loadCategories();
    loadDocumentTypes();
    
    // Cleanup Realtime channels on unmount
    return () => {
      supabase.getChannels().forEach(channel => {
        if (channel.topic.startsWith('job-')) {
          supabase.removeChannel(channel);
        }
      });
    };
  }, [documentData]);

  // Separate effect for document categories to ensure they're loaded after data is available
  useEffect(() => {
    if (documentCategories.length > 0) {
      console.log('Loading document categories:', documentCategories);
      setSelectedCategoryIds(documentCategories.map(dc => dc.category_id));
    } else if (documentData.category_id) {
      // Fallback: support legacy single-category stored on documents table
      setSelectedCategoryIds([documentData.category_id]);
    } else {
      setSelectedCategoryIds([]);
    }
  }, [documentCategories, documentData.category_id]);

  // Auto-extract textual metadata effect (run only if truly null/absent)
  useEffect(() => {
    if (documentData.id && documentData.content && documentData.textual_metadata == null) {
      console.log('Auto-extracting textual metadata for document:', documentData.id);
      setTimeout(() => {
        autoExtractMetadata();
      }, 1000); // Small delay to ensure component is fully loaded
    }
  }, [documentData]);

  // Fallback: ensure display by fetching textual_metadata directly when empty
  useEffect(() => {
    if (editedData.id && (!editedData.textual_metadata || editedData.textual_metadata.trim() === '')) {
      supabase
        .from('documents')
        .select('textual_metadata')
        .eq('id', editedData.id)
        .single()
        .then(({ data, error }) => {
          if (!error && data?.textual_metadata) {
            setEditedData(prev => ({ ...prev, textual_metadata: data.textual_metadata }));
          }
        });
    }
  }, [editedData.id]);

  // Récupérer le job en cours au chargement
  useEffect(() => {
    if (editedData.id) {
      const checkExistingJob = async () => {
        const { data: doc } = await supabase
          .from('documents')
          .select('processing_job_id')
          .eq('id', editedData.id)
          .single();
        
        if (doc?.processing_job_id) {
          const { data: existingJob } = await supabase
            .from('processing_jobs')
            .select('id, status, progress, current_step, error_message')
            .eq('id', doc.processing_job_id)
            .single();
          
          if (existingJob && existingJob.status === 'processing') {
            console.log('📥 Reconnecting to existing translation job:', existingJob.id);
            setFullTranslationJob({
              jobId: existingJob.id,
              status: 'processing',
              progress: existingJob.progress,
              currentStep: existingJob.current_step || '',
              errorMessage: existingJob.error_message || undefined
            });
            startRealtimeJobTracking(existingJob.id);
          }
        }
      };
      
      checkExistingJob();
    }
  }, [editedData.id]);

  const autoExtractMetadata = async () => {
    if (!editedData.id) return;
    
    setIsReprocessing(true);
    
    try {
      console.log('Auto-extracting metadata for document:', editedData.id);
      
      const { data, error } = await supabase.functions.invoke('reprocess-document', {
        body: { documentId: editedData.id }
      });

      if (error) {
        throw error;
      }

      console.log('Auto-extract result:', data);

      // Update the edited data with the new separation  
      const { data: updatedDoc, error: fetchError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', editedData.id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      if (updatedDoc) {
        setEditedData(prev => ({
          ...prev,
          textual_metadata: (updatedDoc as any).textual_metadata,
          content: updatedDoc.content
        }));
        
        if (data.separated) {
          console.log(`Métadonnées extraites automatiquement: ${data.textualMetadataLength} caractères`);
        }
      }

    } catch (error: any) {
      console.error('Auto-extract error:', error);
      // Silent error - don't show toast for auto-extraction failures
    } finally {
      setIsReprocessing(false);
    }
  };

  const startRealtimeJobTracking = (jobId: string) => {
    console.log('🔴 Starting Realtime tracking for job:', jobId);
    setIsPollingJob(true);
    
    const channel = supabase
      .channel(`job-${jobId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'processing_jobs',
          filter: `id=eq.${jobId}`
        },
        (payload) => {
          console.log('📡 Realtime update received:', payload.new);
          
          const job = payload.new as any;
          
          setFullTranslationJob({
            jobId,
            status: job.status,
            progress: job.progress || 0,
            currentStep: job.current_step || '',
            errorMessage: job.error_message || undefined
          });
          
          if (job.status === 'completed') {
            console.log('✅ Translation completed via Realtime!');
            
            // Recharger le document pour afficher translated_content
            supabase
              .from('documents')
              .select('translated_content')
              .eq('id', editedData.id!)
              .single()
              .then(({ data: updatedDoc }) => {
                if (updatedDoc) {
                  setEditedData(prev => ({
                    ...prev,
                    translated_content: updatedDoc.translated_content
                  }));
                  setTranslatedContent(updatedDoc.translated_content || '');
                }
              });
            
            toast({
              title: "✅ Traduction terminée !",
              description: "Le document a été traduit intégralement."
            });
            
            // Nettoyer le channel
            supabase.removeChannel(channel);
            setIsPollingJob(false);
          } else if (job.status === 'failed') {
            console.error('❌ Translation failed:', job.error_message);
            
            toast({
              title: "❌ Échec de la traduction",
              description: job.error_message || "Erreur inconnue",
              variant: "destructive",
              action: (
                <Button variant="outline" size="sm" onClick={() => runFullTranslation()}>
                  Réessayer
                </Button>
              )
            });
            
            // Nettoyer le channel
            supabase.removeChannel(channel);
            setIsPollingJob(false);
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });
    
    // Cleanup automatique après 1 heure
    setTimeout(() => {
      supabase.removeChannel(channel);
      setIsPollingJob(false);
    }, 60 * 60 * 1000);
  };

  const runFullTranslation = async () => {
    if (!editedData.content) {
      console.error('❌ [runFullTranslation] No content to translate');
      toast({
        title: "Erreur",
        description: "Aucun contenu à traduire.",
        variant: "destructive"
      });
      return;
    }

    console.log('🚀 [runFullTranslation] Starting full translation...');
    console.log('📄 Document ID:', editedData.id);
    console.log('📝 Content length:', editedData.content?.length);
    console.log('🌍 Language:', editedData.language);
    
    setIsAnalyzing(true);
    
    try {
      const requestBody = {
        textualMetadata: editedData.textual_metadata || '',
        content: editedData.content,
        currentLanguage: editedData.language || 'fr',
        mode: 'full',
        documentId: editedData.id,
        documentFileName: editedData.originalFileName
      };
      
      console.log('📤 [runFullTranslation] Invoking smart-document-analysis with body:', {
        ...requestBody,
        content: `${requestBody.content?.substring(0, 100)}... (${requestBody.content?.length} chars)`
      });
      
      const { data, error } = await supabase.functions.invoke('smart-document-analysis', {
        body: requestBody
      });

      console.log('📥 [runFullTranslation] Edge function response:', { data, error });

      if (error) {
        console.error('❌ [runFullTranslation] Edge function returned error:', error);
        throw error;
      }

      if (!data) {
        console.error('❌ [runFullTranslation] No data returned from edge function');
        throw new Error('Aucune donnée reçue de la fonction de traduction');
      }

      console.log('✅ [runFullTranslation] Received data mode:', data.mode);

      if (data.mode === 'full_async') {
        console.log('⏳ [runFullTranslation] Async translation started');
        console.log('🆔 Job ID:', data.job_id);
        console.log('⏱️ Estimated duration:', data.estimated_duration_minutes, 'minutes');
        
        // Traduction asynchrone lancée
        setFullTranslationJob({
          jobId: data.job_id,
          status: 'processing',
          progress: 0,
          currentStep: 'Démarrage...'
        });
        
        toast({
          title: "🚀 Traduction en cours",
          description: `Traduction intégrale lancée en arrière-plan. Durée estimée : ${Math.round(data.estimated_duration_minutes)} min.`,
        });
        
        // Démarrer le tracking Realtime
        console.log('🔴 [runFullTranslation] Starting realtime tracking for job:', data.job_id);
        startRealtimeJobTracking(data.job_id);
      } else {
        console.log('⚡ [runFullTranslation] Sync translation completed');
        
        // Traduction synchrone (document court)
        if (data.analysis?.translatedContent) {
          console.log('📝 [runFullTranslation] Translated content length:', data.analysis.translatedContent.length);
          
          setEditedData(prev => ({
            ...prev,
            translated_content: data.analysis.translatedContent
          }));
          setTranslatedContent(data.analysis.translatedContent);
        } else {
          console.warn('⚠️ [runFullTranslation] No translated content in response');
        }
        
        toast({
          title: "✅ Traduction terminée",
          description: "La traduction intégrale est disponible.",
        });
      }
    } catch (err: any) {
      console.error('❌ [runFullTranslation] Critical error:', err);
      console.error('❌ Error name:', err?.name);
      console.error('❌ Error message:', err?.message);
      console.error('❌ Error stack:', err?.stack);
      console.error('❌ Full error object:', JSON.stringify(err, null, 2));
      
      let errorMessage = "Impossible de lancer la traduction intégrale.";
      
      if (err?.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      console.error('💬 [runFullTranslation] Showing error toast with message:', errorMessage);
      
      toast({
        title: "❌ Erreur de traduction",
        description: errorMessage,
        variant: "destructive",
        action: (
          <Button variant="outline" size="sm" onClick={() => runFullTranslation()}>
            Réessayer
          </Button>
        )
      });
    } finally {
      console.log('🏁 [runFullTranslation] Finished (analyzing state reset)');
      setIsAnalyzing(false);
    }
  };

  const translatePage = async (pageNumber: number) => {
    if (!editedData.id || !editedData.page_contents) {
      toast({
        title: "Erreur",
        description: "Document invalide.",
        variant: "destructive"
      });
      return;
    }

    const page = editedData.page_contents.find(p => p.pageNumber === pageNumber);
    if (!page) {
      toast({
        title: "Erreur",
        description: `Page ${pageNumber} introuvable.`,
        variant: "destructive"
      });
      return;
    }

    // Mark page as translating
    setTranslatingPages(prev => new Set(prev).add(pageNumber));
    
    // Update local state to show "translating" status
    setEditedData(prev => ({
      ...prev,
      page_contents: prev.page_contents?.map(p => 
        p.pageNumber === pageNumber 
          ? { ...p, translation_status: 'translating' }
          : p
      )
    }));

    try {
      console.log(`🔄 Translating page ${pageNumber}...`);
      
      const { data, error } = await supabase.functions.invoke('translate-page', {
        body: {
          document_id: editedData.id,
          page_number: pageNumber,
          content: page.content,
          source_language: editedData.language || 'fr',
          target_language: editedData.language === 'fr' ? 'ar' : 'fr'
        }
      });

      if (error) {
        console.error('Error translating page:', error);
        throw error;
      }

      if (!data?.translated_content) {
        throw new Error('Aucune traduction reçue');
      }

      console.log(`✅ Page ${pageNumber} translated successfully`);
      
      // Update local state with translation
      setEditedData(prev => ({
        ...prev,
        page_contents: prev.page_contents?.map(p => 
          p.pageNumber === pageNumber 
            ? { 
                ...p, 
                translated_content: data.translated_content,
                translation_status: 'completed'
              }
            : p
        )
      }));

      toast({
        title: "✅ Page traduite",
        description: `Page ${pageNumber} traduite avec succès.`,
      });

      // Check if all pages are now translated and consolidate automatically
      const updatedPageContents = editedData.page_contents?.map(p => 
        p.pageNumber === pageNumber 
          ? { ...p, translated_content: data.translated_content, translation_status: 'completed' as const }
          : p
      );

      const allTranslated = updatedPageContents?.every(
        page => page.translated_content && page.translated_content.trim() !== ''
      );

      if (allTranslated) {
        console.log('🎉 All pages translated! Auto-consolidating...');
        setTimeout(() => consolidatePageTranslations(), 500);
      }

    } catch (err: any) {
      console.error(`Error translating page ${pageNumber}:`, err);
      
      // Update status to error
      setEditedData(prev => ({
        ...prev,
        page_contents: prev.page_contents?.map(p => 
          p.pageNumber === pageNumber 
            ? { ...p, translation_status: 'error' }
            : p
        )
      }));

      toast({
        title: "Erreur de traduction",
        description: err?.message || `Impossible de traduire la page ${pageNumber}.`,
        variant: "destructive"
      });
    } finally {
      setTranslatingPages(prev => {
        const newSet = new Set(prev);
        newSet.delete(pageNumber);
        return newSet;
      });
    }
  };

  const consolidatePageTranslations = async () => {
    if (!editedData.page_contents || !editedData.id) return;
    
    // Collect all page translations in order
    const translations = editedData.page_contents
      .sort((a, b) => a.pageNumber - b.pageNumber)
      .map(page => page.translated_content || '')
      .filter(content => content.trim() !== '');
    
    if (translations.length === 0) {
      toast({
        title: "⚠️ Aucune traduction",
        description: "Aucune page traduite à consolider.",
        variant: "destructive"
      });
      return;
    }
    
    // Join all translations
    const consolidatedContent = translations.join('\n\n');
    
    // Update local state
    setTranslatedContent(consolidatedContent);
    setEditedData(prev => ({
      ...prev,
      translated_content: consolidatedContent
    }));
    
    // Update database
    const { error } = await supabase
      .from('documents')
      .update({ translated_content: consolidatedContent })
      .eq('id', editedData.id);
    
    if (error) {
      console.error('Error consolidating translations:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de consolider les traductions.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "✅ Traduction consolidée !",
        description: `Les ${translations.length} pages traduites ont été consolidées dans l'onglet Contenu.`,
      });
    }
  };

  // Helper to parse and clean keywords array
  const parseKeywordsArray = (keywords: any[]): string[] => {
    if (!keywords || !Array.isArray(keywords)) return [];
    
    return keywords.flatMap(k => {
      if (typeof k === 'string') {
        const trimmed = k.trim();
        // If keyword contains separators, split it
        if (trimmed.includes(',') || trimmed.includes(';') || trimmed.includes('|')) {
          return trimmed.split(/[,;|]/).map(item => item.trim()).filter(item => item);
        }
        return [trimmed].filter(item => item);
      }
      return [];
    });
  };

  useEffect(() => {
    if (documentCategories.length > 0) {
      setSelectedCategoryIds(documentCategories.map(dc => dc.category_id));
    }
  }, [documentCategories]);

  useEffect(() => {
    const hasChanged = JSON.stringify(editedData) !== JSON.stringify(documentData);
    setHasChanges(hasChanged);
  }, [editedData, documentData]);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error loading categories:', error);
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger les catégories.",
          variant: "destructive"
        });
      } else {
        console.log('Categories loaded in DocumentEditor:', data);
        setCategories(data || []);
      }
    } catch (error) {
      console.error('Categories loading error:', error);
    }
  };

  const loadDocumentTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('document_types')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error loading document types:', error);
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger les types de documents.",
          variant: "destructive"
        });
      } else {
        console.log('Document types loaded in DocumentEditor:', data);
        setDocumentTypes(data || []);
      }
    } catch (error) {
      console.error('Document types loading error:', error);
    }
  };

  const runAIAnalysis = async () => {
    if (!editedData.content) {
      toast({
        title: "Erreur",
        description: "Aucun contenu à analyser.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      console.log('Starting AI analysis...');
      
      // Health check ping before sending the main request
      try {
        const healthCheck = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/smart-document-analysis`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        });
        
        if (!healthCheck.ok) {
          console.warn('Health check failed:', healthCheck.status);
          toast({
            title: "Service IA indisponible",
            description: "Le service d'analyse IA n'est pas disponible. Veuillez réessayer dans quelques instants.",
            variant: "destructive",
          });
          setIsAnalyzing(false);
          return;
        }
        console.log('Health check passed');
      } catch (pingError) {
        console.error('Health check error:', pingError);
        toast({
          title: "Service IA indisponible",
          description: "Impossible de joindre le service d'analyse. Vérifiez votre connexion.",
          variant: "destructive",
        });
        setIsAnalyzing(false);
        return;
      }

      // Main analysis call with automatic retry
      let lastError: any = null;
      let attempt = 0;
      const maxAttempts = 2;
      let data: any = null;
      let error: any = null;
      
      while (attempt < maxAttempts) {
        attempt++;
        console.log(`Analysis attempt ${attempt}/${maxAttempts}`);
        
        try {
          const response = await supabase.functions.invoke('smart-document-analysis', {
            body: {
              textualMetadata: editedData.textual_metadata || '',
              content: editedData.content,
              currentLanguage: editedData.language || 'fr',
              mode: 'quick'
            }
          });
          
          data = response.data;
          error = response.error;
          
          console.log('AI Analysis response:', { data, error });

          // Handle specific error cases
          if (error) {
            console.error('Error from edge function:', error);
            
            // Check for network/connection errors that should trigger retry
            if (error.message && error.message.includes('Failed to send a request to the Edge Function')) {
              lastError = error;
              if (attempt < maxAttempts) {
                console.log('Network error detected, retrying in 1 second...');
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
              }
            }
            
            // Handle rate limit
            if ((error as any).status === 429) {
              toast({
                title: "Trop de requêtes",
                description: "Vous avez envoyé trop de requêtes. Veuillez patienter quelques instants.",
                variant: "destructive",
              });
              setIsAnalyzing(false);
              return;
            }
            
            // Handle payment required
            if ((error as any).status === 402) {
              toast({
                title: "Crédits IA épuisés",
                description: "Vos crédits IA sont épuisés. Veuillez recharger votre compte.",
                variant: "destructive",
              });
              setIsAnalyzing(false);
              return;
            }
            
            throw error;
          }

          // Handle business logic errors
          if (!data || !data.success) {
            if (data?.error === 'DOCUMENT_TOO_LONG_FOR_SYNC_FULL_TRANSLATION') {
              toast({
                title: "Document trop long",
                description: data.message || "Ce document est trop long pour une analyse complète synchrone. Utilisez le mode rapide.",
                variant: "destructive",
              });
              setIsAnalyzing(false);
              return;
            }
            throw new Error(data?.error || 'Analyse échouée');
          }
          
          // Success - break out of retry loop
          break;
          
        } catch (attemptError) {
          lastError = attemptError;
          if (attempt < maxAttempts && 
              lastError?.message?.includes('Failed to send a request to the Edge Function')) {
            console.log('Retrying after error...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
          throw attemptError;
        }
      }

      if (data.success && data.analysis) {
        const analysis = (data as any).analysis;
        const isPrimaryArabic = editedData.language === 'ar';
        
        // Debug: Log analysis result to verify content
        console.log('🔍 AI Analysis Result:', {
          isPrimaryArabic,
          titleLanguage: analysis.title ? ((/[\u0600-\u06FF]/.test(analysis.title)) ? 'AR' : 'FR') : 'N/A',
          translatedTitleLanguage: analysis.translatedTitle ? ((/[\u0600-\u06FF]/.test(analysis.translatedTitle)) ? 'AR' : 'FR') : 'N/A',
          existingKeywordsType: Array.isArray(analysis.existingKeywords) ? 'array' : typeof analysis.existingKeywords,
          existingKeywordsCount: Array.isArray(analysis.existingKeywords) ? analysis.existingKeywords.length : 0,
          existingKeywordsFirstItem: Array.isArray(analysis.existingKeywords) && analysis.existingKeywords[0],
          translatedKeywordsType: Array.isArray(analysis.translatedKeywords) ? 'array' : typeof analysis.translatedKeywords,
        });

        // Verify that translations are in the correct language
        const verifyTranslationLanguage = (text: string, expectedLanguage: 'ar' | 'fr'): boolean => {
          if (!text) return true;
          
          if (expectedLanguage === 'ar') {
            return /[\u0600-\u06FF]/.test(text);
          } else {
            return /[a-zA-ZÀ-ÿ]/.test(text);
          }
        };

        // Log warnings if translations are in wrong language
        if (!isPrimaryArabic) {
          if (!verifyTranslationLanguage(analysis.translatedTitle, 'ar')) {
            console.warn('translatedTitle is not in Arabic:', analysis.translatedTitle);
            toast({
              title: "Avertissement",
              description: "Le titre traduit en arabe semble incorrect",
              variant: "default"
            });
          }
          if (!verifyTranslationLanguage(analysis.translatedSubtitle, 'ar')) {
            console.warn('translatedSubtitle is not in Arabic:', analysis.translatedSubtitle);
          }
          if (!verifyTranslationLanguage(analysis.translatedSummary, 'ar')) {
            console.warn('translatedSummary is not in Arabic:', analysis.translatedSummary);
          }
        }
        
        // DON'T change the original content - keep it intact
        // Only update metadata fields
        
        // Store the translated textual metadata from AI analysis
        setTranslatedTextualMetadata(analysis.textualMetadataTranslated || '');
        
        // Apply suggested dropdown selections from AI analysis
        const suggestionIds = data.suggestionIds || {};
        
        // Assign fields based on document's primary language
        if (isPrimaryArabic) {
          // Arabic is primary - analysis result goes to Arabic fields, translation to French
          setEditedData(prev => ({
            ...prev,
            title_ar: analysis.title ? normalizeArabicForDisplay(analysis.title) : prev.title_ar,
            subtitle_ar: analysis.subtitle ? normalizeArabicForDisplay(analysis.subtitle) : prev.subtitle_ar,
            title: analysis.translatedTitle || prev.title,
            subtitle: analysis.translatedSubtitle || prev.subtitle,
            summary_ar: analysis.summary ? normalizeArabicForDisplay(analysis.summary) : prev.summary_ar,
            summary: analysis.translatedSummary || prev.summary,
            // Keep original content unchanged
            // Apply AI suggestions for dropdown fields
            document_type_id: suggestionIds.documentTypeId || prev.document_type_id,
            // Metadata in Arabic (primary language)
            author_ar: analysis.metadata?.author ? normalizeArabicForDisplay(analysis.metadata.author) : prev.author_ar,
            court_ar: analysis.metadata?.court ? normalizeArabicForDisplay(analysis.metadata.court) : prev.court_ar,
            case_number: analysis.metadata?.case_number || prev.case_number,
            plaintiff_ar: analysis.metadata?.plaintiff ? normalizeArabicForDisplay(analysis.metadata.plaintiff) : prev.plaintiff_ar,
            defendant_ar: analysis.metadata?.defendant ? normalizeArabicForDisplay(analysis.metadata.defendant) : prev.defendant_ar,
            year: analysis.metadata?.year || prev.year,
            court_level_ar: analysis.metadata?.court_level ? normalizeArabicForDisplay(analysis.metadata.court_level) : prev.court_level_ar,
            // Translated metadata in French
            author: analysis.metadataTranslated?.author || prev.author,
            court: analysis.metadataTranslated?.court || prev.court,
            plaintiff: analysis.metadataTranslated?.plaintiff || prev.plaintiff,
            defendant: analysis.metadataTranslated?.defendant || prev.defendant,
            court_level: analysis.metadataTranslated?.court_level || prev.court_level,
            // Keep original Arabic content, don't replace it
            keywords_ar: (() => {
              const existing = (prev.keywords_ar || []).map(k => normalizeArabicForDisplay(k.trim())).filter(k => k && /[\u0600-\u06FF]/.test(k));
              const rawNewKeys = parseKeywordsArray(analysis.existingKeywords || []);
              const newKeys = rawNewKeys.map(k => normalizeArabicForDisplay(k.trim())).filter(k => k && /[\u0600-\u06FF]/.test(k));
              const combined = [...existing, ...newKeys];
              const seen = new Set();
              return combined.filter(k => {
                const normalized = k.toLowerCase().trim().replace(/\s+/g, ' ');
                if (seen.has(normalized)) return false;
                seen.add(normalized);
                return true;
              });
            })(),
            keywords: (() => {
              const existing = (prev.keywords || []).map(k => k.trim()).filter(k => k && !/[\u0600-\u06FF]/.test(k));
              const rawNewKeys = parseKeywordsArray(analysis.translatedKeywords || []);
              const newKeys = rawNewKeys.filter(k => k && !/[\u0600-\u06FF]/.test(k));
              const combined = [...existing, ...newKeys];
              const seen = new Set();
              return combined.filter(k => {
                const normalized = k.toLowerCase().trim().replace(/\s+/g, ' ');
                if (seen.has(normalized)) return false;
                seen.add(normalized);
                return true;
              });
            })()
          }));
          // Store translated content separately
          setTranslatedContent(analysis.translatedContent || '');
          // Switch to French tab to show translated content
          setCurrentLanguage('fr');
        } else {
          // French is primary - analysis result goes to French fields, translation to Arabic
          setEditedData(prev => ({
            ...prev,
            title: analysis.title || prev.title,
            subtitle: analysis.subtitle || prev.subtitle,
            title_ar: analysis.translatedTitle ? normalizeArabicForDisplay(analysis.translatedTitle) : prev.title_ar,
            subtitle_ar: analysis.translatedSubtitle ? normalizeArabicForDisplay(analysis.translatedSubtitle) : prev.subtitle_ar,
            summary: analysis.summary || prev.summary,
            summary_ar: analysis.translatedSummary ? normalizeArabicForDisplay(analysis.translatedSummary) : prev.summary_ar,
            // Keep original content unchanged
            // Apply AI suggestions for dropdown fields
            document_type_id: suggestionIds.documentTypeId || prev.document_type_id,
            // Metadata in French (primary language)
            author: analysis.metadata?.author || prev.author,
            court: analysis.metadata?.court || prev.court,
            case_number: analysis.metadata?.case_number || prev.case_number,
            plaintiff: analysis.metadata?.plaintiff || prev.plaintiff,
            defendant: analysis.metadata?.defendant || prev.defendant,
            year: analysis.metadata?.year || prev.year,
            court_level: analysis.metadata?.court_level || prev.court_level,
            // Translated metadata in Arabic
            author_ar: analysis.metadataTranslated?.author ? normalizeArabicForDisplay(analysis.metadataTranslated.author) : prev.author_ar,
            court_ar: analysis.metadataTranslated?.court ? normalizeArabicForDisplay(analysis.metadataTranslated.court) : prev.court_ar,
            plaintiff_ar: analysis.metadataTranslated?.plaintiff ? normalizeArabicForDisplay(analysis.metadataTranslated.plaintiff) : prev.plaintiff_ar,
            defendant_ar: analysis.metadataTranslated?.defendant ? normalizeArabicForDisplay(analysis.metadataTranslated.defendant) : prev.defendant_ar,
            court_level_ar: analysis.metadataTranslated?.court_level ? normalizeArabicForDisplay(analysis.metadataTranslated.court_level) : prev.court_level_ar,
            // Keep original French content, don't replace it
            keywords: (() => {
              const existing = (prev.keywords || []).map(k => k.trim()).filter(k => k && !/[\u0600-\u06FF]/.test(k));
              const rawNewKeys = parseKeywordsArray(analysis.existingKeywords || []);
              const newKeys = rawNewKeys.filter(k => k && !/[\u0600-\u06FF]/.test(k));
              const combined = [...existing, ...newKeys];
              const seen = new Set();
              return combined.filter(k => {
                const normalized = k.toLowerCase().trim().replace(/\s+/g, ' ');
                if (seen.has(normalized)) return false;
                seen.add(normalized);
                return true;
              });
            })(),
            keywords_ar: (() => {
              const existing = (prev.keywords_ar || []).map(k => normalizeArabicForDisplay(k.trim())).filter(k => k && /[\u0600-\u06FF]/.test(k));
              const rawNewKeys = parseKeywordsArray(analysis.translatedKeywords || []);
              const newKeys = rawNewKeys.map(k => normalizeArabicForDisplay(k.trim())).filter(k => k && /[\u0600-\u06FF]/.test(k));
              const combined = [...existing, ...newKeys];
              const seen = new Set();
              return combined.filter(k => {
                const normalized = k.toLowerCase().trim().replace(/\s+/g, ' ');
                if (seen.has(normalized)) return false;
                seen.add(normalized);
                return true;
              });
            })()
          }));
          // Store translated content separately
          setTranslatedContent(analysis.translatedContent || '');
          // Switch to Arabic tab to show translated content
          setCurrentLanguage('ar');
        }

        // Update court type selection if suggested (for both languages)
        if (suggestionIds.courtTypeId) {
          const suggestedCourtType = courtTypes.find(ct => ct.id === suggestionIds.courtTypeId);
          if (suggestedCourtType) {
            setSelectedCourtType(suggestedCourtType.name);
            setEditedData(prev => ({
              ...prev,
              court_category_type: suggestedCourtType.name,
              court_category_type_ar: suggestedCourtType.name_ar ? normalizeArabicForDisplay(suggestedCourtType.name_ar) : null
            }));
          }
        }

        // Update category selection if suggested
        if (suggestionIds.categoryId) {
          setSelectedCategoryIds(prev => {
            if (!prev.includes(suggestionIds.categoryId)) {
              return [...prev, suggestionIds.categoryId];
            }
            return prev;
          });
        }

        // Mark translated content
        setTranslatedByAI({
          fr: isPrimaryArabic, // French is translated if Arabic is primary
          ar: !isPrimaryArabic // Arabic is translated if French is primary
        });

        setHasChanges(true);
        
        toast({
          title: "Analyse IA terminée (mode rapide)",
          description: `Métadonnées extraites et classifications automatiques appliquées. Pour une traduction intégrale du contenu complet, utilisez l'analyse complète.`,
        });
      } else {
        throw new Error(data.error || 'Analyse échouée');
      }
    } catch (error: any) {
      console.error('Error during AI analysis:', error);
      console.error('Error details:', {
        name: error?.name,
        message: error?.message,
        status: error?.status,
        stack: error?.stack?.split('\n').slice(0, 3).join('\n')
      });
      
      const isNetworkError = error?.message?.includes('Failed to send a request to the Edge Function') ||
                             error?.message?.includes('Failed to fetch');
      
      toast({
        title: isNetworkError ? "Erreur de connexion" : "Erreur lors de l'analyse IA",
        description: isNetworkError 
          ? "Impossible de joindre le service d'analyse. Vérifiez votre connexion et réessayez."
          : (error instanceof Error ? error.message : "Une erreur est survenue lors de l'analyse"),
        variant: "destructive",
        action: (
          <button
            onClick={() => runAIAnalysis()}
            className="px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Réessayer
          </button>
        ),
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editedData.id) {
        // Prepare and validate data - Apply normalization to Arabic fields during save
        const updateData = {
          title: editedData.title?.trim() || '',
          title_ar: editedData.title_ar?.trim() ? normalizeArabicForDisplay(editedData.title_ar.trim()) : null,
          subtitle: editedData.subtitle?.trim() || null,
          subtitle_ar: editedData.subtitle_ar?.trim() ? normalizeArabicForDisplay(editedData.subtitle_ar.trim()) : null,
          summary: editedData.summary?.trim() || null,
          summary_ar: editedData.summary_ar?.trim() ? normalizeArabicForDisplay(editedData.summary_ar.trim()) : null,
          content: editedData.language === 'ar' && editedData.content ? normalizeArabicText(editedData.content) : editedData.content || '',
          translated_content: translatedContent?.trim() || null,
          keywords: Array.isArray(editedData.keywords) ? editedData.keywords.filter(k => k && k.trim()) : [],
          keywords_ar: Array.isArray(editedData.keywords_ar) ? editedData.keywords_ar.filter(k => k && k.trim()).map(k => normalizeArabicForDisplay(k)) : [],
          document_type_id: editedData.document_type_id || null,
          language: editedData.language || 'fr',
          status: 'draft' // Save as draft
          // Note: updated_at is handled automatically by database trigger
        };

        console.log('Attempting to save document with data:', updateData);

        // Update existing document - Apply normalization to all Arabic metadata fields
        const fullUpdateData = {
          ...updateData,
          author: editedData.author?.trim() || null,
          author_ar: editedData.author_ar?.trim() ? normalizeArabicForDisplay(editedData.author_ar.trim()) : null,
          court: editedData.court?.trim() || null,
          court_ar: editedData.court_ar?.trim() ? normalizeArabicForDisplay(editedData.court_ar.trim()) : null,
          court_category_type: editedData.court_category_type?.trim() || null,
          court_category_type_ar: editedData.court_category_type_ar?.trim() ? normalizeArabicForDisplay(editedData.court_category_type_ar.trim()) : null,
          court_level: editedData.court_level?.trim() || null,
          court_level_ar: editedData.court_level_ar?.trim() ? normalizeArabicForDisplay(editedData.court_level_ar.trim()) : null,
          case_number: editedData.case_number?.trim() || null,
          year: editedData.year || null,
          plaintiff: editedData.plaintiff?.trim() || null,
          plaintiff_ar: editedData.plaintiff_ar?.trim() ? normalizeArabicForDisplay(editedData.plaintiff_ar.trim()) : null,
          defendant: editedData.defendant?.trim() || null,
          defendant_ar: editedData.defendant_ar?.trim() ? normalizeArabicForDisplay(editedData.defendant_ar.trim()) : null,
          textual_metadata: editedData.language === 'ar' && editedData.textual_metadata ? normalizeArabicForDisplay(editedData.textual_metadata) : editedData.textual_metadata || null,
        };

        const { error } = await supabase
          .from('documents')
          .update({
            ...fullUpdateData,
            category_id: selectedCategoryIds[0] || null // Set primary category for backward compatibility
          })
          .eq('id', editedData.id);

        if (error) {
          console.error('Supabase update error:', error);
          throw error;
        }

        console.log('Document successfully updated in database');
        
        // Update document categories
        if (editedData.id) {
          await updateDocumentCategories.mutateAsync({
            documentId: editedData.id,
            categoryIds: selectedCategoryIds
          });
        }
      }

      onSave(editedData);
      toast({
        title: "Document sauvegardé",
        description: "Le document a été sauvegardé en tant que brouillon",
      });
      
      // Navigate to content section after a short delay
      setTimeout(() => {
        window.location.href = '/admin/observatoire/contenus';
      }, 1500);
    } catch (error) {
      console.error('Save error details:', error);
      toast({
        title: "Erreur de sauvegarde",
        description: `Impossible de sauvegarder le document: ${error.message || error.toString()}`,
        variant: "destructive",
      });
    }
  };

  const handlePublish = async () => {
    try {
      if (!editedData.id) {
        toast({
          title: "Erreur",
          description: "Impossible de publier un document sans ID.",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('documents')
        .update({ 
          status: 'processed',
          updated_at: new Date().toISOString()
        })
        .eq('id', editedData.id);

      if (error) throw error;

      // Generate embeddings for AI search
      try {
        console.log('Generating embeddings for published document:', editedData.id);
        const { error: embeddingError } = await supabase.functions.invoke('generate-document-embeddings', {
          body: { documentId: editedData.id }
        });
        
        if (embeddingError) {
          console.error('Embedding generation error:', embeddingError);
        } else {
          console.log('Embeddings generated successfully');
        }
      } catch (embError) {
        console.error('Embedding generation failed:', embError);
        // Don't block publication if embedding fails
      }

      toast({
        title: "Document publié",
        description: "Le document a été publié et indexé pour la recherche IA.",
      });

      navigate('/admin/observatoire/validation');
    } catch (error) {
      console.error('Publish error:', error);
      toast({
        title: "Erreur de publication",
        description: "Impossible de publier le document.",
        variant: "destructive"
      });
    }
  };

  const handleReturnForModification = async () => {
    try {
      if (!editedData.id) {
        toast({
          title: "Erreur",
          description: "Impossible de retourner un document sans ID.",
          variant: "destructive"
        });
        return;
      }

      const updateData: any = { 
        status: 'draft',
        updated_at: new Date().toISOString()
      };

      // Add remarks if provided
      if (validationRemarks.trim()) {
        updateData.validation_remarks = validationRemarks.trim();
      }

      const { error } = await supabase
        .from('documents') 
        .update(updateData)
        .eq('id', editedData.id);

      if (error) throw error;

      toast({
        title: "Document retourné",
        description: "Le document a été retourné pour modification.",
      });

      navigate('/admin/observatoire/validation');
    } catch (error) {
      console.error('Return error:', error);
      toast({
        title: "Erreur", 
        description: "Impossible de retourner le document.",
        variant: "destructive"
      });
    }
  };

  const handleReprocessDocument = async () => {
    if (!editedData.id) {
      toast({
        title: "Erreur",
        description: "Impossible de retraiter un document sans ID.",
        variant: "destructive"
      });
      return;
    }

    setIsReprocessing(true);
    
    try {
      console.log('Reprocessing document:', editedData.id);
      
      const { data, error } = await supabase.functions.invoke('reprocess-document', {
        body: { documentId: editedData.id }
      });

      if (error) {
        throw error;
      }

      console.log('Reprocess result:', data);

      // Update the edited data with the new separation  
      const { data: updatedDoc, error: fetchError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', editedData.id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      if (updatedDoc) {
        setEditedData(prev => ({
          ...prev,
          textual_metadata: (updatedDoc as any).textual_metadata,
          content: updatedDoc.content
        }));
        
        toast({
          title: "Retraitement terminé",
          description: data.separated 
            ? `Document retraité avec succès. Métadonnées: ${data.textualMetadataLength} caractères, Contenu: ${data.contentLength} caractères.`
            : "Document retraité, aucune séparation trouvée.",
          variant: "default"
        });
      }

    } catch (error: any) {
      console.error('Reprocess error:', error);
      toast({
        title: "Erreur de retraitement", 
        description: error.message || "Impossible de retraiter le document.",
        variant: "destructive"
      });
    } finally {
      setIsReprocessing(false);
    }
  };

  const addKeyword = (language: 'fr' | 'ar' = 'fr') => {
    let keyword = language === 'fr' ? newKeyword.trim() : newKeywordAr.trim();
    const field = language === 'fr' ? 'keywords' : 'keywords_ar';
    
    // Apply normalization for Arabic keywords
    if (language === 'ar' && keyword) {
      keyword = normalizeArabicForDisplay(handleArabicInput(keyword));
    }
    
    // Check for duplicates (case-insensitive, space-normalized)
    const existing = editedData[field] || [];
    const isDuplicate = existing.some(k => 
      k.toLowerCase().trim().replace(/\s+/g, ' ') === keyword.toLowerCase().trim().replace(/\s+/g, ' ')
    );
    
    if (keyword && !isDuplicate) {
      setEditedData(prev => ({
        ...prev,
        [field]: [...(prev[field] || []), keyword]
      }));
      
      if (language === 'fr') {
        setNewKeyword('');
      } else {
        setNewKeywordAr('');
      }
      setHasChanges(true);
    }
  };
  
  const fixArabicKeywords = () => {
    setEditedData(prev => ({
      ...prev,
      keywords_ar: (prev.keywords_ar || [])
        .map(k => normalizeArabicForDisplay(k))
        .map(k => k.replace(/\s+/g, ' ').trim())
        .filter(Boolean)
        .filter((k, i, arr) => {
          const normalized = k.toLowerCase().trim().replace(/\s+/g, ' ');
          return arr.findIndex(x => x.toLowerCase().trim().replace(/\s+/g, ' ') === normalized) === i;
        })
    }));
    setHasChanges(true);
    toast({
      title: "Mots-clés corrigés",
      description: "Les mots-clés arabes ont été normalisés et les doublons supprimés",
    });
  };

  const removeKeyword = (keyword: string, language: 'fr' | 'ar' = 'fr') => {
    const field = language === 'fr' ? 'keywords' : 'keywords_ar';
    setEditedData(prev => ({
      ...prev,
      [field]: prev[field]?.filter(k => k !== keyword) || []
    }));
    setHasChanges(true);
  };

  const switchPrimaryLanguage = async (newPrimaryLanguage: string) => {
    if (newPrimaryLanguage === editedData.language) return;
    
    const oldLanguage = editedData.language;
    
    // Update primary language
    setEditedData(prev => ({
      ...prev,
      language: newPrimaryLanguage
    }));
    
    // Switch to the new primary language tab
    setCurrentLanguage(newPrimaryLanguage as 'fr' | 'ar');
    setHasChanges(true);
    
    toast({
      title: "Langue principale changée",
      description: `${getLanguageLabel(newPrimaryLanguage)} est maintenant la langue principale`,
    });
  };

  const getLanguageLabel = (lang: string) => {
    const labels = {
      'ar': 'العربية',
      'fr': 'Français',
      'en': 'English'
    };
    return labels[lang as keyof typeof labels] || lang;
  };

  // Get content to display based on current language
  const getCurrentContent = () => {
    const isPrimaryArabic = editedData.language === 'ar';
    
    if (currentLanguage === editedData.language) {
      // Show original content in primary language
      return editedData.fullContent || editedData.content;
    } else {
      // Show translated content in secondary language
      return translatedContent || editedData.fullContent || editedData.content;
    }
  };


  const getStorageUrl = (path: string) => {
    if (!path) return '';
    // If it's already a full URL, return as-is
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    const { data } = supabase.storage.from('documents').getPublicUrl(path);
    return data.publicUrl;
  };

  const cleanArabicDocument = async () => {
    if (!editedData.id) {
      toast({
        title: "Erreur",
        description: "Document non sauvegardé",
        variant: "destructive"
      });
      return;
    }

    setIsCleaningArabic(true);
    try {
      // Normalize all Arabic fields - use display normalization for short fields, full for content
      const cleaned = {
        ...editedData,
        title_ar: editedData.title_ar ? normalizeArabicForDisplay(editedData.title_ar) : editedData.title_ar,
        subtitle_ar: editedData.subtitle_ar ? normalizeArabicForDisplay(editedData.subtitle_ar) : editedData.subtitle_ar,
        content: editedData.language === 'ar' && editedData.content ? normalizeArabicText(editedData.content) : editedData.content,
        textual_metadata: editedData.language === 'ar' && editedData.textual_metadata ? normalizeArabicForDisplay(editedData.textual_metadata) : editedData.textual_metadata,
        summary_ar: editedData.summary_ar ? normalizeArabicForDisplay(editedData.summary_ar) : editedData.summary_ar,
        keywords_ar: editedData.keywords_ar?.map(k => normalizeArabicForDisplay(k)),
        author_ar: editedData.author_ar ? normalizeArabicForDisplay(editedData.author_ar) : editedData.author_ar,
        court_ar: editedData.court_ar ? normalizeArabicForDisplay(editedData.court_ar) : editedData.court_ar,
        plaintiff_ar: editedData.plaintiff_ar ? normalizeArabicForDisplay(editedData.plaintiff_ar) : editedData.plaintiff_ar,
        defendant_ar: editedData.defendant_ar ? normalizeArabicForDisplay(editedData.defendant_ar) : editedData.defendant_ar,
        court_level_ar: editedData.court_level_ar ? normalizeArabicForDisplay(editedData.court_level_ar) : editedData.court_level_ar,
        court_category_type_ar: editedData.court_category_type_ar ? normalizeArabicForDisplay(editedData.court_category_type_ar) : editedData.court_category_type_ar,
      };

      // Save to database
      const { error } = await supabase
        .from('documents')
        .update({
          title_ar: cleaned.title_ar,
          subtitle_ar: cleaned.subtitle_ar,
          content: cleaned.content,
          textual_metadata: cleaned.textual_metadata,
          summary_ar: cleaned.summary_ar,
          keywords_ar: cleaned.keywords_ar,
          author_ar: cleaned.author_ar,
          court_ar: cleaned.court_ar,
          plaintiff_ar: cleaned.plaintiff_ar,
          defendant_ar: cleaned.defendant_ar,
          court_level_ar: cleaned.court_level_ar,
          court_category_type_ar: cleaned.court_category_type_ar,
        })
        .eq('id', editedData.id);

      if (error) throw error;

      setEditedData(cleaned);
      setHasChanges(false);
      
      toast({
        title: "Nettoyage réussi",
        description: "Tous les champs arabes ont été normalisés",
        variant: "default"
      });
    } catch (error: any) {
      console.error('Arabic cleanup error:', error);
      toast({
        title: "Erreur de nettoyage",
        description: error.message || "Impossible de nettoyer les champs arabes",
        variant: "destructive"
      });
    } finally {
      setIsCleaningArabic(false);
    }
  };

  const correctArabicSpacing = async () => {
    if (!editedData.content || editedData.language !== 'ar') {
      toast({
        title: "Erreur",
        description: "Le document doit être en arabe et avoir du contenu",
        variant: "destructive"
      });
      return;
    }

    if (editedData.content.length > 12000) {
      toast({
        title: "Texte trop long",
        description: "La correction IA est limitée à 12 000 caractères. Utilisez 'Nettoyer AR' pour les heuristiques seulement.",
        variant: "destructive"
      });
      return;
    }

    setIsCorrectingSpacing(true);
    try {
      console.log('Calling AI spacing correction for content...');
      
      const { data, error } = await supabase.functions.invoke('arabic-spacing-fixer', {
        body: { text: editedData.content }
      });

      if (error) throw error;

      if (data?.success && data.correctedText) {
        setEditedData(prev => ({
          ...prev,
          content: data.correctedText
        }));
        
        toast({
          title: "Correction réussie",
          description: `Espacement corrigé (méthode: ${data.method || 'AI'})`,
          variant: "default"
        });
      } else {
        throw new Error('Pas de texte corrigé retourné');
      }
    } catch (error: any) {
      console.error('Arabic spacing correction error:', error);
      toast({
        title: "Erreur de correction",
        description: error.message || "Impossible de corriger l'espacement",
        variant: "destructive"
      });
    } finally {
      setIsCorrectingSpacing(false);
    }
  };

  return (
    <div className="space-y-6" dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {isFromValidation ? 'Validation de Document' : 'Éditeur de Document'}
          </h2>
          <div className="flex items-center space-x-4 mt-2">
            <p className="text-sm text-muted-foreground">
              Source: {editedData.originalFileName}
            </p>
            <Badge variant="outline">
              {getLanguageLabel(editedData.language)}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {editedData.page_contents && editedData.page_contents.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setCurrentView(currentView === 'pages' ? 'editor' : 'pages')}
            >
              {currentView === 'pages' ? (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Éditeur
                </>
              ) : (
                <>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Pages ({editedData.processed_pages}/{editedData.total_pages})
                </>
              )}
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={() => setCurrentView(currentView === 'pdf' ? 'editor' : 'pdf')}
            disabled={!editedData.file_url}
          >
            {currentView === 'pdf' ? (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Éditeur
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                PDF
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Édition
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Aperçu
              </>
            )}
          </Button>
          
          
          <Button 
            onClick={runAIAnalysis} 
            disabled={isAnalyzing || !editedData.content}
            variant="secondary"
          >
            {isAnalyzing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Brain className="mr-2 h-4 w-4" />
            )}
            {isAnalyzing ? 'Analyse...' : '🤖 Analyse IA'}
          </Button>

          <Button
            variant="secondary"
            onClick={runFullTranslation}
            disabled={isAnalyzing || !editedData.content || editedData.content.length < 1000 || fullTranslationJob.status === 'processing'}
            className="relative"
          >
            {fullTranslationJob.status === 'processing' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Traduction {fullTranslationJob.progress}%
              </>
            ) : (
              <>
                🌍 Traduction intégrale
                {editedData.content && editedData.content.length >= 1000 && (
                  <Badge variant="secondary" className="ml-2">
                    {Math.ceil(editedData.content.length / 5000)} pages
                  </Badge>
                )}
              </>
            )}
          </Button>

          
          {isFromValidation ? (
            <div className="flex space-x-2">
              <Button onClick={handlePublish} variant="default">
                <CheckCircle className="mr-2 h-4 w-4" />
                Publier
              </Button>
              <Button onClick={handleReturnForModification} variant="destructive">
                <XCircle className="mr-2 h-4 w-4" />
                Retourner pour modification
              </Button>
            </div>
          ) : (
            <Button onClick={handleSave} disabled={!hasChanges}>
              <Save className="mr-2 h-4 w-4" />
              Sauvegarder
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      {currentView === 'pdf' && editedData.file_url ? (
        <PDFViewer 
          fileUrl={getStorageUrl(editedData.file_url)} 
          title={editedData.title}
        />
      ) : currentView === 'pages' && editedData.page_contents ? (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              Contenu par page ({editedData.processed_pages}/{editedData.total_pages} pages traitées)
              {editedData.page_contents.filter(p => p.translation_status === 'completed').length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {editedData.page_contents.filter(p => p.translation_status === 'completed').length}/{editedData.page_contents.length} traduites
                </Badge>
              )}
              {translatedContent && editedData.page_contents.filter(p => p.translation_status === 'completed').length > 0 && (
                <Badge variant="default" className="ml-2 bg-green-500">
                  ✅ Consolidée
                </Badge>
              )}
            </h3>
            <div className="flex items-center space-x-2">
              {editedData.page_contents.filter(p => p.translation_status === 'completed').length > 0 && (
                <Button
                  onClick={consolidatePageTranslations}
                  variant="secondary"
                  size="sm"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Consolider ({editedData.page_contents.filter(p => p.translation_status === 'completed').length}/{editedData.page_contents.length})
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm px-3 py-1 bg-muted rounded">
                Page {currentPage} / {editedData.page_contents.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(editedData.page_contents.length, currentPage + 1))}
                disabled={currentPage >= editedData.page_contents.length}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {editedData.page_contents.find(p => p.pageNumber === currentPage) && (() => {
            const currentPageData = editedData.page_contents.find(p => p.pageNumber === currentPage)!;
            const targetLang = editedData.language === 'fr' ? 'ar' : 'fr';
            const isTranslating = translatingPages.has(currentPage);
            const hasTranslation = currentPageData.translated_content;
            const translationStatus = currentPageData.translation_status;
            
            return (
              <div className="space-y-4">
                {/* Side-by-side view */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Original content */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">
                        {editedData.language === 'fr' ? 'Français (Original)' : 'العربية (الأصل)'}
                      </Label>
                      {currentPageData.confidence && (
                        <Badge variant="outline" className="text-xs">
                          Confiance: {Math.round(currentPageData.confidence * 100)}%
                        </Badge>
                      )}
                    </div>
                    <div 
                      className="prose prose-sm max-w-none p-4 border rounded bg-muted/30 min-h-[400px] max-h-[600px] overflow-y-auto"
                      dir={editedData.language === 'ar' ? 'rtl' : 'ltr'}
                    >
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {currentPageData.content || 'Contenu non disponible'}
                      </div>
                    </div>
                  </div>

                  {/* Translated content */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">
                        {targetLang === 'ar' ? 'العربية (ترجمة)' : 'Français (Traduction)'}
                      </Label>
                      <div className="flex items-center gap-2">
                        {translationStatus === 'completed' && (
                          <Badge variant="default" className="text-xs bg-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Traduit
                          </Badge>
                        )}
                        {translationStatus === 'error' && (
                          <Badge variant="destructive" className="text-xs">
                            <XCircle className="h-3 w-3 mr-1" />
                            Erreur
                          </Badge>
                        )}
                        {isTranslating && (
                          <Badge variant="secondary" className="text-xs">
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Traduction...
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div 
                      className="prose prose-sm max-w-none p-4 border rounded min-h-[400px] max-h-[600px] overflow-y-auto relative"
                      dir={targetLang === 'ar' ? 'rtl' : 'ltr'}
                      style={{ backgroundColor: hasTranslation ? 'hsl(var(--muted) / 0.3)' : 'hsl(var(--muted) / 0.1)' }}
                    >
                      {isTranslating ? (
                        <div className="flex items-center justify-center h-[400px]">
                          <div className="text-center space-y-2">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                            <p className="text-sm text-muted-foreground">Traduction en cours...</p>
                          </div>
                        </div>
                      ) : hasTranslation ? (
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {currentPageData.translated_content}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-[400px]">
                          <div className="text-center space-y-4">
                            <p className="text-sm text-muted-foreground">Cette page n'a pas encore été traduite</p>
                            <Button
                              onClick={() => translatePage(currentPage)}
                              disabled={isTranslating}
                              size="sm"
                            >
                              <Brain className="h-4 w-4 mr-2" />
                              Traduire cette page
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {/* Retranslate button if already translated */}
                      {hasTranslation && !isTranslating && (
                        <div className="absolute top-2 right-2">
                          <Button
                            onClick={() => translatePage(currentPage)}
                            variant="outline"
                            size="sm"
                          >
                            <Brain className="h-3 w-3 mr-1" />
                            Retraduire
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
          
          {/* Pages overview */}
          <div className="mt-6">
            <h4 className="text-sm font-semibold mb-3">Aperçu des pages</h4>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {editedData.page_contents.map((page) => {
                const isTranslated = page.translation_status === 'completed';
                const isTranslating = translatingPages.has(page.pageNumber);
                const hasError = page.translation_status === 'error';
                
                return (
                  <Button
                    key={page.pageNumber}
                    variant={currentPage === page.pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page.pageNumber)}
                    className="h-8 w-12 text-xs relative"
                  >
                    {page.pageNumber}
                    {isTranslated && (
                      <CheckCircle className="h-3 w-3 absolute -top-1 -right-1 text-green-500 bg-background rounded-full" />
                    )}
                    {isTranslating && (
                      <Loader2 className="h-3 w-3 absolute -top-1 -right-1 text-primary bg-background rounded-full animate-spin" />
                    )}
                    {hasError && (
                      <XCircle className="h-3 w-3 absolute -top-1 -right-1 text-destructive bg-background rounded-full" />
                    )}
                  </Button>
                );
              })}
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Metadata Column */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Métadonnées</h3>
              
              {/* Validation Remarks - Only show when coming from validation */}
              {isFromValidation && (
                <div className="mb-6 p-4 border rounded-lg bg-muted/50">
                  <Label className="text-sm font-medium mb-2 block">
                    Remarques de validation (optionnel)
                  </Label>
                  <Textarea
                    value={validationRemarks}
                    onChange={(e) => setValidationRemarks(e.target.value)}
                    placeholder="Ajoutez des remarques pour expliquer la décision de validation..."
                    className="min-h-[100px]"
                  />
                </div>
              )}
              
              <div className="space-y-4">
                <Tabs value={currentLanguage} onValueChange={(value) => setCurrentLanguage(value as 'fr' | 'ar')}>
                  <TabsList className="grid w-full grid-cols-2">
                    {editedData.language === 'ar' ? (
                      <>
                        <TabsTrigger value="ar" className="font-bold">
                          العربية (أساسي)
                        </TabsTrigger>
                        <TabsTrigger value="fr">
                          Français (ترجمة)
                        </TabsTrigger>
                      </>
                    ) : (
                      <>
                        <TabsTrigger value="fr" className="font-bold">
                          Français (Principal)
                        </TabsTrigger>
                        <TabsTrigger value="ar">
                          العربية (traduction)
                        </TabsTrigger>
                      </>
                    )}
                  </TabsList>
                  
                  <TabsContent value="fr" className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">
                        Titre
                        {editedData.language === 'fr' && <span className="text-red-500 ml-1">*</span>}
                        {editedData.language !== 'fr' && <span className="text-xs text-muted-foreground ml-2">(traduction)</span>}
                      </Label>
                      <Input
                        value={editedData.title || ''}
                        onChange={(e) => setEditedData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Titre du document"
                        className="mt-1"
                        required={editedData.language === 'fr'}
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium">
                        Sous-titre
                        {editedData.language !== 'fr' && <span className="text-xs text-muted-foreground ml-2">(traduction)</span>}
                      </Label>
                      <Input
                        value={editedData.subtitle || ''}
                        onChange={(e) => setEditedData(prev => ({ ...prev, subtitle: e.target.value }))}
                        placeholder="Sous-titre du document (optionnel)"
                        className="mt-1"
                      />
                    </div>

                     <div>
                       <MultiCategorySelector
                         categories={categories}
                         selectedCategoryIds={selectedCategoryIds}
                         onCategoryIdsChange={setSelectedCategoryIds}
                         showArabic={currentLanguage === 'ar'}
                         maxCategories={5}
                       />
                     </div>

                    <div>
                      <Label className="text-sm font-medium">Type de document</Label>
                      <Select
                        value={editedData.document_type_id || ''}
                        onValueChange={(value) => setEditedData(prev => ({
                          ...prev,
                          document_type_id: value
                        }))}
                      >
                        <SelectTrigger className="mt-1 bg-background">
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border shadow-lg z-50">
                          {documentTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Informations Juridiques - Français */}
                    <div className="mt-4 pt-4 border-t border-border">
                      <h5 className="text-sm font-semibold mb-3 text-muted-foreground">Informations Juridiques</h5>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs font-medium">Auteur</Label>
                          <Input
                            value={editedData.author || ''}
                            onChange={(e) => setEditedData(prev => ({ ...prev, author: e.target.value }))}
                            placeholder="Nom de l'auteur"
                            className="mt-1 h-8"
                          />
                        </div>

                        <div>
                          <Label className="text-xs font-medium">Catégorie de tribunal</Label>
                          <Select
                            value={editedData.court_category_type || ''}
                            onValueChange={(value) => {
                              setEditedData(prev => ({ ...prev, court_category_type: value }));
                              // Update Arabic equivalent
                              const courtType = courtTypes.find(ct => ct.name === value);
                              if (courtType?.name_ar) {
                                setEditedData(prev => ({ ...prev, court_category_type_ar: normalizeArabicForDisplay(courtType.name_ar) }));
                              }
                              setSelectedCourtType(value);
                            }}
                          >
                            <SelectTrigger className="mt-1 h-8 bg-background">
                              <SelectValue placeholder="Sélectionner une catégorie" />
                            </SelectTrigger>
                            <SelectContent className="bg-background border shadow-lg z-50">
                              {courtTypes.map((courtType) => (
                                <SelectItem key={courtType.id} value={courtType.name}>
                                  {courtType.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-xs font-medium">Niveau de juridiction</Label>
                          <Select
                            value={editedData.court_level || ''}
                            onValueChange={(value) => {
                              setEditedData(prev => ({ ...prev, court_level: value }));
                              // Update Arabic equivalent
                              const level = jurisdictionLevels.find(jl => jl.name === value);
                              if (level?.name_ar) {
                                setEditedData(prev => ({ ...prev, court_level_ar: level.name_ar }));
                              }
                            }}
                            disabled={!selectedCourtType}
                          >
                            <SelectTrigger className="mt-1 h-8 bg-background">
                              <SelectValue placeholder={selectedCourtType ? "Sélectionner un niveau" : "Choisir une catégorie d'abord"} />
                            </SelectTrigger>
                            <SelectContent className="bg-background border shadow-lg z-50">
                              {jurisdictionLevels.map((level) => (
                                <SelectItem key={level.id} value={level.name}>
                                  {level.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-xs font-medium">Nom du tribunal</Label>
                          <Input
                            value={editedData.court || ''}
                            onChange={(e) => setEditedData(prev => ({ ...prev, court: e.target.value }))}
                            placeholder="Nom du tribunal"
                            className="mt-1 h-8"
                          />
                        </div>

                        <div>
                          <Label className="text-xs font-medium">Numéro de l'affaire</Label>
                          <Input
                            value={editedData.case_number || ''}
                            onChange={(e) => setEditedData(prev => ({ ...prev, case_number: e.target.value }))}
                            placeholder="Numéro de l'affaire"
                            className="mt-1 h-8"
                          />
                        </div>

                        <div>
                          <Label className="text-xs font-medium">Année</Label>
                          <Input
                            type="number"
                            value={editedData.year?.toString() || ''}
                            onChange={(e) => setEditedData(prev => ({ ...prev, year: e.target.value ? parseInt(e.target.value) : undefined }))}
                            placeholder="2024"
                            className="mt-1 h-8"
                          />
                        </div>

                        <div>
                          <Label className="text-xs font-medium">Demandeur / Plaignant</Label>
                          <Input
                            value={editedData.plaintiff || ''}
                            onChange={(e) => setEditedData(prev => ({ ...prev, plaintiff: e.target.value }))}
                            placeholder="Nom du demandeur"
                            className="mt-1 h-8"
                          />
                        </div>

                        <div>
                          <Label className="text-xs font-medium">Défendeur</Label>
                          <Input
                            value={editedData.defendant || ''}
                            onChange={(e) => setEditedData(prev => ({ ...prev, defendant: e.target.value }))}
                            placeholder="Nom du défendeur"
                            className="mt-1 h-8"
                          />
                        </div>
                      </div>
                    </div>

                  </TabsContent>

                  <TabsContent value="ar" className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">
                        العنوان
                        {editedData.language === 'ar' && <span className="text-red-500 ml-1">*</span>}
                        {editedData.language !== 'ar' && <span className="text-xs text-muted-foreground ml-2">(ترجمة)</span>}
                      </Label>
                      <Input
                        value={editedData.title_ar || ''}
                        onChange={(e) => {
                          const cleaned = handleArabicInput(e.target.value);
                          setEditedData(prev => ({ ...prev, title_ar: cleaned }));
                        }}
                        placeholder="عنوان الوثيقة"
                        dir="rtl"
                        className="mt-1"
                        required={editedData.language === 'ar'}
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium">
                        العنوان الفرعي
                        {editedData.language !== 'ar' && <span className="text-xs text-muted-foreground ml-2">(ترجمة)</span>}
                      </Label>
                      <Input
                        value={editedData.subtitle_ar || ''}
                        onChange={(e) => {
                          const cleaned = handleArabicInput(e.target.value);
                          setEditedData(prev => ({ ...prev, subtitle_ar: cleaned }));
                        }}
                        placeholder="العنوان الفرعي للوثيقة (اختياري)"
                        dir="rtl"
                        className="mt-1"
                      />
                    </div>

                     <div>
                       <MultiCategorySelector
                         categories={categories}
                         selectedCategoryIds={selectedCategoryIds}
                         onCategoryIdsChange={setSelectedCategoryIds}
                         showArabic={currentLanguage === 'ar'}
                         maxCategories={5}
                       />
                     </div>

                    <div>
                      <Label className="text-sm font-medium">نوع الوثيقة</Label>
                      <Select
                        value={editedData.document_type_id || ''}
                        onValueChange={(value) => setEditedData(prev => ({
                          ...prev,
                          document_type_id: value
                        }))}
                      >
                        <SelectTrigger className="mt-1 bg-background" dir="rtl">
                          <SelectValue placeholder="اختر نوع" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border shadow-lg z-50">
                          {documentTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name_ar || type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Informations Juridiques - Arabe */}
                    <div className="mt-4 pt-4 border-t border-border">
                      <h5 className="text-sm font-semibold mb-3 text-muted-foreground" dir="rtl">المعلومات القانونية</h5>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs font-medium">المؤلف</Label>
                          <Input
                            value={editedData.author_ar || ''}
                            onChange={(e) => {
                              const cleaned = handleArabicInput(e.target.value);
                              setEditedData(prev => ({ ...prev, author_ar: cleaned }));
                            }}
                            placeholder="اسم المؤلف"
                            dir="rtl"
                            className="mt-1 h-8"
                          />
                        </div>

                        <div>
                          <Label className="text-xs font-medium">فئة المحكمة</Label>
                          <Select
                            value={editedData.court_category_type_ar || ''}
                            onValueChange={(value) => {
                              setEditedData(prev => ({ ...prev, court_category_type_ar: normalizeArabicForDisplay(value) }));
                              // Update French equivalent and selectedCourtType
                              const courtType = courtTypes.find(ct => ct.name_ar === value);
                              if (courtType) {
                                setEditedData(prev => ({ ...prev, court_category_type: courtType.name }));
                                setSelectedCourtType(courtType.name);
                              }
                            }}
                          >
                            <SelectTrigger className="mt-1 h-8 bg-background" dir="rtl">
                              <SelectValue placeholder="اختر فئة" />
                            </SelectTrigger>
                             <SelectContent className="bg-background border shadow-lg z-50">
                               {courtTypes.map((courtType) => (
                                 <SelectItem key={courtType.id} value={courtType.name_ar || courtType.name}>
                                   {courtType.name_ar || courtType.name}
                                 </SelectItem>
                               ))}
                             </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-xs font-medium">مستوى القضاء</Label>
                          <Select
                            value={editedData.court_level_ar || ''}
                            onValueChange={(value) => {
                              setEditedData(prev => ({ ...prev, court_level_ar: value }));
                              // Update French equivalent
                              const level = jurisdictionLevels.find(jl => jl.name_ar === value);
                              if (level) {
                                setEditedData(prev => ({ ...prev, court_level: level.name }));
                              }
                            }}
                            disabled={!selectedCourtType}
                          >
                            <SelectTrigger className="mt-1 h-8 bg-background" dir="rtl">
                              <SelectValue placeholder={selectedCourtType ? "اختر المستوى" : "اختر فئة أولاً"} />
                            </SelectTrigger>
                            <SelectContent className="bg-background border shadow-lg z-50">
                              {jurisdictionLevels.map((level) => (
                                <SelectItem key={level.id} value={level.name_ar || level.name}>
                                  {level.name_ar || level.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-xs font-medium">اسم المحكمة</Label>
                          <Input
                            value={editedData.court_ar || ''}
                            onChange={(e) => {
                              const cleaned = handleArabicInput(e.target.value);
                              setEditedData(prev => ({ ...prev, court_ar: cleaned }));
                            }}
                            placeholder="اسم المحكمة"
                            dir="rtl"
                            className="mt-1 h-8"
                          />
                        </div>

                        <div>
                          <Label className="text-xs font-medium">رقم القضية</Label>
                          <Input
                            value={editedData.case_number || ''}
                            onChange={(e) => setEditedData(prev => ({ ...prev, case_number: e.target.value }))}
                            placeholder="رقم القضية"
                            dir="rtl"
                            className="mt-1 h-8"
                          />
                        </div>

                        <div>
                          <Label className="text-xs font-medium">السنة</Label>
                          <Input
                            type="number"
                            value={editedData.year?.toString() || ''}
                            onChange={(e) => setEditedData(prev => ({ ...prev, year: e.target.value ? parseInt(e.target.value) : undefined }))}
                            placeholder="2024"
                            dir="rtl"
                            className="mt-1 h-8"
                          />
                        </div>

                        <div>
                          <Label className="text-xs font-medium">المدعي</Label>
                          <Input
                            value={editedData.plaintiff_ar || ''}
                            onChange={(e) => {
                              const cleaned = handleArabicInput(e.target.value);
                              setEditedData(prev => ({ ...prev, plaintiff_ar: cleaned }));
                            }}
                            placeholder="اسم المدعي"
                            dir="rtl"
                            className="mt-1 h-8"
                          />
                        </div>

                        <div>
                          <Label className="text-xs font-medium">المدعى عليه</Label>
                          <Input
                            value={editedData.defendant_ar || ''}
                            onChange={(e) => {
                              const cleaned = handleArabicInput(e.target.value);
                              setEditedData(prev => ({ ...prev, defendant_ar: cleaned }));
                            }}
                            placeholder="اسم المدعى عليه"
                            dir="rtl"
                            className="mt-1 h-8"
                          />
                        </div>
                      </div>
                    </div>

                  </TabsContent>
                </Tabs>

                <div>
                  <Label className="text-sm font-medium">Langue principale</Label>
                  <Select
                    value={editedData.language}
                    onValueChange={(value) => switchPrimaryLanguage(value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </div>

          {/* Content Column */}
          <div className="lg:col-span-2 space-y-6">
            {fullTranslationJob.status === 'processing' && (
              <Card className="border-blue-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                    Traduction intégrale en cours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
                      <span>{fullTranslationJob.currentStep}</span>
                      <span>{fullTranslationJob.progress}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-blue-500 h-full transition-all duration-300"
                        style={{ width: `${fullTranslationJob.progress}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Summary and Keywords Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <Card className="p-4 lg:col-span-7">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    {currentLanguage === 'ar' ? 'الملخص' : 'Résumé'}
                    {editedData.language === currentLanguage && <span className="text-red-500 ml-1">*</span>}
                    {editedData.language !== currentLanguage && (
                      <span className="text-xs text-muted-foreground ml-2">
                        {currentLanguage === 'ar' ? '(ترجمة)' : '(traduction)'}
                      </span>
                    )}
                    {currentLanguage === 'fr' && translatedByAI.fr && (
                      <span className="text-xs text-muted-foreground ml-2">(IA)</span>
                    )}
                    {currentLanguage === 'ar' && translatedByAI.ar && (
                      <span className="text-xs text-muted-foreground ml-2">(ذكاء اصطناعي)</span>
                    )}
                  </Label>
                   <Textarea
                    value={currentLanguage === 'ar' ? (editedData.summary_ar || '') : (editedData.summary || '')}
                    onChange={(e) => {
                      const value = currentLanguage === 'ar' ? handleArabicInput(e.target.value) : e.target.value;
                      setEditedData(prev => ({
                        ...prev,
                        [currentLanguage === 'ar' ? 'summary_ar' : 'summary']: value
                      }));
                    }}
                    placeholder={currentLanguage === 'ar' ? 'ملخص الوثيقة' : 'Résumé du document'}
                    rows={4}
                    dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
                    className="resize-none w-full leading-relaxed"
                    required={editedData.language === currentLanguage}
                  />
                </div>
              </Card>

              <Card className="p-4 lg:col-span-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      {currentLanguage === 'ar' ? 'الكلمات المفاتيح' : 'Mots-clés'}
                    </Label>
                    {currentLanguage === 'ar' && (
                      <Button
                        type="button"
                        onClick={fixArabicKeywords}
                        size="sm"
                        variant="outline"
                        className="text-xs h-7"
                      >
                        Corriger
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={currentLanguage === 'ar' ? newKeywordAr : newKeyword}
                      onChange={(e) => {
                        const value = currentLanguage === 'ar' ? handleArabicInput(e.target.value) : e.target.value;
                        currentLanguage === 'ar' ? setNewKeywordAr(value) : setNewKeyword(value);
                      }}
                      placeholder={currentLanguage === 'ar' ? 'إضافة كلمة مفتاحية' : 'Ajouter un mot-clé'}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addKeyword(currentLanguage as 'fr' | 'ar');
                        }
                      }}
                      dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
                    />
                    <Button 
                      type="button" 
                      onClick={() => addKeyword(currentLanguage as 'fr' | 'ar')} 
                      size="sm"
                      variant="secondary"
                    >
                      {currentLanguage === 'ar' ? 'إضافة' : 'Ajouter'}
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                    {(currentLanguage === 'ar' ? editedData.keywords_ar : editedData.keywords)?.map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {normalizeArabicForDisplay(keyword)}
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors"
                          onClick={() => removeKeyword(keyword, currentLanguage as 'fr' | 'ar')}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
              
              {/* Textual Metadata section */}
              <Card className="p-4 lg:col-span-full">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {currentLanguage === 'ar' ? 'المعطيات النصية' : 'Métadonnées textuelles'}
                    </Label>
                    {isReprocessing && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {currentLanguage === 'ar' ? 'جاري الاستخراج...' : 'Extraction automatique...'}
                      </div>
                    )}
                  </div>
                    <Textarea
                      value={currentLanguage === editedData.language ? (editedData.textual_metadata || '') : (translatedTextualMetadata || '')}
                      onChange={(e) => {
                        if (currentLanguage === editedData.language) {
                          const value = currentLanguage === 'ar' ? handleArabicInput(e.target.value) : e.target.value;
                          setEditedData(prev => ({
                            ...prev,
                            textual_metadata: value
                          }));
                        }
                      }}
                      placeholder={
                        currentLanguage === editedData.language
                          ? (
                              editedData.textual_metadata
                                ? (currentLanguage === 'ar' ? 'معطيات نصية إضافية...' : 'Métadonnées textuelles extraites du document...')
                                : (currentLanguage === 'ar'
                                    ? 'لا توجد معطيات نصية مستخرجة. جاري المعالجة التلقائية...'
                                    : 'Aucune métadonnée extraite. Traitement automatique en cours...'
                                  )
                            )
                          : (
                              translatedTextualMetadata
                                ? (currentLanguage === 'ar' ? 'ترجمة المعطيات النصية' : 'Traduction des métadonnées textuelles')
                                : (currentLanguage === 'ar' ? 'لا توجد ترجمة بعد. شغّل التحليل بالذكاء الاصطناعي...' : 'Pas encore de traduction. Lancez l’analyse IA...')
                            )
                      }
                      className={`min-h-[100px] text-sm resize-vertical ${
                        (currentLanguage === editedData.language ? editedData.textual_metadata : translatedTextualMetadata)
                          ? 'bg-background border-input'
                          : 'bg-muted/30 border-muted-foreground/30 text-muted-foreground'
                      }`}
                      dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
                      readOnly={currentLanguage !== editedData.language}
                    />
                   <div className="flex items-center justify-between text-xs">
                     <span className="text-muted-foreground">
                       {currentLanguage !== editedData.language
                         ? (currentLanguage === 'ar' 
                             ? 'الترجمة الآلية للمعطيات النصية - للقراءة فقط'
                             : 'Traduction automatique des métadonnées textuelles - lecture seule'
                           )
                         : (currentLanguage === 'ar' 
                             ? 'يفصل النظام تلقائياً بين المعطيات النصية والمحتوى عند كلمة "المشكل" أو مرادفاتها'
                             : 'Le système sépare automatiquement les métadonnées du contenu au mot "المشكل" ou ses variantes'
                           )
                       }
                     </span>
                     <span className={`font-medium ${(currentLanguage === editedData.language ? editedData.textual_metadata : translatedTextualMetadata) ? 'text-primary' : 'text-muted-foreground'}`}>
                       {(currentLanguage === editedData.language ? editedData.textual_metadata : translatedTextualMetadata)
                         ? `${(currentLanguage === editedData.language ? editedData.textual_metadata!.length : translatedTextualMetadata.length)} caractères`
                         : (currentLanguage !== editedData.language ? 'Non disponible' : 'Non extraites')
                       }
                     </span>
                   </div>
                </div>
              </Card>
              
            </div>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Contenu du document</h3>
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? (
                    <>
                      <EyeOff className="mr-2 h-4 w-4" />
                      Édition
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      Aperçu
                    </>
                  )}
                </Button>
              </div>
              
              {showPreview ? (
                <div 
                  className="prose prose-sm max-w-none p-4 border rounded bg-muted/30 max-h-[600px] overflow-y-auto"
                  dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
                >
                  <h4 className="font-semibold text-base mb-2" dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}>
                    {currentLanguage === 'ar' && editedData.title_ar ? editedData.title_ar : editedData.title}
                  </h4>
                  {(currentLanguage === 'ar' && editedData.subtitle_ar) || (currentLanguage !== 'ar' && editedData.subtitle) ? (
                    <h5 className="font-medium text-sm text-muted-foreground mb-3" dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}>
                      {currentLanguage === 'ar' ? editedData.subtitle_ar : editedData.subtitle}
                    </h5>
                  ) : null}
                  <div 
                    className="prose prose-sm max-w-none text-sm leading-relaxed [&>h1]:text-xl [&>h1]:font-bold [&>h1]:mb-3 [&>h2]:text-lg [&>h2]:font-semibold [&>h2]:mb-2 [&>h3]:text-base [&>h3]:font-medium [&>h3]:mb-2 [&>p]:mb-2 [&>br]:block [&>br]:content-[''] [&>br]:mt-2" 
                    dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
                    dangerouslySetInnerHTML={{ __html: renderFormattedContent(getCurrentContent()) }}
                  />
                </div>
              ) : (
                <SimpleTextEditor
                  content={getCurrentContent()}
                  onChange={(newContent) => {
                    if (currentLanguage === editedData.language) {
                      // Editing primary language content - apply Arabic correction if needed
                      const processedContent = currentLanguage === 'ar' ? handleArabicInput(newContent) : newContent;
                      setEditedData(prev => ({
                        ...prev,
                        content: processedContent,
                        fullContent: processedContent
                      }));
                    } else {
                      // Editing translated content
                      const processedContent = currentLanguage === 'ar' ? handleArabicInput(newContent) : newContent;
                      setTranslatedContent(processedContent);
                      setHasChanges(true);
                    }
                  }}
                  placeholder={currentLanguage === editedData.language ? 
                    "Contenu du document... Utilisez # pour les titres, **gras**, *italique*" : 
                    "Contenu traduit... Utilisez # pour les titres, **gras**, *italique*"
                  }
                  className="min-h-[600px]"
                  dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
                />
              )}
            </Card>

            {editedData.translated_content && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Traduction complète automatique
                  </h3>
                  <Badge variant="secondary">Auto-traduit</Badge>
                </div>
                <div className="prose max-w-none">
                  <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap max-h-[600px] overflow-y-auto">
                    {editedData.translated_content}
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Status */}
      {hasChanges && (
        <Card className="p-3 bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <p className="text-sm text-orange-800 dark:text-orange-200">
              Vous avez des modifications non sauvegardées
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DocumentEditor;
