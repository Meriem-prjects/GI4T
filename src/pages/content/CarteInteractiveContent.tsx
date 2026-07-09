import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChevronRight,
  Calendar,
  MapPin,
  Users,
  Ticket,
  ArrowRight,
  Sparkles,
  X,
  Camera,
} from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { useGovernorates } from "@/hooks/useGovernorates";
import { GovernorateMap } from "@/components/map/GovernorateMap";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";
import type { Event, EventLinkedAlbum } from "@/types/events";
import {
  AlbumViewerDialog,
  type AlbumViewerAlbum,
} from "@/components/albums/AlbumViewerDialog";

type FilterType = "all" | "action_realisee" | "evenement_a_venir";

const CarteInteractiveContent = () => {
  const { events = [] } = useEvents();
  const { governorates = [] } = useGovernorates();
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedGovernorate, setSelectedGovernorate] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  // Album viewer / picker state — opened by the "Voir les photos" CTA
  // on the selected event card. If the event has exactly one album we
  // skip the picker and open the viewer directly.
  const [viewerAlbum, setViewerAlbum] = useState<AlbumViewerAlbum | null>(null);
  const [viewerInitialIndex, setViewerInitialIndex] = useState<number | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const { isRTL } = useLanguage();
  const { t } = useTranslation();

  const filteredEvents = useMemo(() => {
    return events.filter((event: Event) => {
      if (filter !== "all" && event.type !== filter) return false;
      if (selectedGovernorate && event.governorate?.name !== selectedGovernorate) return false;
      return true;
    });
  }, [events, filter, selectedGovernorate]);

  // Auto-select the first event when the filter changes or when nothing is selected.
  useEffect(() => {
    if (filteredEvents.length === 0) {
      setSelectedEvent(null);
      return;
    }
    if (!selectedEvent || !filteredEvents.find((e) => e.id === selectedEvent.id)) {
      setSelectedEvent(filteredEvents[0]);
    }
  }, [filteredEvents, selectedEvent]);

  // Deep-link support: /acces-aux-droits/carte-interactive?event=<id>
  // pre-selects the referenced event so the album page can jump straight
  // to a specific event marker.
  useEffect(() => {
    const eventId = searchParams.get("event");
    if (!eventId || events.length === 0) return;
    const match = events.find((e) => e.id === eventId);
    if (match) setSelectedEvent(match);
  }, [searchParams, events]);

  const openAlbumsForEvent = (event: Event) => {
    const albums = event.photo_albums ?? [];
    if (albums.length === 0) return;
    // Opening from a CTA / marker click starts on the grid, not a
    // specific photo.
    setViewerInitialIndex(null);
    if (albums.length === 1) {
      setViewerAlbum(toViewerAlbum(event, albums[0]));
      return;
    }
    setPickerOpen(true);
  };

  // The list emitted by /api/events uses the compact shape (id, title,
  // titleAr, coverImageUrl, photoUrls). AlbumViewerDialog wants the same
  // fields plus date + location from the parent event to render a header.
  function toViewerAlbum(event: Event, a: EventLinkedAlbum): AlbumViewerAlbum {
    return {
      id: a.id,
      title: a.title,
      title_ar: a.title_ar ?? null,
      date: event.event_date,
      location: event.governorate?.name ?? null,
      location_ar: event.governorate?.name_ar ?? null,
      photo_urls: a.photo_urls ?? [],
    };
  }

  const selectedGovernorateLabel = useMemo(() => {
    if (!selectedGovernorate) return null;
    const g = governorates.find((g) => g.name === selectedGovernorate);
    return isRTL && g?.name_ar ? g.name_ar : selectedGovernorate;
  }, [governorates, selectedGovernorate, isRTL]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(isRTL ? "ar-TN" : "fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  const shortDate = (iso: string) =>
    new Date(iso).toLocaleDateString(isRTL ? "ar-TN" : "fr-FR", {
      day: "2-digit",
      month: "short",
    });

  return (
    <main className={`flex-1 ${isRTL ? "font-almarai" : ""}`}>
      {/* Breadcrumb */}
      <div className="bg-muted/30 py-2">
        <div className="container mx-auto px-4">
          <div className={`flex items-center gap-2 text-sm text-muted-foreground ${isRTL ? "flex-row-reverse justify-end" : ""}`}>
            <span>{t("home")}</span>
            <ChevronRight className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
            <span>{t("accessRights")}</span>
            <ChevronRight className={`h-4 w-4 ${isRTL ? "rotate-180" : ""}`} />
            <span className="text-foreground">{t("mapInteractiveTitle")}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className={`mb-5 ${isRTL ? "text-right" : ""}`}>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">{t("mapInteractiveTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t("mapDescription")}</p>
        </div>

        {/* Filter bar */}
        <div className={`flex flex-wrap items-center gap-2 mb-5 ${isRTL ? "flex-row-reverse" : ""}`}>
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            {t("allEvents")} <span className="opacity-70 ml-1">({events.length})</span>
          </Button>
          <Button
            variant={filter === "action_realisee" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("action_realisee")}
            className={
              filter === "action_realisee"
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "border-emerald-600 text-emerald-700 hover:bg-emerald-50"
            }
          >
            {t("completedActions")}{" "}
            <span className="opacity-70 ml-1">
              ({events.filter((e) => e.type === "action_realisee").length})
            </span>
          </Button>
          <Button
            variant={filter === "evenement_a_venir" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("evenement_a_venir")}
            className={
              filter === "evenement_a_venir"
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "border-blue-600 text-blue-700 hover:bg-blue-50"
            }
          >
            {t("upcomingEvents")}{" "}
            <span className="opacity-70 ml-1">
              ({events.filter((e) => e.type === "evenement_a_venir").length})
            </span>
          </Button>

          {selectedGovernorate && (
            <button
              type="button"
              onClick={() => setSelectedGovernorate(null)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-colors ${isRTL ? "flex-row-reverse font-almarai" : ""}`}
            >
              <MapPin className="h-3 w-3" />
              <span>{selectedGovernorateLabel}</span>
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* 3-column layout: details (left) — map (middle, largest) —
            list (right). Order + a 1fr middle column gives the map the
            visual centre of the page. */}
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr_360px] gap-4">
          {/* ── Column 2 : Interactive Map (visually centre via lg:order-2) ─ */}
          <Card className="overflow-hidden lg:order-2">
            <CardContent className="p-3">
              <div className={`flex items-center justify-between mb-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                <h3 className="font-semibold text-sm">
                  {isRTL ? "الخريطة التفاعلية" : "Carte interactive"}
                </h3>
                <span className="text-[10px] text-muted-foreground">
                  {isRTL ? "انقر على منطقة" : "Cliquez sur une région"}
                </span>
              </div>
              <div className="h-[480px] sm:h-[560px] lg:h-[640px] flex items-center justify-center">
                <GovernorateMap
                  governorates={governorates}
                  events={filteredEvents}
                  selectedGovernorate={selectedGovernorate}
                  onGovernorateClick={setSelectedGovernorate}
                  selectedEventId={selectedEvent?.id ?? null}
                  onEventClick={(ev) => {
                    // Sync the right-column details AND — if the event
                    // has photo albums — open them straight away instead
                    // of forcing a second click on "Voir les photos".
                    setSelectedEvent(ev);
                    if (ev.photo_albums && ev.photo_albums.length > 0) {
                      openAlbumsForEvent(ev);
                    }
                  }}
                />
              </div>
              {/* Legend — dots explain the event markers, the coloured
                  square explains the region tint (governorates with at
                  least one completed action). */}
              <div className={`flex items-center justify-center gap-4 mt-2 pt-2 border-t flex-wrap ${isRTL ? "flex-row-reverse" : ""}`}>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-emerald-200 border border-emerald-300" />
                  <span className="text-[10px] text-muted-foreground">
                    {isRTL ? "ولاية بها إجراء منجز" : "Gouvernorat avec action"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-[10px] text-muted-foreground">
                    {t("actionCompleted")}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-[10px] text-muted-foreground">
                    {t("upcomingEvent")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Column 1 : Detail of selected event (visually left) ────── */}
          <Card className="overflow-hidden lg:order-1 h-[480px] sm:h-[560px] lg:h-[640px]">
            <CardContent className="p-0 h-full">
              {selectedEvent ? (
                <div className="h-full flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
                  {/* Compact header: badge + title + date/gouvernorat + impact */}
                  <div className="p-3 border-b space-y-2 shrink-0">
                    <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <Badge
                        className={
                          selectedEvent.type === "action_realisee"
                            ? "bg-emerald-600 hover:bg-emerald-600 text-white"
                            : "bg-blue-600 hover:bg-blue-600 text-white"
                        }
                      >
                        {selectedEvent.type === "action_realisee"
                          ? t("actionCompleted")
                          : t("upcomingEvent")}
                      </Badge>
                      <span className={`text-xs text-muted-foreground flex items-center gap-1 ${isRTL ? "flex-row-reverse" : ""}`}>
                        <Calendar className="h-3 w-3" />
                        {formatDate(selectedEvent.event_date)}
                      </span>
                    </div>
                    <h2 className={`text-base font-bold leading-tight ${isRTL ? "text-right font-almarai" : ""}`}>
                      {isRTL && selectedEvent.title_ar
                        ? selectedEvent.title_ar
                        : selectedEvent.title}
                    </h2>
                    <div className={`flex items-center gap-3 text-xs text-muted-foreground ${isRTL ? "flex-row-reverse" : ""}`}>
                      <span className={`flex items-center gap-1 ${isRTL ? "flex-row-reverse" : ""}`}>
                        <MapPin className="h-3 w-3" />
                        {selectedEvent.governorate
                          ? isRTL && selectedEvent.governorate.name_ar
                            ? selectedEvent.governorate.name_ar
                            : selectedEvent.governorate.name
                          : "—"}
                      </span>
                      {selectedEvent.people_impacted ? (
                        <span className={`flex items-center gap-1 text-emerald-700 font-semibold ${isRTL ? "flex-row-reverse" : ""}`}>
                          <Users className="h-3 w-3" />
                          {selectedEvent.people_impacted}
                        </span>
                      ) : null}
                      {selectedEvent.available_places ? (
                        <span className={`flex items-center gap-1 text-blue-700 font-semibold ${isRTL ? "flex-row-reverse" : ""}`}>
                          <Ticket className="h-3 w-3" />
                          {selectedEvent.available_places}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Scrollable photo strip — every photo from every linked
                      album, stacked one below the other. Clicking any image
                      opens the AlbumViewerDialog straight in lightbox mode
                      at that photo's index. */}
                  {(() => {
                    const allPhotos: Array<{ url: string; album: EventLinkedAlbum }> =
                      (selectedEvent.photo_albums ?? []).flatMap((a) =>
                        (a.photo_urls ?? []).map((url) => ({ url, album: a })),
                      );
                    if (allPhotos.length === 0) {
                      return (
                        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                          {selectedEvent.images?.[0] ? (
                            <img
                              src={selectedEvent.images[0]}
                              alt={selectedEvent.title}
                              className="max-w-full max-h-full object-contain rounded-lg mb-3"
                            />
                          ) : (
                            <Sparkles className="h-10 w-10 mx-auto mb-2 opacity-40" />
                          )}
                          <p className="text-xs text-muted-foreground">
                            {isRTL ? "لا توجد صور مرفقة" : "Aucun album lié"}
                          </p>
                        </div>
                      );
                    }
                    return (
                      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-muted/20">
                        {allPhotos.map(({ url, album }, i) => {
                          // Index within THIS album so the lightbox opens on
                          // the right photo when we hand it back the album.
                          const localIndex = (album.photo_urls ?? []).indexOf(url);
                          return (
                            <button
                              type="button"
                              key={`${url}-${i}`}
                              onClick={() => {
                                setViewerAlbum(toViewerAlbum(selectedEvent, album));
                                setViewerInitialIndex(localIndex);
                              }}
                              className="block w-full rounded-lg overflow-hidden bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            >
                              <img
                                src={url}
                                alt=""
                                loading="lazy"
                                className="w-full h-auto object-cover hover:brightness-95 transition"
                              />
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()}

                  {selectedEvent.registration_enabled && (
                    <div className="p-3 border-t shrink-0">
                      <Button className={`w-full ${isRTL ? "font-almarai" : ""}`}>
                        {isRTL ? "سجّل الآن" : "S'inscrire à cet événement"}
                        <ArrowRight className={`h-4 w-4 ${isRTL ? "mr-1.5 rotate-180" : "ml-1.5"}`} />
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center p-8 text-center text-muted-foreground">
                  <div>
                    <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">
                      {isRTL
                        ? "اختر حدثا من القائمة"
                        : "Sélectionnez un événement dans la liste"}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Column 3 : Compact events list (rows, right side) ──────── */}
          <Card className="overflow-hidden lg:order-3">
            <CardContent className="p-0 h-full flex flex-col">
              <div className={`sticky top-0 z-10 bg-background border-b px-4 py-3 ${isRTL ? "text-right" : ""}`}>
                <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
                  <h3 className="font-semibold text-sm">
                    {isRTL ? "الأحداث" : "Événements"}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {filteredEvents.length}
                  </Badge>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto max-h-[560px] divide-y">
                {filteredEvents.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    {t("noResults")}
                  </div>
                ) : (
                  filteredEvents.map((event) => {
                    const isSelected = selectedEvent?.id === event.id;
                    const dotColor =
                      event.type === "action_realisee"
                        ? "bg-emerald-500"
                        : "bg-blue-500";
                    return (
                      <button
                        type="button"
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className={`w-full text-left flex items-center gap-3 px-3 py-2.5 transition-colors ${
                          isSelected
                            ? "bg-primary/10"
                            : "hover:bg-muted/60"
                        } ${isRTL ? "flex-row-reverse text-right" : ""}`}
                        dir={isRTL ? "rtl" : "ltr"}
                      >
                        {/* Thumb */}
                        <div className="relative w-11 h-11 rounded-md overflow-hidden bg-muted flex-shrink-0">
                          {event.images?.[0] ? (
                            <img
                              src={event.images[0]}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Sparkles className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                          <span
                            className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${dotColor}`}
                          />
                        </div>
                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <div
                            className={`text-sm font-medium leading-snug line-clamp-1 ${isRTL ? "font-almarai" : ""}`}
                          >
                            {isRTL && event.title_ar ? event.title_ar : event.title}
                          </div>
                          <div
                            className={`text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5 ${isRTL ? "flex-row-reverse font-almarai" : ""}`}
                          >
                            {event.governorate?.name && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {isRTL && event.governorate.name_ar
                                  ? event.governorate.name_ar
                                  : event.governorate.name}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {shortDate(event.event_date)}
                            </span>
                          </div>
                        </div>
                        <ChevronRight
                          className={`h-4 w-4 text-muted-foreground flex-shrink-0 ${isRTL ? "rotate-180" : ""}`}
                        />
                      </button>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Album picker — n'apparaît que si l'événement sélectionné a
          plusieurs albums. Sinon on ouvre le viewer directement. */}
      <Dialog open={pickerOpen} onOpenChange={(v) => !v && setPickerOpen(false)}>
        <DialogContent
          className="max-w-lg"
          dir={isRTL ? "rtl" : "ltr"}
        >
          <DialogHeader>
            <DialogTitle className={isRTL ? "font-almarai text-right" : ""}>
              {isRTL ? "اختر ألبومًا" : "Choisir un album"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {selectedEvent?.photo_albums?.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => {
                  if (!selectedEvent) return;
                  setViewerAlbum(toViewerAlbum(selectedEvent, a));
                  setPickerOpen(false);
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border hover:border-primary/50 hover:bg-muted/50 transition ${
                  isRTL ? "flex-row-reverse text-right" : "text-left"
                }`}
              >
                <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                  {a.cover_image_url ? (
                    <img
                      src={a.cover_image_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Camera className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium line-clamp-1 ${isRTL ? "font-almarai" : ""}`}>
                    {isRTL && a.title_ar ? a.title_ar : a.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {a.photo_urls?.length ?? 0} {t("photos")}
                  </div>
                </div>
                <ChevronRight
                  className={`h-4 w-4 text-muted-foreground flex-shrink-0 ${isRTL ? "rotate-180" : ""}`}
                />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <AlbumViewerDialog
        album={viewerAlbum}
        open={!!viewerAlbum}
        onOpenChange={(v) => {
          if (!v) {
            setViewerAlbum(null);
            setViewerInitialIndex(null);
          }
        }}
        initialLightboxIndex={viewerInitialIndex}
      />
    </main>
  );
};

export default CarteInteractiveContent;
