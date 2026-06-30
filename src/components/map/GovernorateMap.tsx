import { useEffect, useMemo, useRef, useState } from "react";
import { Event, Governorate } from "@/types/events";
import { TunisiaMap } from "./TunisiaMap";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

interface GovernorateMapProps {
  governorates: Governorate[];
  events: Event[];
  selectedGovernorate?: string | null;
  onGovernorateClick?: (name: string | null) => void;
}

interface Centroid {
  cx: number;
  cy: number;
}

// Walks the rendered TunisiaMap SVG once on mount and reads each path's
// getBBox() to derive a centroid in viewBox coordinates. We then drop an
// event marker (SVG <circle>) at the centroid of the corresponding
// governorate. This avoids hand-coding 24 coordinate pairs and stays in
// sync if a path is ever edited.
function useGovernorateCentroids(svgWrapperRef: React.RefObject<HTMLDivElement>) {
  const [centroids, setCentroids] = useState<Map<string, Centroid>>(new Map());

  useEffect(() => {
    if (!svgWrapperRef.current) return;
    const svg = svgWrapperRef.current.querySelector("svg");
    if (!svg) return;
    const map = new Map<string, Centroid>();
    svg.querySelectorAll<SVGPathElement>("path[id]").forEach((path) => {
      // Skip the duplicate island ids — they map to the same parent
      // governorate that already has a primary path.
      if (path.id === "Sfax1" || path.id === "djerba") return;
      try {
        const bbox = path.getBBox();
        map.set(path.id, {
          cx: bbox.x + bbox.width / 2,
          cy: bbox.y + bbox.height / 2,
        });
      } catch {
        /* getBBox can throw if the path isn't laid out yet — ignore */
      }
    });
    setCentroids(map);
  }, [svgWrapperRef]);

  return centroids;
}

export const GovernorateMap = ({
  governorates: _governorates,
  events,
  selectedGovernorate = null,
  onGovernorateClick,
}: GovernorateMapProps) => {
  const { isRTL } = useLanguage();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const centroids = useGovernorateCentroids(wrapperRef);

  const handleStateClick = (name: string) => {
    if (!onGovernorateClick) return;
    // Toggle off when clicking the already-selected governorate.
    onGovernorateClick(name === selectedGovernorate ? null : name);
  };

  // Group events by governorate name so we can jitter overlapping circles
  // around the centroid. Same UX as the old Leaflet jitter, but in SVG
  // viewBox units (the SVG is 836×1270).
  const eventsByGovernorate = useMemo(() => {
    const map = new Map<string, Event[]>();
    for (const ev of events) {
      const name = ev.governorate?.name;
      if (!name) continue;
      const list = map.get(name) ?? [];
      list.push(ev);
      map.set(name, list);
    }
    return map;
  }, [events]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(isRTL ? "ar-TN" : "fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  return (
    <div ref={wrapperRef} className="w-full h-full flex items-center justify-center p-4 overflow-auto">
      <TunisiaMap selectedState={selectedGovernorate ?? ""} onStateClick={handleStateClick}>
        {Array.from(eventsByGovernorate.entries()).flatMap(([name, group]) => {
          const c = centroids.get(name);
          if (!c) return [];
          return group.map((ev, i) => {
            // Spread overlapping events around the centroid in a small ring.
            const angle = (2 * Math.PI * i) / Math.max(group.length, 1);
            const offset = group.length > 1 ? 18 : 0;
            const cx = c.cx + Math.cos(angle) * offset;
            const cy = c.cy + Math.sin(angle) * offset;
            const fill = ev.type === "action_realisee" ? "#10b981" : "#3b82f6";
            return (
              <Popover key={ev.id}>
                <PopoverTrigger asChild>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={14}
                    fill={fill}
                    stroke="white"
                    strokeWidth={3}
                    className="cursor-pointer drop-shadow-md hover:opacity-90 transition-opacity"
                  />
                </PopoverTrigger>
                <PopoverContent className="w-72 p-3" dir={isRTL ? "rtl" : "ltr"}>
                  {ev.images?.[0] && (
                    <div className="mb-2 -mx-3 -mt-3 overflow-hidden rounded-t-md">
                      <img
                        src={ev.images[0]}
                        alt={ev.title}
                        className="w-full h-32 object-cover"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      className={
                        ev.type === "action_realisee"
                          ? "bg-emerald-600 hover:bg-emerald-600"
                          : "bg-blue-600 hover:bg-blue-600"
                      }
                    >
                      {ev.type === "action_realisee"
                        ? isRTL
                          ? "إجراء منجز"
                          : "Action réalisée"
                        : isRTL
                        ? "حدث قادم"
                        : "Événement à venir"}
                    </Badge>
                  </div>
                  <h3 className={`font-semibold text-sm leading-snug mb-1 ${isRTL ? "font-almarai" : ""}`}>
                    {isRTL && ev.title_ar ? ev.title_ar : ev.title}
                  </h3>
                  <p className={`text-xs text-muted-foreground leading-relaxed mb-2 line-clamp-3 ${isRTL ? "font-almarai" : ""}`}>
                    {isRTL && ev.description_ar ? ev.description_ar : ev.description}
                  </p>
                  <div className={`text-[11px] text-muted-foreground space-y-0.5 ${isRTL ? "font-almarai" : ""}`}>
                    <div>
                      <strong>{isRTL ? "التاريخ : " : "Date : "}</strong>
                      {formatDate(ev.event_date)}
                    </div>
                    {ev.governorate?.name && (
                      <div>
                        <strong>{isRTL ? "الولاية : " : "Gouvernorat : "}</strong>
                        {isRTL && ev.governorate.name_ar ? ev.governorate.name_ar : ev.governorate.name}
                      </div>
                    )}
                    {ev.people_impacted ? (
                      <div>
                        <strong>{isRTL ? "المستفيدون : " : "Personnes impactées : "}</strong>
                        {ev.people_impacted}
                      </div>
                    ) : null}
                    {ev.available_places ? (
                      <div>
                        <strong>{isRTL ? "المقاعد المتاحة : " : "Places disponibles : "}</strong>
                        {ev.available_places}
                      </div>
                    ) : null}
                  </div>
                </PopoverContent>
              </Popover>
            );
          });
        })}
      </TunisiaMap>
    </div>
  );
};
