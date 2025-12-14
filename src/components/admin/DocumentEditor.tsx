import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CKEditorWrapper from './CKEditorWrapper';
import CKEditorMini from './CKEditorMini';
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
import { sanitizeArabicTextFrontend, normalizeArabicForDisplay, handleArabicInput } from '@/lib/arabicUtils';
import { useTranslation } from '@/hooks/useTranslation';
import ProgressTracker from './ProgressTracker';
import { WorkflowTimeline } from './WorkflowTimeline';

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
  // Jurisprudence fields
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
  // Analysis fields
  validation_date?: string;
  legal_references?: string[];
  legal_references_ar?: string[];
  bibliography?: string;
  bibliography_ar?: string;
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
  const { t } = useTranslation();
  
  const [editedData, setEditedData] = useState<DocumentData>(documentData);
  const [showPreview, setShowPreview] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const documentTypesRef = useRef<DocumentType[]>([]);
  const [selectedCourtType, setSelectedCourtType] = useState<string>('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [newReference, setNewReference] = useState('');
  const [newReferenceAr, setNewReferenceAr] = useState('');
  
  // Synchronize ref with state to avoid stale closure
  useEffect(() => {
    documentTypesRef.current = documentTypes;
  }, [documentTypes]);
  
  // Detect if document is "Analyses juridiques"
  const isAnalysisDocument = React.useMemo(() => {
    if (!editedData.document_type_id || documentTypes.length === 0) return false;
    const docType = documentTypes.find(dt => dt.id === editedData.document_type_id);
    return docType?.name === 'Analyses juridiques' || 
           docType?.name_ar === 'التحليلات القانونية';
  }, [editedData.document_type_id, documentTypes]);
  
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
  const [correctionProgress, setCorrectionProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [translatingPages, setTranslatingPages] = useState<Set<number>>(new Set());
  const [workflowStep, setWorkflowStep] = useState<string | null>(null);
  const [completedWorkflowSteps, setCompletedWorkflowSteps] = useState<string[]>([]);
  const hasShownSpacingWarning = useRef(false);

  useEffect(() => {
    setEditedData(documentData);
    setTranslatedContent(documentData.translated_content || '');
    setHasChanges(false);
    hasShownSpacingWarning.current = false;
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
  }, [documentData]);

  // Auto-detect Arabic spacing issues
  useEffect(() => {
    if (editedData.language === 'ar' && editedData.content && !hasShownSpacingWarning.current) {
      const hasSeparatedDiacritics = /[\u0621-\u064A]\s+[\u064B-\u0652]/.test(editedData.content);
      const hasGluedWords = /[\u0621-\u064A]{8,}/.test(editedData.content);
      
      if (hasSeparatedDiacritics || hasGluedWords) {
        hasShownSpacingWarning.current = true;
        toast({
          title: "⚠️ Problèmes d'espacement détectés",
          description: "Cliquez sur '✨ Corriger AR' pour améliorer le texte arabe",
          duration: 8000,
        });
      }
    }
  }, [editedData.content, editedData.language, toast]);

  useEffect(() => {
    
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

  // Sync local state when editedData.translated_content changes (after consolidation)
  useEffect(() => {
    if (editedData.translated_content && editedData.translated_content !== translatedContent) {
      setTranslatedContent(editedData.translated_content);
    }
  }, [editedData.translated_content]);

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
    const sortedPages = editedData.page_contents
      .sort((a, b) => a.pageNumber - b.pageNumber)
      .filter(page => page.translated_content && page.translated_content.trim() !== '');
    
    if (sortedPages.length === 0) {
      toast({
        title: "⚠️ Aucune traduction",
        description: "Aucune page traduite à consolider.",
        variant: "destructive"
      });
      return;
    }
    
    // Join all translations with page structure (without page number display)
    const consolidatedContent = sortedPages
      .map((page, index) => 
        `<div class="page-break" data-page="${page.pageNumber}">
          ${page.translated_content}
        </div>`
      )
      .join('\n');
    
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
        description: `Les ${sortedPages.length} pages traduites ont été consolidées dans l'onglet Contenu.`,
      });
    }
  };

  // Full workflow for analysis documents: translate all pages → consolidate → AI analysis
  const runFullAnalysisWorkflow = async () => {
    if (!editedData.page_contents || editedData.page_contents.length === 0) {
      toast({
        title: "❌ Aucune page disponible",
        description: "Le document doit contenir des pages à traduire.",
        variant: "destructive"
      });
      return;
    }

    if (!editedData.id) {
      toast({ title: "Erreur", description: "Aucun document chargé", variant: "destructive" });
      return;
    }

    setIsAnalyzing(true);
    setWorkflowStep('translation');
    setCompletedWorkflowSteps([]);
    const totalPages = editedData.page_contents.length;
    const sourceLanguage = editedData.language || 'fr';
    const targetLanguage = sourceLanguage === 'fr' ? 'ar' : 'fr';

    try {
      // Step 1: Translate all pages - Collect locally
      toast({
        title: "🔄 Workflow complet démarré",
        description: `Traduction de ${totalPages} pages...`,
      });
      
      const translationsMap = new Map<number, string>();
      
      // Pre-fill with existing translations
      for (const page of editedData.page_contents) {
        if (page.translated_content && page.translated_content.trim() !== '') {
          translationsMap.set(page.pageNumber, page.translated_content);
        }
      }
      
      // Translate missing pages
      for (let i = 0; i < editedData.page_contents.length; i++) {
        const page = editedData.page_contents[i];
        
        if (translationsMap.has(page.pageNumber)) {
          console.log(`Page ${page.pageNumber} déjà traduite, passage à la suivante`);
          continue;
        }
        
        console.log(`Translating page ${page.pageNumber}/${totalPages}...`);
        
        // Call translation API directly
        const { data, error } = await supabase.functions.invoke('translate-page', {
          body: {
            document_id: editedData.id,
            page_number: page.pageNumber,
            content: page.content,
            source_language: sourceLanguage,
            target_language: targetLanguage,
          },
        });

        if (error || !data?.translated_content) {
          throw new Error(`Erreur traduction page ${page.pageNumber}: ${error?.message || 'Pas de contenu traduit'}`);
        }
        
        translationsMap.set(page.pageNumber, data.translated_content);
        
        toast({
          title: "📄 Traduction en cours",
          description: `Page ${i + 1}/${totalPages} traduite`,
        });
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Step 2: Consolidate with local data
      setCompletedWorkflowSteps(['translation']);
      setWorkflowStep('consolidation');
      toast({
        title: "🔄 Consolidation",
        description: "Assemblage des traductions...",
      });
      
      const sortedPages = Array.from(translationsMap.entries()).sort((a, b) => a[0] - b[0]);
      const consolidatedContent = sortedPages.map(([_, content]) => content).join('\n\n');
      
      // Update page_contents with all translations
      const updatedPageContents = editedData.page_contents.map(p => ({
        ...p,
        translated_content: translationsMap.get(p.pageNumber) || p.translated_content || '',
        translation_status: 'completed' as const
      }));
      
      // Update state once with all data
      setEditedData(prev => ({
        ...prev,
        page_contents: updatedPageContents,
        translated_content: consolidatedContent
      }));
      
      setTranslatedContent(consolidatedContent);
      
      // Persist to database
      await supabase.from('documents').update({ 
        translated_content: consolidatedContent,
        page_contents: updatedPageContents as any
      }).eq('id', editedData.id);
      
      toast({
        title: "✅ Consolidation terminée",
        description: `${sortedPages.length} pages consolidées avec succès`,
      });

      // Step 3: Run AI analysis with full consolidated content
      setCompletedWorkflowSteps(['translation', 'consolidation']);
      setWorkflowStep('analysis');
      toast({
        title: "🧠 Analyse IA",
        description: "Extraction des métadonnées avec le contenu complet...",
      });

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Use smart-document-analysis with both original and translated content
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('smart-document-analysis', {
        body: {
          textualMetadata: editedData.textual_metadata || '',
          content: editedData.content,  // Original content
          translatedContent: consolidatedContent,  // Consolidated translated content
          currentLanguage: sourceLanguage,
          mode: 'quick',
          documentType: documentTypes.find(dt => dt.id === editedData.document_type_id)?.name || 'Analyses juridiques'
        },
      });

      if (analysisError) {
        console.error('Error in AI analysis:', analysisError);
        throw analysisError;
      }

      if (analysisData?.success && analysisData?.analysis) {
        const analysis = analysisData.analysis;
        const isPrimaryArabic = sourceLanguage === 'ar';
        
        // Map results correctly based on primary language
        if (isPrimaryArabic) {
          // Arabic is primary - analysis result goes to Arabic fields, translation to French
          setEditedData(prev => ({
            ...prev,
            title_ar: analysis.title ? normalizeArabicForDisplay(analysis.title) : prev.title_ar,
            title: analysis.translatedTitle || prev.title,
            summary_ar: analysis.summary ? normalizeArabicForDisplay(analysis.summary) : prev.summary_ar,
            summary: analysis.translatedSummary || prev.summary,
            author_ar: analysis.metadata?.author ? normalizeArabicForDisplay(analysis.metadata.author) : prev.author_ar,
            author: analysis.metadataTranslated?.author || prev.author,
            bibliography_ar: analysis.metadata?.bibliography 
              ? normalizeArabicForDisplay(analysis.metadata.bibliography) 
              : prev.bibliography_ar,
            bibliography: analysis.metadataTranslated?.bibliography || prev.bibliography,
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
            })(),
            legal_references_ar: analysis.metadata?.legal_references || prev.legal_references_ar,
            legal_references: analysis.metadataTranslated?.legal_references || prev.legal_references,
          }));
        } else {
          // French is primary - analysis result goes to French fields, translation to Arabic
          setEditedData(prev => ({
            ...prev,
            title: analysis.title || prev.title,
            title_ar: analysis.translatedTitle ? normalizeArabicForDisplay(analysis.translatedTitle) : prev.title_ar,
            summary: analysis.summary || prev.summary,
            summary_ar: analysis.translatedSummary ? normalizeArabicForDisplay(analysis.translatedSummary) : prev.summary_ar,
            author: analysis.metadata?.author || prev.author,
            author_ar: analysis.metadataTranslated?.author ? normalizeArabicForDisplay(analysis.metadataTranslated.author) : prev.author_ar,
            bibliography: analysis.metadata?.bibliography || prev.bibliography,
            bibliography_ar: analysis.metadataTranslated?.bibliography 
              ? normalizeArabicForDisplay(analysis.metadataTranslated.bibliography)
              : prev.bibliography_ar,
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
            })(),
            legal_references: analysis.metadata?.legal_references || prev.legal_references,
            legal_references_ar: analysis.metadataTranslated?.legal_references || prev.legal_references_ar,
          }));
        }
        
        toast({
          title: "✅ Analyse IA terminée",
          description: "Métadonnées extraites et traduites dans les deux langues",
        });
      }

      setCompletedWorkflowSteps(['translation', 'consolidation', 'analysis']);
      setWorkflowStep(null);
      toast({
        title: "✅ Workflow terminé !",
        description: "Document traduit et analysé avec succès.",
      });

    } catch (error) {
      console.error('Error in full analysis workflow:', error);
      toast({
        title: "❌ Erreur dans le workflow",
        description: error instanceof Error ? error.message : "Une erreur est survenue.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
      setWorkflowStep(null);
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
          translatedContent: editedData.translated_content || '', // Include consolidated translation
          currentLanguage: editedData.language || 'fr',
          mode: 'quick',
          documentType: documentTypes.find(dt => dt.id === editedData.document_type_id)?.name || ''
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
            // Apply AI suggestions for dropdown fields, but preserve analysis document type
            document_type_id: (() => {
              const currentDocType = documentTypesRef.current.find(dt => dt.id === prev.document_type_id);
              const isCurrentAnalysis = currentDocType?.name === 'Analyses juridiques' || 
                                        currentDocType?.name === 'Fiche d\'analyse';
              console.log('Document type preservation check (AR):', {
                prevDocTypeId: prev.document_type_id,
                documentTypesCount: documentTypesRef.current.length,
                currentDocTypeName: currentDocType?.name,
                isCurrentAnalysis,
                suggestionId: suggestionIds.documentTypeId
              });
              return isCurrentAnalysis ? prev.document_type_id : (suggestionIds.documentTypeId || prev.document_type_id);
            })(),
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
            // Analysis-specific fields (Arabic primary)
            validation_date: analysis.metadata?.validation_date || prev.validation_date,
            legal_references_ar: analysis.metadata?.legal_references || prev.legal_references_ar,
            bibliography_ar: analysis.metadata?.bibliography 
              ? normalizeArabicForDisplay(analysis.metadata.bibliography) 
              : prev.bibliography_ar,
            // Traductions en français
            legal_references: analysis.metadataTranslated?.legal_references || prev.legal_references,
            bibliography: analysis.metadataTranslated?.bibliography || prev.bibliography,
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
            })(),
            // Textual metadata in Arabic (source language)
            textual_metadata: analysis.textualMetadata || prev.textual_metadata
          }));
          // Store translated content separately ONLY if no consolidated translation exists
          // This prevents AI analysis from overwriting the full consolidated translated content with just a summary
          if (!translatedContent || translatedContent.trim().length < 500) {
            setTranslatedContent(analysis.translatedContent || '');
          }
          // Keep user on their current language tab - don't auto-switch
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
            // Apply AI suggestions for dropdown fields, but preserve analysis document type
            document_type_id: (() => {
              const currentDocType = documentTypesRef.current.find(dt => dt.id === prev.document_type_id);
              const isCurrentAnalysis = currentDocType?.name === 'Analyses juridiques' || 
                                        currentDocType?.name === 'Fiche d\'analyse';
              console.log('Document type preservation check (FR):', {
                prevDocTypeId: prev.document_type_id,
                documentTypesCount: documentTypesRef.current.length,
                currentDocTypeName: currentDocType?.name,
                isCurrentAnalysis,
                suggestionId: suggestionIds.documentTypeId
              });
              return isCurrentAnalysis ? prev.document_type_id : (suggestionIds.documentTypeId || prev.document_type_id);
            })(),
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
            // Analysis-specific fields (French primary)
            validation_date: analysis.metadata?.validation_date || prev.validation_date,
            legal_references: analysis.metadata?.legal_references || prev.legal_references,
            bibliography: analysis.metadata?.bibliography || prev.bibliography,
            // Traductions en arabe
            legal_references_ar: analysis.metadataTranslated?.legal_references || prev.legal_references_ar,
            bibliography_ar: analysis.metadataTranslated?.bibliography 
              ? normalizeArabicForDisplay(analysis.metadataTranslated.bibliography)
              : prev.bibliography_ar,
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
            })(),
            // Textual metadata in French (source language)
            textual_metadata: analysis.textualMetadata || prev.textual_metadata
          }));
          // Store translated content separately ONLY if no consolidated translation exists
          // This prevents AI analysis from overwriting the full consolidated translated content with just a summary
          if (!translatedContent || translatedContent.trim().length < 500) {
            setTranslatedContent(analysis.translatedContent || '');
          }
          // Keep user on their current language tab - don't auto-switch
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
          title_ar: editedData.title_ar?.trim() ? sanitizeArabicTextFrontend(editedData.title_ar.trim()) : null,
          subtitle: editedData.subtitle?.trim() || null,
          subtitle_ar: editedData.subtitle_ar?.trim() ? sanitizeArabicTextFrontend(editedData.subtitle_ar.trim()) : null,
          summary: editedData.summary?.trim() || null,
          summary_ar: editedData.summary_ar?.trim() ? sanitizeArabicTextFrontend(editedData.summary_ar.trim()) : null,
          content: editedData.language === 'ar' && editedData.content ? sanitizeArabicTextFrontend(editedData.content) : editedData.content || '',
          translated_content: translatedContent?.trim() || null,
          keywords: Array.isArray(editedData.keywords) ? editedData.keywords.filter(k => k && k.trim()) : [],
          keywords_ar: Array.isArray(editedData.keywords_ar) ? editedData.keywords_ar.filter(k => k && k.trim()).map(k => sanitizeArabicTextFrontend(k)) : [],
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
          author_ar: editedData.author_ar?.trim() ? sanitizeArabicTextFrontend(editedData.author_ar.trim()) : null,
          court: editedData.court?.trim() || null,
          court_ar: editedData.court_ar?.trim() ? sanitizeArabicTextFrontend(editedData.court_ar.trim()) : null,
          court_category_type: editedData.court_category_type?.trim() || null,
          court_category_type_ar: editedData.court_category_type_ar?.trim() ? sanitizeArabicTextFrontend(editedData.court_category_type_ar.trim()) : null,
          court_level: editedData.court_level?.trim() || null,
          court_level_ar: editedData.court_level_ar?.trim() ? sanitizeArabicTextFrontend(editedData.court_level_ar.trim()) : null,
          case_number: editedData.case_number?.trim() || null,
          year: editedData.year || null,
          plaintiff: editedData.plaintiff?.trim() || null,
          plaintiff_ar: editedData.plaintiff_ar?.trim() ? sanitizeArabicTextFrontend(editedData.plaintiff_ar.trim()) : null,
          defendant: editedData.defendant?.trim() || null,
          defendant_ar: editedData.defendant_ar?.trim() ? sanitizeArabicTextFrontend(editedData.defendant_ar.trim()) : null,
          validation_date: editedData.validation_date || null,
          legal_references: Array.isArray(editedData.legal_references) ? editedData.legal_references.filter(r => r && r.trim()) : null,
          legal_references_ar: Array.isArray(editedData.legal_references_ar) ? editedData.legal_references_ar.filter(r => r && r.trim()).map(r => sanitizeArabicTextFrontend(r)) : null,
          bibliography: editedData.bibliography?.trim() || null,
          bibliography_ar: editedData.bibliography_ar?.trim() ? sanitizeArabicTextFrontend(editedData.bibliography_ar.trim()) : null,
          textual_metadata: editedData.language === 'ar' && editedData.textual_metadata ? sanitizeArabicTextFrontend(editedData.textual_metadata) : editedData.textual_metadata || null,
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
      // Show translated content in secondary language - prioritize consolidated page translations
      return editedData.translated_content || translatedContent || editedData.fullContent || editedData.content;
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
      // Normalize all Arabic fields using sanitizeArabicTextFrontend for proper joining
      const cleaned = {
        ...editedData,
        title_ar: editedData.title_ar ? sanitizeArabicTextFrontend(editedData.title_ar) : editedData.title_ar,
        subtitle_ar: editedData.subtitle_ar ? sanitizeArabicTextFrontend(editedData.subtitle_ar) : editedData.subtitle_ar,
        content: editedData.language === 'ar' && editedData.content ? sanitizeArabicTextFrontend(editedData.content) : editedData.content,
        textual_metadata: editedData.language === 'ar' && editedData.textual_metadata ? sanitizeArabicTextFrontend(editedData.textual_metadata) : editedData.textual_metadata,
        summary_ar: editedData.summary_ar ? sanitizeArabicTextFrontend(editedData.summary_ar) : editedData.summary_ar,
        keywords_ar: editedData.keywords_ar?.map(k => sanitizeArabicTextFrontend(k)),
        author_ar: editedData.author_ar ? sanitizeArabicTextFrontend(editedData.author_ar) : editedData.author_ar,
        court_ar: editedData.court_ar ? sanitizeArabicTextFrontend(editedData.court_ar) : editedData.court_ar,
        plaintiff_ar: editedData.plaintiff_ar ? sanitizeArabicTextFrontend(editedData.plaintiff_ar) : editedData.plaintiff_ar,
        defendant_ar: editedData.defendant_ar ? sanitizeArabicTextFrontend(editedData.defendant_ar) : editedData.defendant_ar,
        court_level_ar: editedData.court_level_ar ? sanitizeArabicTextFrontend(editedData.court_level_ar) : editedData.court_level_ar,
        court_category_type_ar: editedData.court_category_type_ar ? sanitizeArabicTextFrontend(editedData.court_category_type_ar) : editedData.court_category_type_ar,
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

  const correctArabicSpacingPageByPage = async () => {
    if (!editedData.page_contents || editedData.page_contents.length === 0) {
      toast({
        title: "Aucune page disponible",
        description: "Ce document n'a pas de pages individuelles pour la correction.",
        variant: "destructive"
      });
      return;
    }

    setIsCorrectingSpacing(true);
    const totalPages = editedData.page_contents.length;
    let correctedCount = 0;
    let errorCount = 0;
    const correctedPages = [...editedData.page_contents];

    try {
      // Process pages sequentially to avoid rate limiting
      for (let i = 0; i < editedData.page_contents.length; i++) {
        const page = editedData.page_contents[i];
        setCorrectionProgress({ current: i + 1, total: totalPages });

        // Skip empty pages
        if (!page.content || page.content.trim() === '') {
          continue;
        }

        try {
          console.log(`Correcting page ${page.pageNumber}/${totalPages}...`);
          
          const { data, error } = await supabase.functions.invoke('arabic-spacing-fixer', {
            body: { text: page.content }
          });

          if (error) throw error;

          if (data?.success && data.correctedText) {
            correctedPages[i] = { ...page, content: data.correctedText };
            correctedCount++;
          }
        } catch (pageError: any) {
          console.warn(`Page ${page.pageNumber} correction failed:`, pageError);
          errorCount++;
          // Keep original content on error
        }
      }

      // Update page_contents with corrected content
      const consolidatedContent = correctedPages
        .sort((a, b) => a.pageNumber - b.pageNumber)
        .map(p => p.content)
        .filter(c => c && c.trim() !== '')
        .join('\n\n');

      setEditedData(prev => ({
        ...prev,
        page_contents: correctedPages,
        content: consolidatedContent
      }));

      toast({
        title: "✅ Correction terminée",
        description: `${correctedCount}/${totalPages} pages corrigées${errorCount > 0 ? ` (${errorCount} erreurs)` : ''}`,
      });

    } catch (error: any) {
      console.error('Page-by-page correction error:', error);
      toast({
        title: "Erreur de correction",
        description: error.message || "Impossible de corriger les pages",
        variant: "destructive"
      });
    } finally {
      setIsCorrectingSpacing(false);
      setCorrectionProgress({ current: 0, total: 0 });
    }
  };

  // Helper function to correct a single Arabic field
  const correctSingleArabicField = async (text: string): Promise<string | null> => {
    if (!text || text.trim() === '') return null;
    
    try {
      const { data, error } = await supabase.functions.invoke('arabic-spacing-fixer', {
        body: { text }
      });
      
      if (error) throw error;
      return data?.correctedText || text;
    } catch (error) {
      console.error('Field correction error:', error);
      return text; // Return original on error
    }
  };

  const correctArabicSpacing = async () => {
    if (editedData.language !== 'ar') {
      toast({
        title: "Erreur",
        description: "Le document doit être en arabe",
        variant: "destructive"
      });
      return;
    }

    setIsCorrectingSpacing(true);
    
    // Count fields to correct
    const fieldsToCorrect = [
      editedData.title_ar?.trim() ? 'title_ar' : null,
      editedData.subtitle_ar?.trim() ? 'subtitle_ar' : null,
      editedData.summary_ar?.trim() ? 'summary_ar' : null,
      editedData.bibliography_ar?.trim() ? 'bibliography_ar' : null,
      editedData.content?.trim() ? 'content' : null,
    ].filter(Boolean);
    
    const totalFields = fieldsToCorrect.length;
    let currentField = 0;
    
    setCorrectionProgress({ current: 0, total: totalFields });

    try {
      const correctedFields: Record<string, string | null> = {};

      // Correct metadata fields in parallel
      const metadataPromises: Promise<void>[] = [];
      
      if (editedData.title_ar?.trim()) {
        metadataPromises.push(
          correctSingleArabicField(editedData.title_ar).then(result => {
            correctedFields.title_ar = result;
            currentField++;
            setCorrectionProgress({ current: currentField, total: totalFields });
          })
        );
      }
      
      if (editedData.subtitle_ar?.trim()) {
        metadataPromises.push(
          correctSingleArabicField(editedData.subtitle_ar).then(result => {
            correctedFields.subtitle_ar = result;
            currentField++;
            setCorrectionProgress({ current: currentField, total: totalFields });
          })
        );
      }
      
      if (editedData.summary_ar?.trim()) {
        metadataPromises.push(
          correctSingleArabicField(editedData.summary_ar).then(result => {
            correctedFields.summary_ar = result;
            currentField++;
            setCorrectionProgress({ current: currentField, total: totalFields });
          })
        );
      }
      
      if (editedData.bibliography_ar?.trim()) {
        metadataPromises.push(
          correctSingleArabicField(editedData.bibliography_ar).then(result => {
            correctedFields.bibliography_ar = result;
            currentField++;
            setCorrectionProgress({ current: currentField, total: totalFields });
          })
        );
      }

      // Wait for all metadata corrections
      await Promise.all(metadataPromises);

      // Correct content
      if (editedData.content?.trim()) {
        if (editedData.content.length <= 12000) {
          // Short content: direct correction
          const correctedContent = await correctSingleArabicField(editedData.content);
          correctedFields.content = correctedContent;
          currentField++;
          setCorrectionProgress({ current: currentField, total: totalFields });
        } else if (editedData.page_contents && editedData.page_contents.length > 0) {
          // Long content with pages: page-by-page correction
          setIsCorrectingSpacing(false); // Will be set by correctArabicSpacingPageByPage
          
          // Apply metadata corrections first
          if (Object.keys(correctedFields).length > 0) {
            setEditedData(prev => ({
              ...prev,
              ...correctedFields
            }));
          }
          
          await correctArabicSpacingPageByPage();
          
          toast({
            title: "✅ Correction réussie",
            description: `Métadonnées et contenu (page par page) corrigés`,
          });
          return;
        } else {
          // Long content without pages
          toast({
            title: "⚠️ Contenu trop long",
            description: "Le contenu dépasse 12 000 caractères sans pages. Seules les métadonnées ont été corrigées.",
          });
        }
      }

      // Apply all corrections
      setEditedData(prev => ({
        ...prev,
        ...correctedFields
      }));

      const correctedCount = Object.keys(correctedFields).filter(k => correctedFields[k]).length;
      toast({
        title: "✅ Correction réussie",
        description: `${correctedCount} champ(s) corrigé(s): ${Object.keys(correctedFields).join(', ')}`,
      });

    } catch (error: any) {
      console.error('Arabic spacing correction error:', error);
      toast({
        title: "Erreur de correction",
        description: error.message || "Impossible de corriger l'espacement",
        variant: "destructive"
      });
    } finally {
      setIsCorrectingSpacing(false);
      setCorrectionProgress({ current: 0, total: 0 });
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
      </div>

      {/* Workflow Timeline - Only show when workflow is running */}
      {workflowStep && (
        <WorkflowTimeline
          currentStep={workflowStep}
          completedSteps={completedWorkflowSteps}
          steps={[
            {
              id: 'translation',
              label: 'Traduction des pages',
              description: 'Traduction automatique de toutes les pages du document'
            },
            {
              id: 'consolidation',
              label: 'Consolidation',
              description: 'Assemblage de toutes les traductions en un document complet'
            },
            {
              id: 'analysis',
              label: 'Analyse IA',
              description: 'Extraction des métadonnées et analyse du contenu'
            }
          ]}
        />
      )}

      {/* Workflow IA Guide - Timeline (dynamique selon le type de document) */}
      {(() => {
        const currentDocType = documentTypes.find(dt => dt.id === editedData.document_type_id);
        const isAnalysisDocument = currentDocType?.name === 'Analyses juridiques';
        
        return (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800" dir="ltr">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                  {isAnalysisDocument ? '📚 Workflow recommandé pour documents d\'analyse' : '🧠 Workflow de traitement IA'}
                </h4>
              </div>
              
              {isAnalysisDocument ? (
                /* Workflow pour documents d'analyse : Traduire → Consolider → Analyse IA */
                <>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mb-4">
                    Pour une extraction optimale de la bibliographie (située en fin de document), suivez cet ordre :
                  </p>
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Étape 1 - Traduction */}
                    <div className="flex-1 flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-emerald-600 dark:bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        1
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-emerald-900 dark:text-emerald-100 mb-1">
                          📖 Traduire toutes les pages
                        </p>
                        <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
                          Traduit le contenu complet de chaque page (y compris la bibliographie en fin de document)
                        </p>
                      </div>
                    </div>
                    
                    {/* Flèche */}
                    <div className="hidden md:flex items-center justify-center">
                      <ChevronRight className="h-6 w-6 text-blue-400 dark:text-blue-600" />
                    </div>
                    
                    {/* Étape 2 - Consolidation */}
                    <div className="flex-1 flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-amber-500 dark:bg-amber-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        2
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                          📄 Consolider
                        </p>
                        <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                          Fusionne toutes les pages traduites en un seul contenu continu
                        </p>
                      </div>
                    </div>
                    
                    {/* Flèche */}
                    <div className="hidden md:flex items-center justify-center">
                      <ChevronRight className="h-6 w-6 text-blue-400 dark:text-blue-600" />
                    </div>
                    
                    {/* Étape 3 - Analyse IA */}
                    <div className="flex-1 flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        3
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                          🤖 Analyse IA
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                          Extrait les métadonnées et la bibliographie du contenu complet traduit
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Workflow pour jurisprudence : Analyse IA → Traduction → Consolidation */
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Étape 1 - Analyse IA */}
                  <div className="flex-1 flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      1
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                        🤖 {t('aiAnalysisStep')}
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                        {t('aiAnalysisStepDesc')}
                      </p>
                    </div>
                  </div>
                  
                  {/* Flèche */}
                  <div className="hidden md:flex items-center justify-center">
                    <ChevronRight className="h-6 w-6 text-blue-400 dark:text-blue-600" />
                  </div>
                  
                  {/* Étape 2 - Traduction page par page */}
                  <div className="flex-1 flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-emerald-600 dark:bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      2
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-emerald-900 dark:text-emerald-100 mb-1">
                        📖 {t('translatePagesStep')}
                      </p>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
                        {t('translatePagesStepDesc')}
                      </p>
                    </div>
                  </div>
                  
                  {/* Flèche */}
                  <div className="hidden md:flex items-center justify-center">
                    <ChevronRight className="h-6 w-6 text-blue-400 dark:text-blue-600" />
                  </div>
                  
                  {/* Étape 3 - Consolidation */}
                  <div className="flex-1 flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-amber-500 dark:bg-amber-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      3
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                        📄 {t('consolidateStep')}
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                        {t('consolidateStepDesc')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })()}

      {/* Bouton workflow complet pour documents d'analyse */}
      {(() => {
        const currentDocType = documentTypes.find(dt => dt.id === editedData.document_type_id);
        const isAnalysisDoc = currentDocType?.name === 'Analyses juridiques';
        
        if (isAnalysisDoc && editedData.page_contents && editedData.page_contents.length > 0) {
          return (
            <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/30">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Brain className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2 flex-1">
                    <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                      ⚡ Workflow automatisé complet
                    </p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                      Exécute automatiquement les 3 étapes : traduction de toutes les pages → consolidation → analyse IA complète
                    </p>
                    <Button
                      onClick={runFullAnalysisWorkflow}
                      disabled={isAnalyzing}
                      size="sm"
                      className="mt-2"
                      variant="default"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Workflow en cours...
                        </>
                      ) : (
                        <>
                          <Brain className="h-4 w-4 mr-2" />
                          Lancer le workflow complet
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        }
        return null;
      })()}

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
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
                  Traduire page par page
                </>
              )}
            </Button>
          )}
          
          
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

                    {/* Informations Juridiques / Analyse - Français */}
                    {!isAnalysisDocument ? (
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
                    ) : (
                      <div className="mt-4 pt-4 border-t border-border">
                        <h5 className="text-sm font-semibold mb-3 text-muted-foreground">Informations de l'Analyse</h5>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs font-medium">Auteur <span className="text-red-500">*</span></Label>
                            <Input
                              value={editedData.author || ''}
                              onChange={(e) => setEditedData(prev => ({ ...prev, author: e.target.value }))}
                              placeholder="Nom de l'auteur"
                              className="mt-1 h-8"
                              required
                            />
                          </div>

                          <div>
                            <Label className="text-xs font-medium">Date de validation</Label>
                            <Input
                              type="date"
                              value={editedData.validation_date || ''}
                              onChange={(e) => setEditedData(prev => ({ ...prev, validation_date: e.target.value }))}
                              className="mt-1 h-8"
                            />
                          </div>

                          <div>
                            <Label className="text-xs font-medium">Références légales</Label>
                            <div className="mt-1 space-y-2">
                              <div className="flex flex-wrap gap-2 min-h-[32px] p-2 border rounded-md bg-background">
                                {(editedData.legal_references || []).map((ref, index) => (
                                  <Badge 
                                    key={index} 
                                    variant="secondary"
                                    className="flex items-center gap-1 px-2 py-1"
                                  >
                                    {ref}
                                    <X 
                                      className="h-3 w-3 cursor-pointer hover:text-destructive" 
                                      onClick={() => {
                                        const newRefs = [...(editedData.legal_references || [])];
                                        newRefs.splice(index, 1);
                                        setEditedData(prev => ({ ...prev, legal_references: newRefs }));
                                        setHasChanges(true);
                                      }}
                                    />
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <Input
                                  value={newReference}
                                  onChange={(e) => setNewReference(e.target.value)}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter' && newReference.trim()) {
                                      e.preventDefault();
                                      const refs = editedData.legal_references || [];
                                      setEditedData(prev => ({ ...prev, legal_references: [...refs, newReference.trim()] }));
                                      setNewReference('');
                                      setHasChanges(true);
                                    }
                                  }}
                                  placeholder="Ajouter une référence"
                                  className="h-8 flex-1"
                                />
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    if (newReference.trim()) {
                                      const refs = editedData.legal_references || [];
                                      setEditedData(prev => ({ ...prev, legal_references: [...refs, newReference.trim()] }));
                                      setNewReference('');
                                      setHasChanges(true);
                                    }
                                  }}
                                  className="h-8"
                                >
                                  Ajouter
                                </Button>
                              </div>
                            </div>
                          </div>

                          <div>
                            <Label className="text-xs font-medium">Bibliographie</Label>
                            <CKEditorMini
                              content={editedData.bibliography || ''}
                              onChange={(value) => setEditedData(prev => ({ ...prev, bibliography: value }))}
                              language="fr"
                              placeholder="Liste des sources et références bibliographiques..."
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    )}

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
                        className="mt-1 arabic-text font-arabic"
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
                        className="mt-1 arabic-text font-arabic"
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

                    {/* Informations Juridiques / Analyse - Arabe */}
                    {!isAnalysisDocument ? (
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
                              className="mt-1 h-8 arabic-text font-arabic"
                            />
                          </div>

                          <div>
                            <Label className="text-xs font-medium">فئة المحكمة</Label>
                            <Select
                              value={editedData.court_category_type_ar || ''}
                              onValueChange={(value) => {
                                setEditedData(prev => ({ ...prev, court_category_type_ar: normalizeArabicForDisplay(value) }));
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
                    ) : (
                      <div className="mt-4 pt-4 border-t border-border">
                        <h5 className="text-sm font-semibold mb-3 text-muted-foreground" dir="rtl">معلومات التحليل</h5>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs font-medium">المؤلف <span className="text-red-500">*</span></Label>
                            <Input
                              value={editedData.author_ar || ''}
                              onChange={(e) => {
                                const cleaned = handleArabicInput(e.target.value);
                                setEditedData(prev => ({ ...prev, author_ar: cleaned }));
                              }}
                              placeholder="اسم المؤلف"
                              dir="rtl"
                              className="mt-1 h-8"
                              required
                            />
                          </div>

                          <div>
                            <Label className="text-xs font-medium">تاريخ المصادقة</Label>
                            <Input
                              type="date"
                              value={editedData.validation_date || ''}
                              onChange={(e) => setEditedData(prev => ({ ...prev, validation_date: e.target.value }))}
                              dir="rtl"
                              className="mt-1 h-8"
                            />
                          </div>

                          <div>
                            <Label className="text-xs font-medium">المراجع القانونية</Label>
                            <div className="mt-1 space-y-2">
                              <div className="flex flex-wrap gap-2 min-h-[32px] p-2 border rounded-md bg-background" dir="rtl">
                                {(editedData.legal_references_ar || []).map((ref, index) => (
                                  <Badge 
                                    key={index} 
                                    variant="secondary"
                                    className="flex items-center gap-1 px-2 py-1 arabic-text font-arabic"
                                    dir="rtl"
                                  >
                                    {ref}
                                    <X 
                                      className="h-3 w-3 cursor-pointer hover:text-destructive" 
                                      onClick={() => {
                                        const newRefs = [...(editedData.legal_references_ar || [])];
                                        newRefs.splice(index, 1);
                                        setEditedData(prev => ({ ...prev, legal_references_ar: newRefs }));
                                        setHasChanges(true);
                                      }}
                                    />
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <Input
                                  value={newReferenceAr}
                                  onChange={(e) => setNewReferenceAr(handleArabicInput(e.target.value))}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter' && newReferenceAr.trim()) {
                                      e.preventDefault();
                                      const refs = editedData.legal_references_ar || [];
                                      setEditedData(prev => ({ ...prev, legal_references_ar: [...refs, newReferenceAr.trim()] }));
                                      setNewReferenceAr('');
                                      setHasChanges(true);
                                    }
                                  }}
                                  placeholder="إضافة مرجع"
                                  dir="rtl"
                                  className="h-8 flex-1"
                                />
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    if (newReferenceAr.trim()) {
                                      const refs = editedData.legal_references_ar || [];
                                      setEditedData(prev => ({ ...prev, legal_references_ar: [...refs, newReferenceAr.trim()] }));
                                      setNewReferenceAr('');
                                      setHasChanges(true);
                                    }
                                  }}
                                  className="h-8"
                                >
                                  إضافة
                                </Button>
                              </div>
                            </div>
                          </div>

                          <div>
                            <Label className="text-xs font-medium">قائمة المراجع</Label>
                            <CKEditorMini
                              content={editedData.bibliography_ar || ''}
                              onChange={(value) => setEditedData(prev => ({ ...prev, bibliography_ar: value }))}
                              language="ar"
                              placeholder="قائمة المصادر والمراجع..."
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    )}

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
                   <CKEditorMini
                    content={currentLanguage === 'ar' ? (editedData.summary_ar || '') : (editedData.summary || '')}
                    onChange={(value) => {
                      setEditedData(prev => ({
                        ...prev,
                        [currentLanguage === 'ar' ? 'summary_ar' : 'summary']: value
                      }));
                    }}
                    language={currentLanguage as 'fr' | 'ar'}
                    placeholder={currentLanguage === 'ar' ? 'ملخص الوثيقة' : 'Résumé du document'}
                    className="w-full"
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
                  <div className={`flex flex-wrap gap-2 max-h-24 overflow-y-auto ${currentLanguage === 'ar' ? 'flex-row-reverse' : ''}`} dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}>
                    {(currentLanguage === 'ar' ? editedData.keywords_ar : editedData.keywords)?.map((keyword, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className={`flex items-center gap-1 ${currentLanguage === 'ar' ? 'arabic-text font-arabic' : ''}`}
                        dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
                      >
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
              ) : editedData.page_contents && editedData.page_contents.length > 1 ? (
                /* Affichage structuré page par page */
                <div className="space-y-0">
                  {editedData.page_contents
                    .sort((a, b) => a.pageNumber - b.pageNumber)
                    .map((page) => (
                      <div key={page.pageNumber} className="page-break">
                        <CKEditorWrapper
                          content={currentLanguage === editedData.language ? page.content : (page.translated_content || '')}
                          onChange={(newContent) => {
                            setEditedData(prev => ({
                              ...prev,
                              page_contents: prev.page_contents?.map(p =>
                                p.pageNumber === page.pageNumber
                                  ? { 
                                      ...p, 
                                      ...(currentLanguage === editedData.language 
                                        ? { content: newContent }
                                        : { translated_content: newContent }
                                      )
                                    }
                                  : p
                              )
                            }));
                            setHasChanges(true);
                          }}
                          language={currentLanguage as 'fr' | 'ar'}
                          placeholder={`Contenu de la page ${page.pageNumber}...`}
                          className="min-h-[200px]"
                        />
                      </div>
                    ))}
                </div>
              ) : (
                <CKEditorWrapper
                  content={getCurrentContent()}
                  onChange={(newContent) => {
                    if (currentLanguage === editedData.language) {
                      setEditedData(prev => ({
                        ...prev,
                        content: newContent,
                        fullContent: newContent
                      }));
                    } else {
                      setTranslatedContent(newContent);
                      setHasChanges(true);
                    }
                  }}
                  language={currentLanguage as 'fr' | 'ar'}
                  placeholder={currentLanguage === editedData.language ? 
                    "Contenu du document..." : 
                    "Contenu traduit..."
                  }
                  className="min-h-[600px]"
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
