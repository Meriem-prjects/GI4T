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
import { normalizeArabicText, handleArabicInput } from '@/lib/arabicUtils';

interface PageContent {
  pageNumber: number;
  content: string;
  confidence?: number;
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
    
    // Normalize Arabic fields on initial load (only once)
    if (!hasNormalizedOnLoad.current && documentData.id) {
      hasNormalizedOnLoad.current = true;
      
      setEditedData(prev => ({
        ...prev,
        title_ar: prev.title_ar ? normalizeArabicText(prev.title_ar) : prev.title_ar,
        subtitle_ar: prev.subtitle_ar ? normalizeArabicText(prev.subtitle_ar) : prev.subtitle_ar,
        summary_ar: prev.summary_ar ? normalizeArabicText(prev.summary_ar) : prev.summary_ar,
        author_ar: prev.author_ar ? normalizeArabicText(prev.author_ar) : prev.author_ar,
        court_ar: prev.court_ar ? normalizeArabicText(prev.court_ar) : prev.court_ar,
        plaintiff_ar: prev.plaintiff_ar ? normalizeArabicText(prev.plaintiff_ar) : prev.plaintiff_ar,
        defendant_ar: prev.defendant_ar ? normalizeArabicText(prev.defendant_ar) : prev.defendant_ar,
        textual_metadata: (prev.language === 'ar' && prev.textual_metadata) 
          ? normalizeArabicText(prev.textual_metadata) 
          : prev.textual_metadata,
        content: (prev.language === 'ar' && prev.content) 
          ? normalizeArabicText(prev.content) 
          : prev.content
      }));
    }
    
    loadCategories();
    loadDocumentTypes();
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
      const { data, error } = await supabase.functions.invoke('smart-document-analysis', {
        body: {
          textualMetadata: editedData.textual_metadata || '',
          content: editedData.content,
          currentLanguage: editedData.language || 'fr'
        }
      });

      if (error) throw error;

      if (data.success && data.analysis) {
        const analysis = data.analysis;
        const isPrimaryArabic = editedData.language === 'ar';
        
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
            title_ar: analysis.title ? normalizeArabicText(analysis.title) : prev.title_ar,
            subtitle_ar: analysis.subtitle ? normalizeArabicText(analysis.subtitle) : prev.subtitle_ar,
            title: analysis.translatedTitle || prev.title,
            subtitle: analysis.translatedSubtitle || prev.subtitle,
            summary_ar: analysis.summary ? normalizeArabicText(analysis.summary) : prev.summary_ar,
            summary: analysis.translatedSummary || prev.summary,
            // Keep original content unchanged
            // Apply AI suggestions for dropdown fields
            document_type_id: suggestionIds.documentTypeId || prev.document_type_id,
            // Metadata in Arabic (primary language)
            author_ar: analysis.metadata?.author ? normalizeArabicText(analysis.metadata.author) : prev.author_ar,
            court_ar: analysis.metadata?.court ? normalizeArabicText(analysis.metadata.court) : prev.court_ar,
            case_number: analysis.metadata?.case_number || prev.case_number,
            plaintiff_ar: analysis.metadata?.plaintiff ? normalizeArabicText(analysis.metadata.plaintiff) : prev.plaintiff_ar,
            defendant_ar: analysis.metadata?.defendant ? normalizeArabicText(analysis.metadata.defendant) : prev.defendant_ar,
            year: analysis.metadata?.year || prev.year,
            court_level_ar: analysis.metadata?.court_level ? normalizeArabicText(analysis.metadata.court_level) : prev.court_level_ar,
            // Translated metadata in French
            author: analysis.metadataTranslated?.author || prev.author,
            court: analysis.metadataTranslated?.court || prev.court,
            plaintiff: analysis.metadataTranslated?.plaintiff || prev.plaintiff,
            defendant: analysis.metadataTranslated?.defendant || prev.defendant,
            court_level: analysis.metadataTranslated?.court_level || prev.court_level,
            // Keep original Arabic content, don't replace it
            keywords_ar: (() => {
              const existing = (prev.keywords_ar || []).map(k => normalizeArabicText(k.trim())).filter(k => k && /[\u0600-\u06FF]/.test(k));
              const newKeys = (analysis.existingKeywords || []).map(k => normalizeArabicText(k.trim())).filter(k => k && /[\u0600-\u06FF]/.test(k));
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
              const newKeys = (analysis.translatedKeywords || []).map(k => k.trim()).filter(k => k && !/[\u0600-\u06FF]/.test(k));
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
            title_ar: analysis.translatedTitle ? normalizeArabicText(analysis.translatedTitle) : prev.title_ar,
            subtitle_ar: analysis.translatedSubtitle ? normalizeArabicText(analysis.translatedSubtitle) : prev.subtitle_ar,
            summary: analysis.summary || prev.summary,
            summary_ar: analysis.translatedSummary ? normalizeArabicText(analysis.translatedSummary) : prev.summary_ar,
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
            author_ar: analysis.metadataTranslated?.author ? normalizeArabicText(analysis.metadataTranslated.author) : prev.author_ar,
            court_ar: analysis.metadataTranslated?.court ? normalizeArabicText(analysis.metadataTranslated.court) : prev.court_ar,
            plaintiff_ar: analysis.metadataTranslated?.plaintiff ? normalizeArabicText(analysis.metadataTranslated.plaintiff) : prev.plaintiff_ar,
            defendant_ar: analysis.metadataTranslated?.defendant ? normalizeArabicText(analysis.metadataTranslated.defendant) : prev.defendant_ar,
            court_level_ar: analysis.metadataTranslated?.court_level ? normalizeArabicText(analysis.metadataTranslated.court_level) : prev.court_level_ar,
            // Keep original French content, don't replace it
            keywords: (() => {
              const existing = (prev.keywords || []).map(k => k.trim()).filter(k => k && !/[\u0600-\u06FF]/.test(k));
              const newKeys = (analysis.existingKeywords || []).map(k => k.trim()).filter(k => k && !/[\u0600-\u06FF]/.test(k));
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
              const existing = (prev.keywords_ar || []).map(k => normalizeArabicText(k.trim())).filter(k => k && /[\u0600-\u06FF]/.test(k));
              const newKeys = (analysis.translatedKeywords || []).map(k => normalizeArabicText(k.trim())).filter(k => k && /[\u0600-\u06FF]/.test(k));
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
              court_category_type_ar: suggestedCourtType.name_ar || null
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
          title: "Analyse IA terminée",
          description: `Analyse, extraction des métadonnées, classifications automatiques et traduction terminées en ${isPrimaryArabic ? 'arabe → français' : 'français → arabe'}.`,
        });
      } else {
        throw new Error(data.error || 'Analyse échouée');
      }
    } catch (error) {
      console.error('AI Analysis error:', error);
      toast({
        title: "Erreur d'analyse IA",
        description: error.message || "Impossible d'analyser le document.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editedData.id) {
        // Prepare and validate data
        const updateData = {
          title: editedData.title?.trim() || '',
          title_ar: editedData.title_ar?.trim() || null,
          subtitle: editedData.subtitle?.trim() || null,
          subtitle_ar: editedData.subtitle_ar?.trim() || null,
          summary: editedData.summary?.trim() || null,
          summary_ar: editedData.summary_ar?.trim() || null,
          content: editedData.content || '',
          translated_content: translatedContent?.trim() || null,
          keywords: Array.isArray(editedData.keywords) ? editedData.keywords.filter(k => k && k.trim()) : [],
          keywords_ar: Array.isArray(editedData.keywords_ar) ? editedData.keywords_ar.filter(k => k && k.trim()) : [],
          document_type_id: editedData.document_type_id || null,
          language: editedData.language || 'fr',
          status: 'draft' // Save as draft
          // Note: updated_at is handled automatically by database trigger
        };

        console.log('Attempting to save document with data:', updateData);

        // Update existing document  
        const fullUpdateData = {
          ...updateData,
          author: editedData.author?.trim() || null,
          author_ar: editedData.author_ar?.trim() || null,
          court: editedData.court?.trim() || null,
          court_ar: editedData.court_ar?.trim() || null,
          court_category_type: editedData.court_category_type?.trim() || null,
          court_category_type_ar: editedData.court_category_type_ar?.trim() || null,
          court_level: editedData.court_level?.trim() || null,
          court_level_ar: editedData.court_level_ar?.trim() || null,
          case_number: editedData.case_number?.trim() || null,
          year: editedData.year || null,
          plaintiff: editedData.plaintiff?.trim() || null,
          plaintiff_ar: editedData.plaintiff_ar?.trim() || null,
          defendant: editedData.defendant?.trim() || null,
          defendant_ar: editedData.defendant_ar?.trim() || null,
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
    const keyword = language === 'fr' ? newKeyword.trim() : newKeywordAr.trim();
    const field = language === 'fr' ? 'keywords' : 'keywords_ar';
    
    if (keyword && !editedData[field]?.includes(keyword)) {
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
      // Normalize all Arabic fields
      const cleaned = {
        ...editedData,
        title_ar: editedData.title_ar ? normalizeArabicText(editedData.title_ar) : editedData.title_ar,
        subtitle_ar: editedData.subtitle_ar ? normalizeArabicText(editedData.subtitle_ar) : editedData.subtitle_ar,
        content: editedData.language === 'ar' && editedData.content ? normalizeArabicText(editedData.content) : editedData.content,
        textual_metadata: editedData.language === 'ar' && editedData.textual_metadata ? normalizeArabicText(editedData.textual_metadata) : editedData.textual_metadata,
        summary_ar: editedData.summary_ar ? normalizeArabicText(editedData.summary_ar) : editedData.summary_ar,
        keywords_ar: editedData.keywords_ar?.map(k => normalizeArabicText(k)),
        author_ar: editedData.author_ar ? normalizeArabicText(editedData.author_ar) : editedData.author_ar,
        court_ar: editedData.court_ar ? normalizeArabicText(editedData.court_ar) : editedData.court_ar,
        plaintiff_ar: editedData.plaintiff_ar ? normalizeArabicText(editedData.plaintiff_ar) : editedData.plaintiff_ar,
        defendant_ar: editedData.defendant_ar ? normalizeArabicText(editedData.defendant_ar) : editedData.defendant_ar,
        court_level_ar: editedData.court_level_ar ? normalizeArabicText(editedData.court_level_ar) : editedData.court_level_ar,
        court_category_type_ar: editedData.court_category_type_ar ? normalizeArabicText(editedData.court_category_type_ar) : editedData.court_category_type_ar,
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
            </h3>
            <div className="flex items-center space-x-2">
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
          
          {editedData.page_contents.find(p => p.pageNumber === currentPage) && (
            <div 
              className="prose prose-sm max-w-none p-6 border rounded bg-muted/30 min-h-[500px]"
              dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
            >
              <div className="flex items-center justify-between mb-4 pb-2 border-b">
                <h4 className="font-semibold text-base m-0">
                  Page {currentPage}
                </h4>
                {editedData.page_contents.find(p => p.pageNumber === currentPage)?.confidence && (
                  <Badge variant="outline">
                    Confiance: {Math.round((editedData.page_contents.find(p => p.pageNumber === currentPage)?.confidence || 0) * 100)}%
                  </Badge>
                )}
              </div>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {editedData.page_contents.find(p => p.pageNumber === currentPage)?.content || 'Contenu non disponible'}
              </div>
            </div>
          )}
          
          {/* Pages overview */}
          <div className="mt-6">
            <h4 className="text-sm font-semibold mb-3">Aperçu des pages</h4>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {editedData.page_contents.map((page) => (
                <Button
                  key={page.pageNumber}
                  variant={currentPage === page.pageNumber ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page.pageNumber)}
                  className="h-8 w-12 text-xs"
                >
                  {page.pageNumber}
                </Button>
              ))}
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
                                setEditedData(prev => ({ ...prev, court_category_type_ar: courtType.name_ar }));
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
                              setEditedData(prev => ({ ...prev, court_category_type_ar: value }));
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
                  <Label className="text-sm font-medium">
                    {currentLanguage === 'ar' ? 'الكلمات المفاتيح' : 'Mots-clés'}
                  </Label>
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
                        {keyword}
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
                  <h4 className="font-semibold text-base" dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}>
                    {currentLanguage === 'ar' && editedData.title_ar ? editedData.title_ar : editedData.title}
                  </h4>
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
