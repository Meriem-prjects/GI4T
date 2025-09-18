import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { FileText, Loader2 } from 'lucide-react';

// Configuration PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PdfToImagesProps {
  file: File;
  onComplete: (images: string[]) => void;
  onProgress: (progress: number) => void;
  onError: (error: string) => void;
}

interface PageStatus {
  pageNumber: number;
  status: 'pending' | 'processing' | 'completed';
  progress: number;
}

const PdfToImages: React.FC<PdfToImagesProps> = ({ 
  file, 
  onComplete, 
  onProgress, 
  onError 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [pages, setPages] = useState<PageStatus[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  React.useEffect(() => {
    if (file) {
      convertPdfToImages();
    }
  }, [file]);

  const convertPdfToImages = async () => {
    setIsProcessing(true);
    try {
      const fileReader = new FileReader();
      
      fileReader.onload = async () => {
        try {
          const typedarray = new Uint8Array(fileReader.result as ArrayBuffer);
          const pdf = await pdfjsLib.getDocument(typedarray).promise;
          const numPages = pdf.numPages;
          
          setTotalPages(numPages);
          
          // Initialize page statuses
          const initialPages = Array.from({ length: numPages }, (_, i) => ({
            pageNumber: i + 1,
            status: 'pending' as const,
            progress: 0
          }));
          setPages(initialPages);
          
          const images: string[] = [];
          
          for (let i = 1; i <= numPages; i++) {
            setCurrentPage(i);
            
            // Update page status to processing
            setPages(prev => prev.map(p => 
              p.pageNumber === i ? { ...p, status: 'processing', progress: 0 } : p
            ));
            
            try {
              const page = await pdf.getPage(i);
              const viewport = page.getViewport({ scale: 5 }); // Haute qualité pour OCR
              
              // Créer un canvas temporaire
              const canvas = document.createElement('canvas');
              const context = canvas.getContext('2d');
              if (!context) {
                throw new Error('Impossible de créer le contexte canvas');
              }
              
              canvas.width = viewport.width;
              canvas.height = viewport.height;
              
              // Update progress
              setPages(prev => prev.map(p => 
                p.pageNumber === i ? { ...p, progress: 50 } : p
              ));
              
              // Rendu de la page dans le canvas
              await page.render({ 
                canvasContext: context, 
                viewport,
                canvas 
              }).promise;
              
              // Convertir en image (dataURL)
              const imgData = canvas.toDataURL('image/png', 0.95);
              images.push(imgData);
              
              // Update page status to completed
              setPages(prev => prev.map(p => 
                p.pageNumber === i ? { ...p, status: 'completed', progress: 100 } : p
              ));
              
              // Update overall progress
              const overallProgress = (i / numPages) * 100;
              onProgress(overallProgress);
              
            } catch (pageError) {
              console.error(`Erreur page ${i}:`, pageError);
              setPages(prev => prev.map(p => 
                p.pageNumber === i ? { ...p, status: 'pending', progress: 0 } : p
              ));
            }
          }
          
          if (images.length > 0) {
            onComplete(images);
          } else {
            onError('Aucune page n\'a pu être convertie');
          }
          
        } catch (error) {
          console.error('Erreur conversion PDF:', error);
          onError(`Erreur lors de la conversion: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
      };
      
      fileReader.onerror = () => {
        onError('Erreur lors de la lecture du fichier PDF');
      };
      
      fileReader.readAsArrayBuffer(file);
      
    } catch (error) {
      console.error('Erreur générale:', error);
      onError(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isProcessing && pages.length === 0) {
    return null;
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center space-x-3">
        <FileText className="h-5 w-5 text-primary" />
        <div className="flex-1">
          <h4 className="font-medium">Conversion PDF → Images</h4>
          <p className="text-sm text-muted-foreground">
            {currentPage > 0 && totalPages > 0 
              ? `Page ${currentPage} sur ${totalPages}` 
              : 'Initialisation...'
            }
          </p>
        </div>
        {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
      </div>
      
      {totalPages > 0 && (
        <Progress 
          value={(currentPage / totalPages) * 100} 
          className="w-full"
        />
      )}
      
      {pages.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {pages.map((page) => (
            <div
              key={page.pageNumber}
              className={`
                flex items-center justify-center w-8 h-8 rounded text-xs font-medium
                ${page.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                ${page.status === 'processing' ? 'bg-blue-100 text-blue-800' : ''}
                ${page.status === 'pending' ? 'bg-gray-100 text-gray-600' : ''}
              `}
            >
              {page.status === 'processing' ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                page.pageNumber
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default PdfToImages;