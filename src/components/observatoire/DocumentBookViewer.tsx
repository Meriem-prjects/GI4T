import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize2,
  Minimize2,
  RotateCw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { odfPageUrl, odfPdfUrl, odfThumbUrl, type Book, type BookEdition, type Lang } from "@/lib/odf";

// Lecteur page par page des documents ODF : une page à la fois, boutons
// précédent / suivant, miniatures, plein écran, zoom et PDF. L'édition arabe
// se lit de droite à gauche (la page suivante est à gauche).

const ZOOMS = [1, 1.5, 2];

const T = {
  fr: {
    prev: "Page précédente",
    next: "Page suivante",
    page: (n: number, total: number) => `Page ${n} sur ${total}`,
    goTo: "Aller à la page",
    cover: "Couverture",
    zoomIn: "Agrandir",
    zoomOut: "Réduire",
    full: "Plein écran",
    exitFull: "Quitter le plein écran",
    pdf: "Télécharger le PDF",
    retry: "Réessayer",
    error: "La page n'a pas pu être chargée.",
    edition: "Langue du document",
    thumbs: "Pages du document",
  },
  ar: {
    prev: "الصفحة السابقة",
    next: "الصفحة التالية",
    page: (n: number, total: number) => `الصفحة ${n} من ${total}`,
    goTo: "الانتقال إلى الصفحة",
    cover: "الغلاف",
    zoomIn: "تكبير",
    zoomOut: "تصغير",
    full: "ملء الشاشة",
    exitFull: "الخروج من ملء الشاشة",
    pdf: "تحميل ملف PDF",
    retry: "إعادة المحاولة",
    error: "تعذّر تحميل الصفحة.",
    edition: "لغة الوثيقة",
    thumbs: "صفحات الوثيقة",
  },
};

interface Props {
  book: Book;
  title: string;
  uiLang: Lang;
}

export default function DocumentBookViewer({ book, title, uiLang }: Props) {
  const t = T[uiLang];
  const [params, setParams] = useSearchParams();
  const editions = (["fr", "ar"] as Lang[]).filter((l) => book[l]?.pages);
  const requestedEdition = params.get("ed") as Lang | null;
  const edition: Lang =
    requestedEdition && editions.includes(requestedEdition)
      ? requestedEdition
      : editions.includes(uiLang)
        ? uiLang
        : editions[0];
  const ed = book[edition] as BookEdition;
  const total = ed.pages;
  const page = Math.min(Math.max(Number(params.get("page")) || 1, 1), total);
  const bookDir = edition === "ar" ? "rtl" : "ltr";

  const [zoom, setZoom] = useState(1);
  const [full, setFull] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const [stage, setStage] = useState({ w: 0, h: 0 });
  const [goTo, setGoTo] = useState("");

  const stageRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);

  const setState = useCallback(
    (next: { page?: number; ed?: Lang }) => {
      const p = new URLSearchParams(params);
      const nextEd = next.ed ?? edition;
      const maxPage = book[nextEd]?.pages ?? total;
      p.set("page", String(Math.min(Math.max(next.page ?? page, 1), maxPage)));
      if (next.ed) p.set("ed", next.ed);
      setParams(p, { replace: true });
    },
    [params, setParams, edition, book, total, page],
  );

  const go = useCallback((n: number) => setState({ page: n }), [setState]);
  const next = useCallback(() => page < total && go(page + 1), [page, total, go]);
  const prev = useCallback(() => page > 1 && go(page - 1), [page, go]);

  const src = useMemo(() => {
    const url = odfPageUrl(ed, page);
    return retry ? `${url}?r=${retry}` : url;
  }, [ed, page, retry]);

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [src]);

  // Préchargement des pages voisines
  useEffect(() => {
    for (const n of [page + 1, page - 1, page + 2]) {
      if (n >= 1 && n <= total) new Image().src = odfPageUrl(ed, n);
    }
  }, [ed, page, total]);

  // Miniature courante visible dans la bande (sans faire défiler la page
  // quand la bande est hors de l'écran)
  useEffect(() => {
    const strip = thumbsRef.current;
    const el = strip?.querySelector<HTMLElement>(`[data-page="${page}"]`);
    if (!strip || !el) return;
    const r = strip.getBoundingClientRect();
    if (r.bottom > 0 && r.top < window.innerHeight) {
      el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [page, edition, full]);

  // Place disponible pour la page (mode « page entière »)
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setStage({ w: entry.contentRect.width, h: entry.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, [full]);

  // Clavier : flèches selon le sens de lecture de l'édition
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("input, textarea, select, [contenteditable=true]")) return;
      const forward = bookDir === "rtl" ? "ArrowLeft" : "ArrowRight";
      const backward = bookDir === "rtl" ? "ArrowRight" : "ArrowLeft";
      if (e.key === forward || e.key === "PageDown") next();
      else if (e.key === backward || e.key === "PageUp") prev();
      else if (e.key === "Home") go(1);
      else if (e.key === "End") go(total);
      else if (e.key === "Escape" && full) closeFull();
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [bookDir, next, prev, go, total, full]);

  const openFull = () => {
    setFull(true);
    setZoom(1);
    requestAnimationFrame(() => overlayRef.current?.requestFullscreen?.().catch(() => undefined));
  };
  function closeFull() {
    setFull(false);
    setZoom(1);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined);
  }
  useEffect(() => {
    const onChange = () => {
      if (!document.fullscreenElement) setFull(false);
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);
  useEffect(() => {
    if (!full) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [full]);

  // Glisser du doigt (désactivé quand la page est agrandie, pour pouvoir la déplacer)
  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = zoom === 1 ? e.touches[0].clientX : null;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) < 50) return;
    const fingerRight = dx > 0;
    if (bookDir === "ltr") (fingerRight ? prev : next)();
    else (fingerRight ? next : prev)();
  };

  // Taille de la page : entière à l'écran (zoom 1), puis 150 % / 200 %
  const ratio = ed.w / ed.h;
  const maxHeight = full ? Math.max(200, stage.h - 16) : Math.max(420, Math.min(window.innerHeight - 220, 1100));
  const fitWidth = Math.max(160, Math.min(stage.w - 16, maxHeight * ratio));
  const pageWidth = Math.round(fitWidth * zoom);

  const zoomIn = () => setZoom((z) => ZOOMS[Math.min(ZOOMS.indexOf(z) + 1, ZOOMS.length - 1)]);
  const zoomOut = () => setZoom((z) => ZOOMS[Math.max(ZOOMS.indexOf(z) - 1, 0)]);
  const PrevIcon = bookDir === "rtl" ? ChevronRight : ChevronLeft;
  const NextIcon = bookDir === "rtl" ? ChevronLeft : ChevronRight;
  const fileName = ed.pdf;

  const toolbar = (
    <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b bg-background/95" dir={uiLang === "ar" ? "rtl" : "ltr"}>
      <div className="flex items-center gap-2">
        {editions.length > 1 && (
          <div role="group" aria-label={t.edition} className="inline-flex rounded-full border p-0.5 bg-muted/50">
            {editions.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setState({ ed: l, page })}
                aria-pressed={edition === l}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-semibold transition-colors",
                  edition === l ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {l === "fr" ? "Français" : "العربية"}
              </button>
            ))}
          </div>
        )}
        <span className="text-sm text-muted-foreground tabular-nums" aria-live="polite">
          {t.page(page, total)}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <form
          className="hidden md:flex items-center"
          onSubmit={(e) => {
            e.preventDefault();
            const n = Number(goTo);
            if (n >= 1 && n <= total) go(n);
            setGoTo("");
          }}
        >
          <input
            type="number"
            min={1}
            max={total}
            value={goTo}
            onChange={(e) => setGoTo(e.target.value)}
            placeholder={String(page)}
            aria-label={t.goTo}
            className="w-16 h-8 rounded-md border bg-background px-2 text-sm text-center"
          />
        </form>
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={zoomOut} disabled={zoom === ZOOMS[0]} aria-label={t.zoomOut} title={t.zoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="hidden sm:inline text-xs tabular-nums w-10 text-center">{Math.round(zoom * 100)}%</span>
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={zoomIn} disabled={zoom === ZOOMS[ZOOMS.length - 1]} aria-label={t.zoomIn} title={t.zoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={full ? closeFull : openFull}
          aria-label={full ? t.exitFull : t.full}
          title={full ? t.exitFull : t.full}
        >
          {full ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
        <Button asChild variant="outline" size="sm" className="h-9 gap-2">
          <a href={odfPdfUrl(ed)} download={fileName} target="_blank" rel="noopener noreferrer">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">PDF</span>
            <span className="sr-only sm:hidden">{t.pdf}</span>
          </a>
        </Button>
      </div>
    </div>
  );

  const stageEl = (
    <div className={cn("relative", full && "h-full")} dir={bookDir}>
      <div
        ref={stageRef}
        className={cn("relative bg-muted/60", full && "h-full", zoom > 1 ? "overflow-auto" : "overflow-hidden")}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="flex justify-center p-2 min-h-[200px]" style={{ width: zoom > 1 ? pageWidth + 16 : undefined, margin: zoom > 1 ? "0 auto" : undefined }}>
          <div className="relative bg-white shadow-lg" style={{ width: pageWidth, aspectRatio: `${ed.w} / ${ed.h}` }}>
            {!loaded && !failed && <div className="absolute inset-0 animate-pulse bg-muted" />}
            {failed ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center" dir={uiLang === "ar" ? "rtl" : "ltr"}>
                <p className="text-sm text-muted-foreground">{t.error}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setRetry((r) => r + 1)} className="gap-2">
                    <RotateCw className="h-4 w-4" />
                    {t.retry}
                  </Button>
                  <Button asChild size="sm" variant="ghost">
                    <a href={odfPdfUrl(ed)} target="_blank" rel="noopener noreferrer">PDF</a>
                  </Button>
                </div>
              </div>
            ) : (
              <img
                key={src}
                src={src}
                alt={`${title} — ${t.page(page, total)}`}
                width={ed.w}
                height={ed.h}
                draggable={false}
                onLoad={() => setLoaded(true)}
                onError={() => setFailed(true)}
                onDoubleClick={() => setZoom((z) => (z === 1 ? 2 : 1))}
                className={cn("block w-full h-full select-none transition-opacity", loaded ? "opacity-100" : "opacity-0")}
              />
            )}
          </div>
        </div>
      </div>
      {/* Grandes flèches sur les côtés (écrans larges) */}
      <button
        type="button"
        onClick={prev}
        disabled={page <= 1}
        aria-label={t.prev}
        className="hidden md:flex absolute top-1/2 -translate-y-1/2 start-2 h-12 w-12 items-center justify-center rounded-full bg-background/90 shadow border hover:bg-background disabled:opacity-0 transition"
      >
        <PrevIcon className="h-6 w-6" />
      </button>
      <button
        type="button"
        onClick={next}
        disabled={page >= total}
        aria-label={t.next}
        className="hidden md:flex absolute top-1/2 -translate-y-1/2 end-2 h-12 w-12 items-center justify-center rounded-full bg-background/90 shadow border hover:bg-background disabled:opacity-0 transition"
      >
        <NextIcon className="h-6 w-6" />
      </button>
    </div>
  );

  const bottom = (
    <div className="border-t bg-background/95" dir={bookDir}>
      <div className="flex items-center justify-center gap-3 px-3 py-2">
        <Button variant="outline" size="sm" onClick={prev} disabled={page <= 1} aria-label={t.prev} className="h-10 min-w-[44px] gap-1">
          <PrevIcon className="h-5 w-5" />
          <span className="hidden sm:inline">{t.prev}</span>
        </Button>
        <span className="text-sm tabular-nums text-muted-foreground min-w-[72px] text-center" dir={uiLang === "ar" ? "rtl" : "ltr"}>
          {uiLang === "ar" ? `${page} من ${total}` : `${page} / ${total}`}
        </span>
        <Button variant="outline" size="sm" onClick={next} disabled={page >= total} aria-label={t.next} className="h-10 min-w-[44px] gap-1">
          <span className="hidden sm:inline">{t.next}</span>
          <NextIcon className="h-5 w-5" />
        </Button>
      </div>
      {total > 1 && (
        <div ref={thumbsRef} className="flex gap-2 overflow-x-auto px-3 pb-3 pt-1" role="list" aria-label={t.thumbs}>
          {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              role="listitem"
              data-page={n}
              onClick={() => go(n)}
              aria-current={n === page ? "page" : undefined}
              aria-label={n === 1 ? t.cover : t.page(n, total)}
              className={cn(
                "group flex-shrink-0 rounded-md border-2 overflow-hidden bg-white transition",
                n === page ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-muted-foreground/40",
              )}
            >
              <img
                src={odfThumbUrl(ed, n)}
                alt=""
                loading="lazy"
                width={64}
                height={Math.round(64 / ratio)}
                className="block w-16 h-auto"
              />
              <span className="block text-[10px] leading-4 text-center text-muted-foreground bg-muted/60" dir={uiLang === "ar" ? "rtl" : "ltr"}>
                {n === 1 ? t.cover : n}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  if (full) {
    return (
      <div ref={overlayRef} className="fixed inset-0 z-50 flex flex-col bg-neutral-900" role="dialog" aria-modal="true" aria-label={title}>
        {toolbar}
        <div className="flex-1 min-h-0">{stageEl}</div>
        {bottom}
      </div>
    );
  }

  return (
    <section className="rounded-xl border bg-card overflow-hidden" aria-label={title}>
      {toolbar}
      {stageEl}
      {bottom}
    </section>
  );
}
