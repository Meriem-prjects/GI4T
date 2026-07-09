import { useEffect, useMemo, useRef, useState } from "react";
import { Event, Governorate } from "@/types/events";
import { TunisiaMap } from "./TunisiaMap";

interface GovernorateMapProps {
  governorates: Governorate[];
  events: Event[];
  selectedGovernorate?: string | null;
  onGovernorateClick?: (name: string | null) => void;
  selectedEventId?: string | null;
  onEventClick?: (event: Event) => void;
}

interface Centroid {
  cx: number;
  cy: number;
}

// Walks the rendered TunisiaMap SVG once on mount and reads each path's
// getBBox() to derive a centroid in viewBox coordinates. We then drop event
// thumbnails at the centroid of the corresponding governorate.
function useGovernorateCentroids(svgWrapperRef: React.RefObject<HTMLDivElement>) {
  const [centroids, setCentroids] = useState<Map<string, Centroid>>(new Map());

  useEffect(() => {
    if (!svgWrapperRef.current) return;
    const svg = svgWrapperRef.current.querySelector("svg");
    if (!svg) return;
    const map = new Map<string, Centroid>();
    svg.querySelectorAll<SVGPathElement>("path[id]").forEach((path) => {
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
  selectedEventId = null,
  onEventClick,
}: GovernorateMapProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const centroids = useGovernorateCentroids(wrapperRef);

  const handleStateClick = (name: string) => {
    if (!onGovernorateClick) return;
    onGovernorateClick(name === selectedGovernorate ? null : name);
  };

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

  return (
    <div
      ref={wrapperRef}
      className="w-full h-full flex items-center justify-center p-2 overflow-auto rounded-lg bg-sky-50"
    >
      <TunisiaMap selectedState={selectedGovernorate ?? ""} onStateClick={handleStateClick}>
        {/* Circular clip mask, defined once for all thumbnails */}
        <defs>
          <clipPath id="event-thumb-clip" clipPathUnits="objectBoundingBox">
            <circle cx="0.5" cy="0.5" r="0.5" />
          </clipPath>
        </defs>

        {/* Governorate names — rendered at each computed centroid, in
            the same viewBox as the paths (836×1270). pointer-events:none
            so labels don't intercept the click that should reach the
            shape. White stroke acts as a halo so the label stays
            readable no matter what colour the underlying region is. */}
        {Array.from(centroids.entries()).map(([name, c]) => (
          <text
            key={`label-${name}`}
            x={c.cx}
            y={c.cy}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="26"
            fontWeight="600"
            fill="#0f172a"
            stroke="white"
            strokeWidth="4"
            paintOrder="stroke"
            style={{ pointerEvents: "none", userSelect: "none" }}
          >
            {name}
          </text>
        ))}

        {Array.from(eventsByGovernorate.entries()).flatMap(([name, group]) => {
          const c = centroids.get(name);
          if (!c) return [];
          const R = 20; // thumbnail radius in viewBox units
          return group.map((ev, i) => {
            // Fan overlapping thumbnails around the centroid.
            const angle = (2 * Math.PI * i) / Math.max(group.length, 1) - Math.PI / 2;
            const offset = group.length > 1 ? R + 6 : 0;
            const cx = c.cx + Math.cos(angle) * offset;
            const cy = c.cy + Math.sin(angle) * offset;
            const ring = ev.type === "action_realisee" ? "#10b981" : "#3b82f6";
            const isSelected = selectedEventId === ev.id;
            const img = ev.images?.[0];
            return (
              <g
                key={ev.id}
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onEventClick?.(ev);
                }}
                style={{ transformOrigin: `${cx}px ${cy}px` }}
              >
                {/* Halo ring on selection */}
                {isSelected && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={R + 8}
                    fill="none"
                    stroke={ring}
                    strokeOpacity={0.4}
                    strokeWidth={4}
                  />
                )}
                {/* Coloured backing */}
                <circle cx={cx} cy={cy} r={R + 2} fill={ring} />
                {/* Thumbnail (image if available, else white circle with pin) */}
                {img ? (
                  <image
                    href={img}
                    x={cx - R}
                    y={cy - R}
                    width={R * 2}
                    height={R * 2}
                    preserveAspectRatio="xMidYMid slice"
                    clipPath="url(#event-thumb-clip)"
                  />
                ) : (
                  <>
                    <circle cx={cx} cy={cy} r={R} fill="white" />
                    <text
                      x={cx}
                      y={cy + 5}
                      textAnchor="middle"
                      fontSize="16"
                      fontWeight="bold"
                      fill={ring}
                    >
                      ★
                    </text>
                  </>
                )}
                {/* White outer stroke */}
                <circle cx={cx} cy={cy} r={R} fill="none" stroke="white" strokeWidth={2} />
              </g>
            );
          });
        })}
      </TunisiaMap>
    </div>
  );
};
