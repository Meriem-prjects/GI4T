import React, { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle, XCircle, FileText, RotateCcw, X } from 'lucide-react';

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
  fileName: string;
  onComplete?: (result: any) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
  pdfUrl?: string; // For resume functionality
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  jobId,
  fileName,
  onComplete,
  onError,
  onCancel,
  pdfUrl
}) => {
  const [job, setJob] = useState<ProcessingJob | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [document, setDocument] = useState<any>(null);
  const [lastProgressUpdate, setLastProgressUpdate] = useState<number>(Date.now());
  const [showResumeButton, setShowResumeButton] = useState(false);
  const [isResuming, setIsResuming] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [processingStats, setProcessingStats] = useState<any>(null);

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
          const updatedJob = payload.new as ProcessingJob;
          setJob(updatedJob);
          setLastProgressUpdate(Date.now());
          
          // Extract processing stats if available
          if (updatedJob.result_data) {
            setProcessingStats(updatedJob.result_data);
          }

          // Handle completion
          if (updatedJob.status === 'completed') {
            fetchAndEmitDocument(jobId!);
          }
          
          // Handle partial completion
          if (updatedJob.status === 'partial') {
            fetchAndEmitDocument(jobId!);
          }

          // Handle errors
          if (updatedJob.status === 'failed' && onError) {
            onError(updatedJob.error_message || 'Processing failed');
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

  // Helper to fetch document data
  const fetchDocument = async (jobId: string) => {
    try {
      const { data: doc, error: docError } = await (supabase as any)
        .from('documents')
        .select('id,title,summary,content,keywords,language,original_filename,file_url,pdf_url,category_id,document_type_id,page_contents,processed_pages,total_pages,created_at,status')
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

  // Cancel processing
  const handleCancel = async () => {
    if (!jobId || isCancelling) return;

    setIsCancelling(true);

    try {
      // Update job status to cancelled in database
      const { error } = await supabase
        .from('processing_jobs')
        .update({ status: 'cancelled', error_message: 'Cancelled by user' })
        .eq('id', jobId);

      if (error) {
        console.error('Cancel failed:', error);
      } else {
        onCancel?.();
      }
    } catch (error) {
      console.error('Cancel error:', error);
    } finally {
      setIsCancelling(false);
    }
  };

  const getStepDescription = (step: string | null): string => {
    if (!step) return 'Initialisation...';
    
    const stepMappings: { [key: string]: string } = {
      'initializing': 'Initialisation du traitement...',
      'pdfrest_conversion': 'Conversion PDF (service externe)...',
      'internal_conversion': 'Conversion PDF (service interne)...',
      'basic_extraction': 'Extraction de base...',
      'starting_ocr': 'Démarrage de la reconnaissance de texte...',
      'resuming': 'Reprise du traitement...',
      'completed': 'Traitement terminé avec succès',
      'partial_completion': 'Traitement partiel terminé',
      'conversion_failed': 'Échec de conversion PDF',
      'processing_error': 'Erreur de traitement',
      'conversion_timeout': 'Traitement interrompu'
    };
    
    // Handle dynamic processing steps
    if (step.startsWith('processing_page_')) {
      const pageNum = step.split('_')[2];
      return `Analyse de la page ${pageNum}...`;
    }
    
    if (step.startsWith('ocr_page_')) {
      const pageNum = step.replace('ocr_page_', '');
      return `OCR page ${pageNum}${job?.total_pages ? `/${job.total_pages}` : ''}...`;
    }
    
    return stepMappings[step] || step.replace(/_/g, ' ');
  };

  const getStatusIcon = () => {
    if (!job) return <Loader2 className="h-4 w-4 animate-spin" />;
    
    switch (job.status) {
      case 'completed':
        return <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-white" />
        </div>;
      case 'partial':
        return <div className="h-4 w-4 rounded-full bg-yellow-500 flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-white" />
        </div>;
      case 'failed':
        return <div className="h-4 w-4 rounded-full bg-red-500 flex items-center justify-center">
          <X className="h-2 w-2 text-white" />
        </div>;
      case 'stalled':
        return <div className="h-4 w-4 rounded-full bg-orange-500 flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-white" />
        </div>;
      case 'processing':
      default:
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    }
  };

  const getStatusBadge = () => {
    if (!job) return <Badge variant="secondary">Initialisation</Badge>;
    
    switch (job.status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Terminé</Badge>;
      case 'partial':
        return <Badge variant="default" className="bg-yellow-500">Partiel</Badge>;
      case 'failed':
        return <Badge variant="destructive">Échec</Badge>;
      case 'stalled':
        return <Badge variant="outline" className="border-orange-500 text-orange-500">Interrompu</Badge>;
      case 'processing':
        return <Badge variant="secondary">En cours</Badge>;
      case 'pending':
        return <Badge variant="outline">En attente</Badge>;
      default:
        return <Badge variant="secondary">{job.status}</Badge>;
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
        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{fileName}</p>
          <p className="text-xs text-muted-foreground">Initialisation du traitement...</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary">En cours</Badge>
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-2 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
            >
              Annuler
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 space-y-3">
      {/* Header with file info and status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <p className="font-medium text-sm truncate max-w-[300px]" title={job?.file_name || fileName}>
              {job?.file_name || fileName}
            </p>
            <p className="text-xs text-muted-foreground">
              {job ? formatFileSize(job.file_size) : 'Taille inconnue'}
              {!isListening && ' • Connexion temps réel...'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge()}
        </div>
      </div>

      {/* Unified Progress Display */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-muted-foreground">
            {getStepDescription(job?.current_step)}
          </span>
          <span className="font-medium">
            {job?.progress || 0}%
          </span>
        </div>
        <Progress value={job?.progress || 0} className="h-2" />
        
        {/* Page progress indicator */}
        {job && job.total_pages > 0 && (
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
            <span>
              Page {job.processed_pages || 0}/{job.total_pages}
            </span>
            <span>
              {Math.round((job.processed_pages || 0) / job.total_pages * 100)}% pages
            </span>
          </div>
        )}
      </div>

      {/* Processing Statistics */}
      {processingStats && (
        <div className="text-xs text-muted-foreground mb-3 p-2 bg-gray-50 rounded">
          <div className="grid grid-cols-2 gap-2">
            {processingStats.successfulPages && (
              <div>Réussies: {processingStats.successfulPages}/{processingStats.totalPages}</div>
            )}
            {processingStats.averageConfidence && (
              <div>Confiance: {processingStats.averageConfidence}%</div>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {job?.error_message && (
        <div className="text-xs text-red-500 mb-3 p-2 bg-red-50 rounded">
          {job.error_message}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between">
        {(job?.status === 'failed' || job?.status === 'stalled' || job?.status === 'cancelled') && pdfUrl && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleResume}
            disabled={isResuming}
            className="text-xs"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            {isResuming ? 'Reprise...' : 'Reprendre'}
          </Button>
        )}

        {(job?.status === 'processing' || job?.status === 'pending') && onCancel && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            disabled={isCancelling}
            className="text-xs ml-auto"
          >
            <X className="h-3 w-3 mr-1" />
            {isCancelling ? 'Annulation...' : 'Annuler'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProgressTracker;