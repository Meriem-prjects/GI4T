import React, { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle, XCircle, FileText } from 'lucide-react';

interface ProcessingJob {
  id: string;
  file_name: string;
  file_size: number;
  status: string;
  progress: number;
  current_step: string | null;
  total_pages: number | null;
  processed_pages: number | null;
  error_message: string | null;
  result_data: any;
}

interface ProgressTrackerProps {
  jobId?: string;
  documentId?: string;
  fileName: string;
  onComplete?: (result: any) => void;
  onError?: (error: string) => void;
  pdfUrl?: string; // For resume functionality
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  jobId,
  documentId,
  fileName,
  onComplete,
  onError,
  pdfUrl
}) => {
  const [job, setJob] = useState<ProcessingJob | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [document, setDocument] = useState<any>(null);
  const [lastProgressUpdate, setLastProgressUpdate] = useState<number>(Date.now());
  const [showResumeButton, setShowResumeButton] = useState(false);
  const [isResuming, setIsResuming] = useState(false);

  useEffect(() => {
    if (!jobId) return;

    // Initial fetch
    fetchJob();

    // Set up real-time subscription
    const channel = supabase
      .channel('processing-progress')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'processing_jobs',
          filter: `id=eq.${jobId}`
        },
        (payload) => {
          console.log('Progress update received:', payload.new);
          setJob(payload.new as ProcessingJob);
          setLastProgressUpdate(Date.now());

          // Handle completion
          if (payload.new.status === 'completed') {
            fetchAndEmitDocument(jobId!);
          }

          // Handle errors
          if (payload.new.status === 'failed' && onError) {
            onError(payload.new.error_message || 'Processing failed');
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        setIsListening(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [jobId]);

  // Helper to fetch document data — prefer fetching by documentId
  // (works because /api/documents/:id is a single-row endpoint), and
  // fall back to filtering by processing_job_id only if docId is unknown.
  const fetchDocument = async (jobId: string) => {
    try {
      if (documentId) {
        const { data: doc, error } = await supabase
          .from('documents')
          .select('*')
          .eq('id', documentId)
          .maybeSingle();
        if (doc && !error) {
          setDocument(doc);
          return doc;
        }
      }
      const { data: doc, error: docError } = await (supabase as any)
        .from('documents')
        .select('*')
        .eq('processing_job_id', jobId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (doc && !docError) {
        setDocument(doc);
        return doc;
      }
    } catch (e) {
      console.error('Error fetching document:', e);
    }
    return null;
  };

  // Helper to fetch document once job completes
  const fetchAndEmitDocument = async (jobId: string) => {
    const doc = await fetchDocument(jobId);
    if (doc) {
      onComplete?.(doc);
    } else {
      onComplete?.(job?.result_data);
    }
  };

  const fetchJob = async () => {
    if (!jobId) return;

    try {
      const { data, error } = await supabase
        .from('processing_jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error) {
        console.error('Error fetching job:', error);
        return;
      }

      setJob(data);
      setLastProgressUpdate(Date.now());

      // Also fetch document data
      await fetchDocument(jobId);

      // Check if already completed
      if (data.status === 'completed') {
        fetchAndEmitDocument(jobId!);
      } else if (data.status === 'failed' && onError) {
        onError(data.error_message || 'Processing failed');
      }
    } catch (error) {
      console.error('Exception fetching job:', error);
    }
  };

  // Fallback polling in case realtime updates are not received
  useEffect(() => {
    if (!jobId) return;
    // Stop polling once job is done
    if (job?.status === 'completed' || job?.status === 'failed') return;

    const interval = window.setInterval(() => {
      fetchJob();
    }, 3000);

    return () => window.clearInterval(interval);
  }, [jobId, job?.status]);

  // Stall detection - show resume button if no progress for 2 minutes
  useEffect(() => {
    if (!jobId || !job || job.status !== 'processing') {
      setShowResumeButton(false);
      return;
    }

    const checkStall = () => {
      const timeSinceLastUpdate = Date.now() - lastProgressUpdate;
      const isStalled = timeSinceLastUpdate > 120000; // 2 minutes
      setShowResumeButton(isStalled && document?.processed_pages > 0);
    };

    const stallInterval = setInterval(checkStall, 30000); // Check every 30 seconds
    checkStall(); // Initial check

    return () => clearInterval(stallInterval);
  }, [jobId, job?.status, lastProgressUpdate, document?.processed_pages]);

  // Resume OCR processing
  const handleResume = async () => {
    if (!jobId || !pdfUrl || isResuming) return;

    setIsResuming(true);
    setShowResumeButton(false);

    try {
      const formData = new FormData();
      formData.append('pdfUrl', pdfUrl);
      formData.append('jobId', jobId);
      formData.append('filename', fileName);

      const { error } = await supabase.functions.invoke('pdf-ocr-batch', {
        body: formData
      });

      if (error) {
        console.error('Resume failed:', error);
        setShowResumeButton(true);
      }
    } catch (error) {
      console.error('Resume error:', error);
      setShowResumeButton(true);
    } finally {
      setIsResuming(false);
    }
  };

  const getStepDescription = (step: string | null): string => {
    if (!step) return 'Initialisation...';
    
    switch (step) {
      case 'initializing':
        return 'Initialisation du traitement...';
      case 'pdf_conversion':
        return 'Conversion PDF en images...';
      case 'ocr_starting':
        return 'Démarrage de l\'OCR...';
      case 'direct_pdf_ocr':
        return 'OCR direct du PDF...';
      case 'completed':
        return 'Traitement terminé';
      default:
        if (step.startsWith('ocr_page_')) {
          const pageNum = step.replace('ocr_page_', '');
          return `OCR page ${pageNum}${job?.total_pages ? `/${job.total_pages}` : ''}...`;
        }
        return step;
    }
  };

  const getStatusIcon = () => {
    if (!job) return <Loader2 className="h-4 w-4 animate-spin" />;
    
    switch (job.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = () => {
    if (!job) return <Badge variant="outline">En attente</Badge>;
    
    switch (job.status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-600">Terminé</Badge>;
      case 'failed':
        return <Badge variant="destructive">Erreur</Badge>;
      case 'processing':
        return <Badge variant="secondary">En cours</Badge>;
        default:
          return <Badge variant="outline">En attente</Badge>;
    }
  };

  const getSavedPagesInfo = () => {
    if (!document) return null;
    const saved = document.processed_pages || 0;
    const total = document.total_pages || job?.total_pages || 0;
    return { saved, total };
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!jobId) {
    return (
      <div className="flex items-center space-x-3 p-3 border rounded-lg">
        <FileText className="h-4 w-4 text-gray-500" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{fileName}</p>
          <p className="text-xs text-muted-foreground">En attente...</p>
        </div>
        <Badge variant="outline">Pas de suivi</Badge>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between p-3 border rounded-lg">
        <div className="flex items-center space-x-3 flex-1">
          {getStatusIcon()}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {job?.file_name || fileName}
            </p>
            <p className="text-xs text-muted-foreground">
              {job ? formatFileSize(job.file_size) : 'Taille inconnue'}
              {!isListening && ' • Connexion temps réel...'}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              {getStepDescription(job?.current_step)}
            </p>
            {job?.error_message && (
              <p className="text-xs text-red-500 mt-1">{job.error_message}</p>
            )}
          </div>
          {getStatusBadge()}
        </div>
      </div>

      {job && job.status === 'processing' && (
        <div className="px-3 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Progression</span>
            <span>{job.progress}%</span>
          </div>
          <Progress value={job.progress} className="h-2" />
          
          {(() => {
            const savedInfo = getSavedPagesInfo();
            if (savedInfo && savedInfo.total > 0) {
              return (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Pages sauvegardées</span>
                  <span className="font-medium text-green-600">{savedInfo.saved}/{savedInfo.total}</span>
                </div>
              );
            }
            if (job.processed_pages && job.total_pages) {
              return (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Pages traitées</span>
                  <span>{job.processed_pages}/{job.total_pages}</span>
                </div>
              );
            }
            return null;
          })()}

          {showResumeButton && pdfUrl && (
            <div className="pt-2">
              <button
                onClick={handleResume}
                disabled={isResuming}
                className="w-full px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResuming ? 'Reprise en cours...' : 'Reprendre le traitement'}
              </button>
            </div>
          )}
        </div>
      )}

      {job && job.status === 'failed' && document?.processed_pages > 0 && pdfUrl && (
        <div className="px-3 pt-2">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Pages sauvegardées</span>
            <span className="font-medium text-green-600">{document.processed_pages}/{document.total_pages || 'N/A'}</span>
          </div>
          <button
            onClick={handleResume}
            disabled={isResuming}
            className="w-full px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResuming ? 'Reprise en cours...' : 'Reprendre le traitement'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;