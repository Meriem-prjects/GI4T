import { useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

interface ScanImageViewerProps {
  scanImages: string[];
  title?: string;
}

export const ScanImageViewer = ({ scanImages, title = "Document original" }: ScanImageViewerProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!scanImages || scanImages.length === 0) return null;

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % scanImages.length);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + scanImages.length) % scanImages.length);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = scanImages[currentPage];
    link.download = `decision-page-${currentPage + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="bg-card border rounded-lg p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-card-foreground">{title}</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Page {currentPage + 1} sur {scanImages.length}
          </span>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Télécharger
          </Button>
        </div>
      </div>

      {/* Thumbnail Gallery */}
      {scanImages.length > 1 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {scanImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index)}
              className={`flex-shrink-0 w-16 h-20 rounded border-2 overflow-hidden transition-all ${
                index === currentPage ? 'border-primary' : 'border-border hover:border-muted-foreground'
              }`}
            >
              <img
                src={image}
                alt={`Page ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Image Viewer */}
      <div className="relative bg-muted rounded-lg overflow-hidden">
        <div className="flex items-center justify-between p-3 bg-background border-b">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevPage}
              disabled={scanImages.length <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextPage}
              disabled={scanImages.length <= 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[60px] text-center">
              {zoom}%
            </span>
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>

            <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Plein écran
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-7xl w-full h-[90vh]">
                <div className="relative w-full h-full flex items-center justify-center">
                  <button
                    onClick={() => setIsFullscreen(false)}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 hover:bg-background"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <img
                    src={scanImages[currentPage]}
                    alt={`Page ${currentPage + 1}`}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="p-4 overflow-auto max-h-[600px]">
          <div 
            className="flex justify-center transition-transform duration-200"
            style={{ transform: `scale(${zoom / 100})` }}
          >
            <img
              src={scanImages[currentPage]}
              alt={`Page ${currentPage + 1} du document`}
              className="max-w-full shadow-lg rounded"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      {scanImages.length > 1 && (
        <div className="flex justify-center mt-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={prevPage}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Précédent
            </Button>
            <span className="text-sm text-muted-foreground px-4">
              {currentPage + 1} / {scanImages.length}
            </span>
            <Button variant="outline" size="sm" onClick={nextPage}>
              Suivant
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </section>
  );
};