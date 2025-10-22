import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getSessionId } from '@/lib/sessionUtils';

export function useDocumentView(documentId: string | undefined) {
  const sessionId = useRef(getSessionId());
  const startTime = useRef(Date.now());
  const hasTrackedView = useRef(false);
  const updateInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!documentId) return;

    // Track initial view
    const trackView = async () => {
      if (hasTrackedView.current) return;
      
      try {
        await supabase.functions.invoke('track-document-view', {
          body: {
            documentId,
            sessionId: sessionId.current,
            readDuration: 0,
            userAgent: navigator.userAgent,
          },
        });
        hasTrackedView.current = true;
      } catch (error) {
        console.error('Error tracking view:', error);
      }
    };

    trackView();

    // Update read duration every 15 seconds
    updateInterval.current = setInterval(async () => {
      const readDuration = Math.floor((Date.now() - startTime.current) / 1000);
      
      try {
        await supabase.functions.invoke('track-document-view', {
          body: {
            documentId,
            sessionId: sessionId.current,
            readDuration,
            userAgent: navigator.userAgent,
          },
        });
      } catch (error) {
        console.error('Error updating read duration:', error);
      }
    }, 15000);

    // Track on page unload
    const handleBeforeUnload = async () => {
      const readDuration = Math.floor((Date.now() - startTime.current) / 1000);
      
      try {
        await supabase.functions.invoke('track-document-view', {
          body: {
            documentId,
            sessionId: sessionId.current,
            readDuration,
            userAgent: navigator.userAgent,
          },
        });
      } catch (error) {
        console.error('Error tracking final duration:', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      if (updateInterval.current) {
        clearInterval(updateInterval.current);
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload();
    };
  }, [documentId]);
}
