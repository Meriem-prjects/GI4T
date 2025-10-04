import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Event, Governorate } from "@/types/events";
import { getGovernorateColor, countEventsByGovernorate } from "@/lib/governorateUtils";

interface GovernorateMapProps {
  governorates: Governorate[];
  events: Event[];
  onGovernorateClick?: (governorateId: string) => void;
  selectedGovernorateId?: string;
}

export const GovernorateMap = ({
  governorates,
  events,
  onGovernorateClick,
  selectedGovernorateId,
}: GovernorateMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersRef = useRef<L.GeoJSON[]>([]);
  const markersRef = useRef<L.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialiser la carte
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [34, 9.5],
      zoom: 7,
      zoomControl: true,
      scrollWheelZoom: true,
      dragging: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;
    setMapLoaded(true);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Dessiner les gouvernorats
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return;

    const map = mapInstanceRef.current;
    const eventCounts = countEventsByGovernorate(events);

    // Supprimer les anciennes couches
    layersRef.current.forEach((layer) => layer.remove());
    layersRef.current = [];

    // Ajouter les gouvernorats
    governorates.forEach((gov) => {
      const eventCount = eventCounts[gov.id] || 0;
      const color = getGovernorateColor(eventCount);
      const isSelected = gov.id === selectedGovernorateId;

      const layer = L.geoJSON(gov.geojson as any, {
        style: {
          fillColor: color,
          fillOpacity: isSelected ? 0.7 : 0.5,
          color: isSelected ? "#1653BE" : "#333",
          weight: isSelected ? 3 : 1,
        },
        onEachFeature: (feature, layer) => {
          // Popup au survol
          layer.bindPopup(
            `<div style="font-family: Inter, sans-serif;">
              <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">
                ${gov.name}
              </div>
              <div style="font-size: 12px; color: #666;" dir="rtl">
                ${gov.name_ar || ''}
              </div>
              <div style="font-size: 12px; color: #666; margin-top: 8px;">
                📊 ${eventCount} événement${eventCount !== 1 ? 's' : ''}
              </div>
            </div>`,
            { closeButton: false }
          );

          layer.on("mouseover", () => layer.openPopup());
          layer.on("mouseout", () => layer.closePopup());

          // Clic sur le gouvernorat
          layer.on("click", () => {
            if (onGovernorateClick) {
              onGovernorateClick(gov.id);
            }
          });
        },
      });

      layer.addTo(map);
      layersRef.current.push(layer);
    });
  }, [governorates, events, mapLoaded, selectedGovernorateId, onGovernorateClick]);

  // Ajouter les marqueurs d'événements
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return;

    const map = mapInstanceRef.current;

    // Supprimer les anciens marqueurs
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Ajouter les nouveaux marqueurs
    events.forEach((event) => {
      if (event.latitude && event.longitude) {
        const iconColor = event.type === "action_realisee" ? "#22C55E" : "#3B82F6";
        const iconHtml = `
          <div style="
            background-color: ${iconColor};
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
          ">
            ${event.type === "action_realisee" ? "✓" : "📅"}
          </div>
        `;

        const marker = L.marker([event.latitude, event.longitude], {
          icon: L.divIcon({
            html: iconHtml,
            className: "custom-event-marker",
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          }),
        });

        marker.bindPopup(
          `<div style="font-family: Inter, sans-serif; min-width: 200px;">
            <div style="font-weight: bold; margin-bottom: 4px;">
              ${event.title}
            </div>
            <div style="font-size: 11px; color: #666;">
              📍 ${event.governorate?.name || ""}
            </div>
            <div style="font-size: 11px; color: #666;">
              📅 ${new Date(event.event_date).toLocaleDateString("fr-FR")}
            </div>
            ${
              event.type === "action_realisee"
                ? `<div style="font-size: 11px; color: #22C55E; margin-top: 4px;">
                    ✅ ${event.people_impacted || 0} personnes touchées
                  </div>`
                : `<div style="font-size: 11px; color: #3B82F6; margin-top: 4px;">
                    🎫 ${event.available_places || 0} places disponibles
                  </div>`
            }
          </div>`
        );

        marker.addTo(map);
        markersRef.current.push(marker);
      }
    });
  }, [events, mapLoaded]);

  return (
    <div className="relative">
      <div
        ref={mapRef}
        id="governorate-map"
        className="w-full h-[600px] rounded-lg border shadow-sm"
      />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Chargement de la carte...</p>
          </div>
        </div>
      )}
      {/* Légende */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 text-xs space-y-1">
        <div className="font-semibold mb-2">Nombre d'événements</div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: "#E5E7EB" }}></div>
          <span>0</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: "#FEF3C7" }}></div>
          <span>1-3</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: "#FCD34D" }}></div>
          <span>4-6</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: "#F59E0B" }}></div>
          <span>7-10</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: "#DC2626" }}></div>
          <span>11+</span>
        </div>
        <div className="border-t pt-2 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span>Action réalisée</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span>Événement à venir</span>
          </div>
        </div>
      </div>
    </div>
  );
};
