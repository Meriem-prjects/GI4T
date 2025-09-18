import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, X, Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PdfToImages from './PdfToImages';

interface UploadFile {
  file: File;
  id: string;
  status: 'pending' | 'converting' | 'processing' | 'completed' | 'error';
  progress: number;
  result?: any;
  error?: string;
  images?: string[];
  isPdf?: boolean;
  onPdfComplete?: (images: string[]) => void;
  onPdfError?: (error: string) => void;
  onPdfProgress?: (progress: number) => void;
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

interface BatchDocumentUploaderProps {
  onDocumentsProcessed: (documents: any[]) => void;
}

const BatchDocumentUploader: React.FC<BatchDocumentUploaderProps> = ({ onDocumentsProcessed }) => {
  const { toast } = useToast();
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryNameAr, setNewCategoryNameAr] = useState('');
  const [newDocumentTypeName, setNewDocumentTypeName] = useState('');
  const [newDocumentTypeNameAr, setNewDocumentTypeNameAr] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [showNewDocumentType, setShowNewDocumentType] = useState(false);

  // Load categories and document types
  React.useEffect(() => {
    loadCategories();
    loadDocumentTypes();
  }, []);

  const loadCategories = async () => {
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
      console.log('Categories loaded:', data);
      setCategories(data || []);
    }
  };

  const loadDocumentTypes = async () => {
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
      console.log('Document types loaded:', data);
      setDocumentTypes(data || []);
    }
  };

  const createCategory = async () => {
    if (!newCategoryName.trim()) return;

    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: newCategoryName,
        name_ar: newCategoryNameAr || null,
        color: '#3B82F6'
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer la catégorie.",
        variant: "destructive",
      });
    } else {
      setCategories([...categories, data]);
      setSelectedCategory(data.id);
      setNewCategoryName('');
      setNewCategoryNameAr('');
      setShowNewCategory(false);
      toast({
        title: "Succès",
        description: "Catégorie créée avec succès.",
      });
    }
  };

  const createDocumentType = async () => {
    if (!newDocumentTypeName.trim()) return;

    const { data, error } = await supabase
      .from('document_types')
      .insert({
        name: newDocumentTypeName,
        name_ar: newDocumentTypeNameAr || null,
        description: `Type de document: ${newDocumentTypeName}`
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le type de document.",
        variant: "destructive",
      });
    } else {
      setDocumentTypes([...documentTypes, data]);
      setSelectedDocumentType(data.id);
      setNewDocumentTypeName('');
      setNewDocumentTypeNameAr('');
      setShowNewDocumentType(false);
      toast({
        title: "Succès",
        description: "Type de document créé avec succès.",
      });
     }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    const acceptedTypes = [
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
      'application/msword', 
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/bmp',
      'image/tiff'
    ];
    
    const newFiles: UploadFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!acceptedTypes.includes(file.type)) {
        toast({
          title: "Type de fichier non supporté",
          description: `${file.name} n'est pas un type de fichier supporté.`,
          variant: "destructive",
        });
        continue;
      }

      if (file.size > 20 * 1024 * 1024) { // 20MB limit
        toast({
          title: "Fichier trop volumineux",
          description: `${file.name} dépasse la limite de 20MB.`,
          variant: "destructive",
        });
        continue;
      }

      newFiles.push({
        file,
        id: Math.random().toString(36).substring(7),
        status: 'pending',
        progress: 0,
        isPdf: file.type === 'application/pdf'
      });
    }

    setUploadFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== id));
  };

  const processAllFiles = async () => {
    if (!selectedCategory || !selectedDocumentType) {
      toast({
        title: "Configuration manquante",
        description: "Veuillez sélectionner une catégorie et un type de document.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    const processedDocuments = [];

    try {
      for (const uploadFile of uploadFiles) {
        if (uploadFile.status !== 'pending') continue;

        try {
          if (uploadFile.isPdf) {
            // Traitement PDF : conversion en images d'abord
            await processPdfFile(uploadFile, selectedCategory, selectedDocumentType, processedDocuments);
          } else {
            // Traitement normal pour les autres fichiers
            await processRegularFile(uploadFile, selectedCategory, selectedDocumentType, processedDocuments);
          }
        } catch (error) {
          console.error(`Error processing ${uploadFile.file.name}:`, error);
          setUploadFiles(prev => prev.map(f => 
            f.id === uploadFile.id ? { 
              ...f, 
              status: 'error', 
              error: error instanceof Error ? error.message : 'Unknown error'
            } : f
          ));
        }
      }

      if (processedDocuments.length > 0) {
        onDocumentsProcessed(processedDocuments);
        toast({
          title: "Documents traités",
          description: `${processedDocuments.length} document(s) traité(s) avec succès.`,
        });
      }

    } finally {
      setIsProcessing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const processPdfFile = async (uploadFile: UploadFile, categoryId: string, documentTypeId: string, processedDocuments: any[]) => {
    // Étape 1: Conversion PDF → Images
    setUploadFiles(prev => prev.map(f => 
      f.id === uploadFile.id ? { ...f, status: 'converting', progress: 5 } : f
    ));

    return new Promise<void>((resolve, reject) => {
      const handlePdfConversion = async (images: string[]) => {
        try {
          // Sauvegarder les images dans l'uploadFile
          setUploadFiles(prev => prev.map(f => 
            f.id === uploadFile.id ? { ...f, images, progress: 20 } : f
          ));

          // Étape 2: OCR de chaque image
          setUploadFiles(prev => prev.map(f => 
            f.id === uploadFile.id ? { ...f, status: 'processing', progress: 25 } : f
          ));

          const ocrResults = [];
          let combinedContent = '';
          let detectedLanguage = 'fr';

          for (let i = 0; i < images.length; i++) {
            const image = images[i];
            
            // Update progress for current page
            const pageProgress = 25 + ((i / images.length) * 60);
            setUploadFiles(prev => prev.map(f => 
              f.id === uploadFile.id ? { ...f, progress: pageProgress } : f
            ));

            try {
              // Convertir base64 en blob pour l'OCR
              const response = await fetch(image);
              const blob = await response.blob();
              
              const formData = new FormData();
              formData.append('file', blob, `page-${i + 1}.png`);

              const { data: ocrResult, error: ocrError } = await supabase.functions.invoke('image-ocr', {
                body: formData
              });

              if (ocrError) {
                console.error(`OCR error for page ${i + 1}:`, ocrError);
                continue;
              }

              if (ocrResult.success) {
                ocrResults.push({
                  page: i + 1,
                  content: ocrResult.text,
                  language: ocrResult.language,
                  confidence: ocrResult.confidence
                });
                
                combinedContent += `\n\n--- Page ${i + 1} ---\n${ocrResult.text}`;
                
                if (i === 0) {
                  detectedLanguage = ocrResult.language;
                }
              }
            } catch (pageError) {
              console.error(`Error processing page ${i + 1}:`, pageError);
            }
          }

          // Étape 3: Créer le document final
          setUploadFiles(prev => prev.map(f => 
            f.id === uploadFile.id ? { ...f, progress: 90 } : f
          ));

          const documentData = {
            title: uploadFile.file.name.replace('.pdf', ''),
            content: combinedContent.trim(),
            summary: combinedContent.substring(0, 500) + '...',
            keywords: [],
            language: detectedLanguage,
            originalFileName: uploadFile.file.name,
            category_id: categoryId,
            document_type_id: documentTypeId,
            fullContent: combinedContent.trim(),
            page_contents: ocrResults
          };

          // Update status to completed
          setUploadFiles(prev => prev.map(f => 
            f.id === uploadFile.id ? { 
              ...f, 
              status: 'completed', 
              progress: 100, 
              result: documentData
            } : f
          ));

          processedDocuments.push(documentData);
          resolve();

        } catch (error) {
          reject(error);
        }
      };

      const handlePdfError = (error: string) => {
        reject(new Error(error));
      };

      const handlePdfProgress = (progress: number) => {
        const adjustedProgress = 5 + (progress * 0.15); // 5% to 20%
        setUploadFiles(prev => prev.map(f => 
          f.id === uploadFile.id ? { ...f, progress: adjustedProgress } : f
        ));
      };

      // Déclencher la conversion (le composant PdfToImages sera rendu dans l'UI)
      setUploadFiles(prev => prev.map(f => 
        f.id === uploadFile.id ? { 
          ...f, 
          onPdfComplete: handlePdfConversion,
          onPdfError: handlePdfError,
          onPdfProgress: handlePdfProgress
        } : f
      ));
    });
  };

  const processRegularFile = async (uploadFile: UploadFile, categoryId: string, documentTypeId: string, processedDocuments: any[]) => {
    // Update status to processing
    setUploadFiles(prev => prev.map(f => 
      f.id === uploadFile.id ? { ...f, status: 'processing', progress: 10 } : f
    ));

    // Use upload-document function for regular processing
    const formData = new FormData();
    formData.append('file', uploadFile.file);
    formData.append('categoryId', categoryId);
    formData.append('documentTypeId', documentTypeId);

    // Update progress
    setUploadFiles(prev => prev.map(f => 
      f.id === uploadFile.id ? { ...f, progress: 30 } : f
    ));

    const { data: uploadResult, error: uploadError } = await supabase.functions.invoke('upload-document', {
      body: formData
    });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    if (!uploadResult.success) {
      throw new Error(uploadResult.error || 'Upload failed');
    }

    // Update progress
    setUploadFiles(prev => prev.map(f => 
      f.id === uploadFile.id ? { ...f, progress: 90 } : f
    ));

    // Update status to completed
    setUploadFiles(prev => prev.map(f => 
      f.id === uploadFile.id ? { 
        ...f, 
        status: 'completed', 
        progress: 100, 
        result: uploadResult.document
      } : f
    ));

    processedDocuments.push(uploadResult.document);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'converting':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'completed':
        return <div className="h-4 w-4 rounded-full bg-green-500" />;
      case 'error':
        return <div className="h-4 w-4 rounded-full bg-red-500" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'converting':
        return 'Conversion PDF...';
      case 'processing':
        return 'Traitement OCR...';
      case 'completed':
        return 'Terminé';
      case 'error':
        return 'Erreur';
      default:
        return 'En attente';
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Configuration des documents</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="document-type">Type de document</Label>
            <Select value={selectedDocumentType} onValueChange={setSelectedDocumentType}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name} {type.name_ar && `/ ${type.name_ar}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Catégorie</Label>
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="flex-1">
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
                        {category.name} {category.name_ar && `/ ${category.name_ar}`}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowNewCategory(!showNewCategory)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {showNewCategory && (
          <Card className="p-4 space-y-4">
            <h4 className="font-medium">Créer une nouvelle catégorie</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-category-name">Nom (Français)</Label>
                <Input
                  id="new-category-name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Ex: Droit du travail"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-category-name-ar">Nom (Arabe)</Label>
                <Input
                  id="new-category-name-ar"
                  value={newCategoryNameAr}
                  onChange={(e) => setNewCategoryNameAr(e.target.value)}
                  placeholder="Ex: قانون العمل"
                  dir="rtl"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={createCategory} disabled={!newCategoryName.trim()}>
                Créer
              </Button>
              <Button variant="outline" onClick={() => setShowNewCategory(false)}>
                Annuler
              </Button>
            </div>
          </Card>
        )}
      </Card>

      {/* Upload Section */}
      <Card className="p-6">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Glissez-déposez vos documents ici
          </h3>
          <p className="text-muted-foreground mb-4">
            Ou cliquez pour sélectionner plusieurs fichiers
          </p>
          <Input
            type="file"
            multiple
            accept=".pdf,.docx,.doc,.txt,.jpg,.jpeg,.png,.webp,.gif,.bmp,.tiff"
            onChange={handleChange}
            className="hidden"
            id="file-upload"
          />
          <Label htmlFor="file-upload">
            <Button variant="outline" className="cursor-pointer" asChild>
              <span>Sélectionner des fichiers</span>
            </Button>
          </Label>
          <p className="text-sm text-muted-foreground mt-2">
            PDF, Word, TXT, Images (JPG, PNG, WEBP) - Max 20MB par fichier
          </p>
        </div>
      </Card>

      {/* Files List */}
      {uploadFiles.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              Fichiers à traiter ({uploadFiles.length})
            </h3>
            <Button 
              onClick={processAllFiles}
              disabled={isProcessing || !selectedCategory || !selectedDocumentType}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Traitement...
                </>
              ) : (
                'Traiter tous les fichiers'
              )}
            </Button>
          </div>

          <div className="space-y-3">
            {uploadFiles.map((uploadFile) => (
              <div key={uploadFile.id} className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3 flex-1">
                    {getStatusIcon(uploadFile.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {uploadFile.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(uploadFile.file.size)}
                      </p>
                      {(uploadFile.status === 'processing' || uploadFile.status === 'converting') && (
                        <Progress value={uploadFile.progress} className="w-full mt-2" />
                      )}
                      {uploadFile.error && (
                        <p className="text-xs text-red-500 mt-1">{uploadFile.error}</p>
                      )}
                    </div>
                    <Badge variant={
                      uploadFile.status === 'completed' ? 'default' :
                      uploadFile.status === 'error' ? 'destructive' :
                      (uploadFile.status === 'processing' || uploadFile.status === 'converting') ? 'secondary' : 'outline'
                    }>
                      {getStatusText(uploadFile.status)}
                    </Badge>
                  </div>
                  
                  {uploadFile.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(uploadFile.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* PDF Converter Component */}
                {uploadFile.isPdf && uploadFile.status === 'converting' && uploadFile.onPdfComplete && (
                  <PdfToImages
                    file={uploadFile.file}
                    onComplete={uploadFile.onPdfComplete}
                    onProgress={uploadFile.onPdfProgress || (() => {})}
                    onError={uploadFile.onPdfError || (() => {})}
                  />
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default BatchDocumentUploader;