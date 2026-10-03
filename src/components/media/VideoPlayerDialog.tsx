import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { getYouTubeEmbedUrl, getYouTubeId, isYouTubeShort } from "@/lib/youtube";

// Loose structural type — the Médiathèque rows carry more fields, only
// these are rendered here.
export interface VideoPlayerItem {
  title: string;
  title_ar?: string | null;
  description?: string | null;
  description_ar?: string | null;
  video_url: string;
  thumbnail_url?: string | null;
}

interface VideoPlayerDialogProps {
  item: VideoPlayerItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Modal player for Médiathèque videos: YouTube links are embedded (Shorts
 * keep their 9:16 ratio), direct video files play in a native <video>.
 */
export function VideoPlayerDialog({ item, open, onOpenChange }: VideoPlayerDialogProps) {
  const { isRTL } = useLanguage();
  const title = item ? (isRTL ? item.title_ar || item.title : item.title) : "";
  const description = item
    ? isRTL
      ? item.description_ar || item.description
      : item.description
    : null;
  const youTubeId = item ? getYouTubeId(item.video_url) : null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onOpenChange(false)}>
      <DialogContent className="max-w-4xl max-h-[95vh] flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle className={isRTL ? "font-almarai text-right pl-6" : "pr-6"}>{title}</DialogTitle>
          {description && (
            <DialogDescription className={`line-clamp-2 ${isRTL ? "font-almarai text-right" : ""}`}>
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        {item && (
          <div className="flex justify-center bg-black rounded-md overflow-hidden">
            {youTubeId ? (
              <iframe
                key={youTubeId}
                src={getYouTubeEmbedUrl(youTubeId)}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className={
                  isYouTubeShort(item.video_url)
                    ? "aspect-[9/16] h-[75vh] max-w-full"
                    : "aspect-video w-full max-h-[75vh]"
                }
              />
            ) : (
              // key: switching videos must reload the element, not reuse the old source
              <video
                key={item.video_url}
                src={item.video_url}
                poster={item.thumbnail_url ?? undefined}
                controls
                autoPlay
                playsInline
                preload="metadata"
                className="max-h-[75vh] w-auto max-w-full"
              />
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
