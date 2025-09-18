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
import ProgressTracker from './ProgressTracker';
// PdfToImages no longer needed - using server-side pdfRest conversion

interface UploadFile {
  file: File;
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  result?: any;
  error?: string;
  jobId?: string; // Add job ID for progress tracking
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

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "Fichier trop volumineux",
          description: `${file.name} dépasse la limite de 10MB.`,
          variant: "destructive",
        });
        continue;
      }

      newFiles.push({
        file,
        id: Math.random().toString(36).substring(7),
        status: 'pending',
        progress: 0
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
    const processedDocuments: any[] = [];

    try {
      for (const uploadFile of uploadFiles) {
        if (uploadFile.status !== 'pending') continue;

        try {
          await processFile(uploadFile, selectedCategory, selectedDocumentType, processedDocuments);
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

      // Check if all files are processed (completed or have errors)
      const allProcessed = uploadFiles.every(f => f.status === 'completed' || f.status === 'error');
      
      // Only call onDocumentsProcessed for files that completed successfully
      const completedDocuments = uploadFiles
        .filter(f => f.status === 'completed' && f.result)
        .map(f => f.result);
      
      if (completedDocuments.length > 0) {
        onDocumentsProcessed(completedDocuments);
        toast({
          title: "Documents traités",
          description: `${completedDocuments.length} document(s) traité(s) avec succès.`,
        });
      }

    } finally {
      setIsProcessing(false);
    }
  };

  // Callback to handle completion from ProgressTracker
  const handleFileCompletion = (uploadFileId: string, result: any) => {
    console.log('File completed via progress tracker:', uploadFileId);
    
    // Update the upload file status
    setUploadFiles(prev => prev.map(f => 
      f.id === uploadFileId ? { 
        ...f, 
        status: 'completed', 
        progress: 100, 
        result: result
      } : f
    ));

    // Check if this was the last file processing and update processed documents
    setTimeout(() => {
      const currentFiles = uploadFiles.find(f => f.id === uploadFileId);
      if (currentFiles?.result) {
        const allCompleted = uploadFiles.every(f => f.status === 'completed' || f.status === 'error');
        const completedDocuments = uploadFiles
          .filter(f => f.status === 'completed' && f.result)
          .map(f => f.result);
        
        if (allCompleted && completedDocuments.length > 0) {
          onDocumentsProcessed(completedDocuments);
          toast({
            title: "Tous les documents traités",
            description: `${completedDocuments.length} document(s) traité(s) avec succès.`,
          });
        }
      }
    }, 100);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const processFile = async (uploadFile: UploadFile, categoryId: string, documentTypeId: string, processedDocuments: any[]) => {
    // Update status to processing
    setUploadFiles(prev => prev.map(f => 
      f.id === uploadFile.id ? { ...f, status: 'processing', progress: 10 } : f
    ));

    // Use upload-document function with progress tracking
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

    // Extract job ID from response
    const jobId = uploadResult.jobId;
    
    if (jobId) {
      // Update file with job ID for progress tracking
      setUploadFiles(prev => prev.map(f => 
        f.id === uploadFile.id ? { 
          ...f, 
          jobId: jobId,
          progress: 40,
          status: 'processing'
        } : f
      ));
    } else {
      // No job ID - mark as completed immediately
      setUploadFiles(prev => prev.map(f => 
        f.id === uploadFile.id ? { 
          ...f, 
          status: 'completed', 
          progress: 100, 
          result: uploadResult.document
        } : f
      ));
      
      processedDocuments.push(uploadResult.document);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
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
      case 'processing':
        return 'Traitement en cours...';
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
            PDF, Word, TXT, Images (JPG, PNG, WEBP) - Max 10MB par fichier
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
              <div key={uploadFile.id}>
                {uploadFile.status === 'processing' && uploadFile.jobId ? (
                  <ProgressTracker
                    jobId={uploadFile.jobId}
                    fileName={uploadFile.file.name}
                    onComplete={(result) => handleFileCompletion(uploadFile.id, result)}
                    onError={(error) => {
                      setUploadFiles(prev => prev.map(f => 
                        f.id === uploadFile.id ? { 
                          ...f, 
                          status: 'error', 
                          error: error
                        } : f
                      ));
                    }}
                  />
                ) : (
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
                        {(uploadFile.status === 'processing') && (
                          <Progress value={uploadFile.progress} className="w-full mt-2" />
                        )}
                        {uploadFile.error && (
                          <p className="text-xs text-red-500 mt-1">{uploadFile.error}</p>
                        )}
                      </div>
                      <Badge variant={
                        uploadFile.status === 'completed' ? 'default' :
                        uploadFile.status === 'error' ? 'destructive' :
                        uploadFile.status === 'processing' ? 'secondary' : 'outline'
                      }>
                        {getStatusText(uploadFile.status)}
                      </Badge>
                    </div>
                    
                    {uploadFile.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(uploadFile.id)}
                        className="ml-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
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