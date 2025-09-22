import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PDFViewerProps {
  fileUrl?: string;
  title?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ fileUrl, title }) => {
  if (!fileUrl) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Aucun fichier PDF à afficher</p>
      </Card>
    );
  }

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = title || 'document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openInNewTab = async () => {
    try {
      // Télécharger le fichier comme blob pour éviter les restrictions de sécurité
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement du fichier');
      }
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      // Ouvrir le blob dans un nouvel onglet
      const newTab = window.open(blobUrl, '_blank');
      
      // Nettoyer l'URL du blob après un délai
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 1000);
      
      // Si l'ouverture échoue, fallback vers téléchargement
      if (!newTab) {
        handleDownload();
      }
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du PDF:', error);
      // Fallback vers le téléchargement normal
      handleDownload();
    }
  };

  return (
    <Card className="p-6">
      {/* Browser compatibility notice */}
      <Alert className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Certains navigateurs peuvent bloquer l'affichage des PDF. Utilisez les boutons ci-dessous pour télécharger ou ouvrir le document.
        </AlertDescription>
      </Alert>

      {/* Actions */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        <Button onClick={handleDownload} className="flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Télécharger le PDF</span>
        </Button>
        <Button variant="outline" onClick={openInNewTab} className="flex items-center space-x-2">
          <ExternalLink className="h-4 w-4" />
          <span>Ouvrir dans un nouvel onglet</span>
        </Button>
      </div>

      {/* PDF Embed (fallback for browsers that support it) */}
      <div className="border rounded-lg overflow-hidden">
        <object
          data={fileUrl}
          type="application/pdf"
          width="100%"
          height="600"
          className="min-h-[600px]"
        >
          <div className="p-8 text-center bg-muted">
            <p className="text-muted-foreground mb-4">
              Votre navigateur ne peut pas afficher ce PDF directement.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Button onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Télécharger le PDF
              </Button>
              <Button variant="outline" onClick={openInNewTab}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Ouvrir dans un nouvel onglet
              </Button>
            </div>
          </div>
        </object>
      </div>

      {title && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-muted-foreground text-center">{title}</p>
        </div>
      )}
    </Card>
  );
};

export default PDFViewer;