import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, FileText, Loader2, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DocumentUploaderProps {
  onDocumentProcessed: (data: {
    content: string;
    title: string;
    summary: string;
    language: string;
    originalFileName: string;
  }) => void;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({ onDocumentProcessed }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFiles = useCallback(async (files: FileList) => {
    const file = files[0];
    if (!file) return;

    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Format non supporté",
        description: "Veuillez uploader un fichier PDF, Word ou texte.",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(file);
    setIsProcessing(true);

    try {
      toast({
        title: "Traitement en cours",
        description: "Analyse du document...",
      });

      // For now, we'll use a simple text extraction for demo
      // In a real implementation, you would upload the file and use document parsing
      let extractedContent = '';
      
      if (file.type === 'text/plain') {
        extractedContent = await file.text();
      } else {
        // For PDF and Word files, we'll show a placeholder
        // In production, you would implement proper document parsing
        extractedContent = `Document: ${file.name}\n\nContenu extrait du document ${file.name}.\n\nCeci est un exemple de contenu qui serait extrait d'un fichier ${file.type}.\n\nLe système supportera bientôt l'extraction complète du contenu des documents PDF et Word avec préservation de la structure (titres, sous-titres, paragraphes).`;
      }

      console.log('Document content extracted, length:', extractedContent.length);

      // Analyze with OpenAI
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('document-analysis', {
        body: {
          content: extractedContent,
          language: 'ar' // Default to Arabic, can be auto-detected
        }
      });

      if (analysisError) {
        console.error('Analysis error:', analysisError);
        throw new Error(analysisError.message || "Erreur lors de l'analyse IA");
      }

      console.log('Analysis result:', analysisData);

      // Call parent callback with processed data
      onDocumentProcessed({
        content: extractedContent,
        title: analysisData.title || file.name,
        summary: analysisData.summary || "Résumé non disponible",
        language: analysisData.language || 'ar',
        originalFileName: file.name
      });

      toast({
        title: "Document traité avec succès",
        description: "Le document a été analysé et est prêt pour l'édition.",
      });

    } catch (error) {
      console.error('Error processing document:', error);
      toast({
        title: "Erreur de traitement",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [onDocumentProcessed, toast]);

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
  }, [handleFiles]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const clearFile = () => {
    setUploadedFile(null);
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Télécharger un document
          </h3>
          <p className="text-sm text-muted-foreground">
            Formats supportés: PDF, Word (.doc, .docx), Texte (.txt)
          </p>
        </div>

        {!uploadedFile ? (
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleChange}
              accept=".pdf,.doc,.docx,.txt"
              disabled={isProcessing}
            />
            
            <div className="space-y-4">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Glissez-déposez votre document ici
                </p>
                <p className="text-xs text-muted-foreground">
                  ou cliquez pour sélectionner
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium text-foreground">{uploadedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(uploadedFile.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
            </div>
            
            {!isProcessing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFile}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {isProcessing && (
          <div className="flex items-center justify-center space-x-2 py-4">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">
              Traitement du document en cours...
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default DocumentUploader;