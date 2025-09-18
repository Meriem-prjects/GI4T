import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import DocumentUploader from '@/components/admin/DocumentUploader';
import DocumentEditor from '@/components/admin/DocumentEditor';

interface DocumentData {
  content: string;
  title: string;
  summary: string;
  keywords: string[];
  language: string;
  originalFileName: string;
}

const AdminEditor = () => {
  const [currentDocument, setCurrentDocument] = useState<DocumentData | null>(null);
  const [showUploader, setShowUploader] = useState(true);

  const handleDocumentProcessed = (data: DocumentData) => {
    setCurrentDocument(data);
    setShowUploader(false);
  };

  const handleSave = (data: DocumentData) => {
    setCurrentDocument(data);
    // Here you would typically save to database
    console.log('Saving document:', data);
  };

  const handleNewDocument = () => {
    setCurrentDocument(null);
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
        
        {currentDocument && (
          <Button
            variant="outline"
            onClick={handleNewDocument}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Nouveau document</span>
          </Button>
        )}
      </div>

      {showUploader ? (
        <DocumentUploader onDocumentProcessed={handleDocumentProcessed} />
      ) : currentDocument ? (
        <DocumentEditor 
          documentData={currentDocument}
          onSave={handleSave}
        />
      ) : null}
    </div>
  );
};

export default AdminEditor;