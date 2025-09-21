import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload, FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import BatchDocumentUploader from '@/components/admin/BatchDocumentUploader';
import DocumentEditor from '@/components/admin/DocumentEditor';

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
}

const AdminEditor = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentDocument, setCurrentDocument] = useState<DocumentData | null>(null);
  const [processedDocuments, setProcessedDocuments] = useState<DocumentData[]>([]);
  const [showUploader, setShowUploader] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingExisting, setIsEditingExisting] = useState(false);

  // Load existing document if doc parameter is present
  useEffect(() => {
    const docId = searchParams.get('doc');
    if (docId) {
      loadExistingDocument(docId);
    }
  }, [searchParams]);

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
        summary: document.summary || '',
        keywords: document.keywords || [],
        language: document.language || 'fr',
        originalFileName: document.original_filename,
        category_id: document.category_id,
        document_type_id: document.document_type_id,
        file_url: document.file_url,
        pdf_url: document.pdf_url,
        fullContent: document.content,
      };

      setCurrentDocument(mappedDocument);
      setShowUploader(false);
      
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

  const handleDocumentsProcessed = (documents: DocumentData[]) => {
    setProcessedDocuments(documents);
    if (documents.length === 1) {
      setCurrentDocument(documents[0]);
      setShowUploader(false);
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isEditingExisting ? 'Édition de Document' : 'Éditeur de Documents'}
          </h1>
          <p className="text-muted-foreground">
            {isEditingExisting 
              ? 'Modifiez le contenu et les métadonnées du document'
              : 'Téléchargez et éditez des documents avec l\'aide de l\'IA'
            }
          </p>
        </div>
        
        {(currentDocument || processedDocuments.length > 0) && (
          <Button
            variant="outline"
            onClick={handleNewDocument}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{isEditingExisting ? 'Retour aux contenus' : 'Nouveaux documents'}</span>
          </Button>
        )}
      </div>

      {isLoading ? (
        <Card className="p-8">
          <div className="flex items-center justify-center space-x-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-muted-foreground">Chargement du document...</p>
          </div>
        </Card>
      ) : showUploader ? (
        <BatchDocumentUploader onDocumentsProcessed={handleDocumentsProcessed} />
      ) : currentDocument ? (
        <DocumentEditor 
          documentData={currentDocument}
          onSave={handleSave}
        />
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