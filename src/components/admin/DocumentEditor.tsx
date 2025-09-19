import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Save, Eye, EyeOff, X, AlertTriangle, FileText, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PDFViewer from './PDFViewer';

interface PageContent {
  pageNumber: number;
  content: string;
  confidence?: number;
}

interface DocumentData {
  id?: string;
  content: string;
  title: string;
  summary: string;
  keywords: string[];
  language: string;
  originalFileName: string;
  category_id?: string;
  document_type_id?: string;
  file_url?: string;
  pdf_url?: string;
  fullContent?: string;
  page_contents?: PageContent[];
  total_pages?: number;
  processed_pages?: number;
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
  const [editedData, setEditedData] = useState<DocumentData>(documentData);
  const [showPreview, setShowPreview] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [currentView, setCurrentView] = useState<'editor' | 'pdf' | 'pages'>('editor');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setEditedData(documentData);
    setHasChanges(false);
    loadCategories();
    loadDocumentTypes();
  }, [documentData]);

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

  const handleSave = async () => {
    try {
      if (editedData.id) {
        // Update existing document
        const { error } = await supabase
          .from('documents')
          .update({
            title: editedData.title,
            summary: editedData.summary,
            content: editedData.content,
            keywords: editedData.keywords,
            category_id: editedData.category_id,
            document_type_id: editedData.document_type_id,
            language: editedData.language
          })
          .eq('id', editedData.id);

        if (error) throw error;
      }

      onSave(editedData);
      toast({
        title: "Document sauvegardé",
        description: "Les modifications ont été enregistrées avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur de sauvegarde",
        description: "Impossible de sauvegarder le document.",
        variant: "destructive",
      });
    }
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !editedData.keywords.includes(newKeyword.trim())) {
      setEditedData(prev => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword.trim()]
      }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setEditedData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const getLanguageLabel = (lang: string) => {
    const labels = {
      'ar': 'العربية',
      'fr': 'Français',
      'en': 'English'
    };
    return labels[lang as keyof typeof labels] || lang;
  };

  const formatContent = (content: string) => {
    return content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n\n');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Éditeur de Document
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
          
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="mr-2 h-4 w-4" />
            Sauvegarder
          </Button>
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
              dir={editedData.language === 'ar' ? 'rtl' : 'ltr'}
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
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Titre</Label>
                  <Input
                    value={editedData.title}
                    onChange={(e) => setEditedData(prev => ({
                      ...prev,
                      title: e.target.value
                    }))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Catégorie</Label>
                  <Select
                    value={editedData.category_id || ''}
                    onValueChange={(value) => setEditedData(prev => ({
                      ...prev,
                      category_id: value
                    }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: category.color }}
                            />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      {documentTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Langue</Label>
                  <Select
                    value={editedData.language}
                    onValueChange={(value) => setEditedData(prev => ({
                      ...prev,
                      language: value
                    }))}
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

                <div>
                  <Label className="text-sm font-medium">Résumé</Label>
                  <Textarea
                    value={editedData.summary}
                    onChange={(e) => setEditedData(prev => ({
                      ...prev,
                      summary: e.target.value
                    }))}
                    className="mt-1"
                    rows={4}
                    dir={editedData.language === 'ar' ? 'rtl' : 'ltr'}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Mots-clés</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      placeholder="Nouveau mot-clé"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addKeyword();
                        }
                      }}
                    />
                    <Button onClick={addKeyword} disabled={!newKeyword.trim()}>
                      +
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2 p-2 border rounded min-h-[40px]">
                    {editedData.keywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {keyword}
                        <button
                          onClick={() => removeKeyword(keyword)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Content Column */}
          <div className="lg:col-span-2 space-y-6">
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
                  dir={editedData.language === 'ar' ? 'rtl' : 'ltr'}
                >
                  <h4 className="font-semibold text-base">{editedData.title}</h4>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {formatContent(editedData.fullContent || editedData.content)}
                  </div>
                </div>
              ) : (
                <Textarea
                  value={editedData.fullContent || editedData.content}
                  onChange={(e) => setEditedData(prev => ({
                    ...prev,
                    content: e.target.value,
                    fullContent: e.target.value
                  }))}
                  className="min-h-[600px] font-mono text-sm"
                  dir={editedData.language === 'ar' ? 'rtl' : 'ltr'}
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