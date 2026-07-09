import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Camera, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";

// Loose structural type — used by AlbumsPhotosContent (public gallery) and
// CarteInteractiveContent (map). Only the fields we actually render here
// are required.
export interface AlbumViewerAlbum {
  id: string;
  title: string;
  title_ar?: string | null;
  description?: string | null;
  description_ar?: string | null;
  date?: string | null;
  location?: string | null;
  location_ar?: string | null;
  photo_urls?: string[];
}

interface AlbumViewerDialogProps {
  album: AlbumViewerAlbum | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Modal viewer for a photo album: thumbnail grid → click promotes one
 * photo to a full-screen lightbox with ← / → / Escape keyboard nav.
 *
 * Extracted from AlbumsPhotosContent so the same behaviour can be
 * mounted from the interactive map (where an event's linked albums are
 * opened without leaving the page).
 */
export function AlbumViewerDialog({ album, open, onOpenChange }: AlbumViewerDialogProps) {
  const { isRTL } = useLanguage();
  const { t } = useTranslation();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Reset the lightbox each time we switch album — otherwise re-opening
  // a different album jumps straight to a stale index.
  useEffect(() => {
    setLightboxIndex(null);
  }, [album?.id]);

  // ← / → / Esc while lightbox is up.
  useEffect(() => {
    if (lightboxIndex === null || !album) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      const total = album.photo_urls?.length ?? 0;
      if (total === 0) return;
      if (e.key === "ArrowRight") setLightboxIndex((i) => (i === null ? 0 : (i + 1) % total));
      if (e.key === "ArrowLeft")
        setLightboxIndex((i) => (i === null ? 0 : (i - 1 + total) % total));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, album]);

  const getTitle = (a: AlbumViewerAlbum) => (isRTL ? a.title_ar || a.title : a.title);
  const getLocation = (a: AlbumViewerAlbum) =>
    isRTL ? a.location_ar || a.location || "" : a.location || "";

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onOpenChange(false)}>
        <DialogContent
          className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          dir={isRTL ? "rtl" : "ltr"}
        >
          <DialogHeader>
            <DialogTitle className={isRTL ? "font-almarai text-right" : ""}>
              {album ? getTitle(album) : ""}
            </DialogTitle>
            {album && (
              <p
                className={`text-sm text-muted-foreground ${
                  isRTL ? "font-almarai text-right" : ""
                }`}
              >
                {album.date}
                {album.location ? ` · ${getLocation(album)}` : ""}
                {" · "}
                {album.photo_urls?.length || 0} {t("photos")}
              </p>
            )}
          </DialogHeader>

          <div className="flex-1 overflow-y-auto -mx-6 px-6">
            {album && album.photo_urls && album.photo_urls.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                {album.photo_urls.map((url, i) => (
                  <button
                    key={`${url}-${i}`}
                    type="button"
                    onClick={() => setLightboxIndex(i)}
                    className="relative aspect-square bg-muted rounded-md overflow-hidden group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <img
                      src={url}
                      alt=""
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Camera className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className={isRTL ? "font-almarai" : ""}>
                  {isRTL ? "لا توجد صور في هذا الألبوم" : "Aucune photo dans cet album"}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {album && lightboxIndex !== null && album.photo_urls?.[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex(null);
            }}
            className="absolute top-4 right-4 text-white/80 hover:text-white z-10 p-2 rounded-full hover:bg-white/10"
            aria-label={isRTL ? "إغلاق" : "Fermer"}
          >
            <X className="h-6 w-6" />
          </button>
          {album.photo_urls.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const total = album.photo_urls!.length;
                  setLightboxIndex((i) => (i === null ? 0 : (i - 1 + total) % total));
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white z-10 p-3 rounded-full hover:bg-white/10"
                aria-label={isRTL ? "التالي" : "Précédent"}
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const total = album.photo_urls!.length;
                  setLightboxIndex((i) => (i === null ? 0 : (i + 1) % total));
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white z-10 p-3 rounded-full hover:bg-white/10"
                aria-label={isRTL ? "السابق" : "Suivant"}
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}
          <img
            src={album.photo_urls[lightboxIndex]}
            alt=""
            className="max-w-[92vw] max-h-[92vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
            {lightboxIndex + 1} / {album.photo_urls.length}
          </div>
        </div>
      )}
    </>
  );
}
