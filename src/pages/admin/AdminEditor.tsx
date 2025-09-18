import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload, FileText } from 'lucide-react';
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
  const [currentDocument, setCurrentDocument] = useState<DocumentData | null>(null);
  const [processedDocuments, setProcessedDocuments] = useState<DocumentData[]>([]);
  const [showUploader, setShowUploader] = useState(true);

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
    setCurrentDocument(null);
    setProcessedDocuments([]);
    setShowUploader(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Éditeur de Documents
          </h1>
          <p className="text-muted-foreground">
            Téléchargez et éditez des documents avec l'aide de l'IA
          </p>
        </div>
        
        {(currentDocument || processedDocuments.length > 0) && (
          <Button
            variant="outline"
            onClick={handleNewDocument}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Nouveaux documents</span>
          </Button>
        )}
      </div>

      {showUploader ? (
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