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
  fileName: string;
  onComplete?: (result: any) => void;
  onError?: (error: string) => void;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  jobId,
  fileName,
  onComplete,
  onError
}) => {
  const [job, setJob] = useState<ProcessingJob | null>(null);
  const [isListening, setIsListening] = useState(false);

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

  // Helper to fetch document once job completes
  const fetchAndEmitDocument = async (jobId: string) => {
    try {
      const { data: doc, error: docError } = await (supabase as any)
        .from('documents')
        .select('id,title,summary,content,keywords,language,original_filename,file_url,pdf_url,category_id,document_type_id,page_contents,processed_pages,total_pages,created_at')
        .eq('processing_job_id', jobId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (doc && !docError) {
        onComplete?.(doc);
      } else {
        onComplete?.(job?.result_data);
      }
    } catch (e) {
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
        <div className="px-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Progression</span>
            <span>{job.progress}%</span>
          </div>
          <Progress value={job.progress} className="h-2" />
          {job.processed_pages && job.total_pages && (
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Pages traitées</span>
              <span>{job.processed_pages}/{job.total_pages}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;