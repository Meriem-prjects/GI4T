import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Maximize2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

interface PDFViewerProps {
  fileUrl?: string;
  title?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ fileUrl, title }) => {
  const [scale, setScale] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const nextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const prevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  return (
    <Card className="p-4">
      {/* Controls */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={prevPage} disabled={currentPage <= 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} sur {totalPages}
          </span>
          <Button variant="outline" size="sm" onClick={nextPage} disabled={currentPage >= totalPages}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={zoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button variant="outline" size="sm" onClick={zoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Maximize2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh]">
              <div className="overflow-auto">
                <iframe
                  src={`${fileUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                  className="w-full h-[80vh] border-0"
                  title={title || "Document PDF"}
                />
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="overflow-auto max-h-[600px] border rounded">
        <div 
          className="flex justify-center p-4"
          style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
        >
          <iframe
            src={`${fileUrl}#page=${currentPage}&toolbar=0&navpanes=0&scrollbar=0`}
            className="w-full min-h-[700px] border-0"
            title={title || "Document PDF"}
            onLoad={(e) => {
              // Try to get total pages from PDF (this is a simplified approach)
              // In a real implementation, you'd use a PDF.js library for better control
              const iframe = e.target as HTMLIFrameElement;
              try {
                // This is a basic approach - in production, use PDF.js for proper page counting
                setTotalPages(1); // Default to 1, would need PDF.js for accurate count
              } catch (error) {
                console.log('Could not determine page count');
              }
            }}
          />
        </div>
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