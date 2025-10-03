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

  // Dessiner les contours des gouvernorats
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return;

    const map = mapInstanceRef.current;
    const eventCounts = countEventsByGovernorate(events);

    // Supprimer les anciennes couches
    layersRef.current.forEach((layer) => layer.remove());
    layersRef.current = [];

    // Ajouter les gouvernorats (uniquement les contours)
    governorates.forEach((gov) => {
      const eventCount = eventCounts[gov.id] || 0;
      const color = getGovernorateColor(eventCount);
      const isSelected = gov.id === selectedGovernorateId;

      const layer = L.geoJSON(gov.geojson as any, {
        style: {
          fillColor: color,
          fillOpacity: isSelected ? 0.3 : 0.15,
          color: "#666",
          weight: 1.5,
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

  // Les marqueurs d'événements ne sont plus affichés sur la carte
  // L'affichage se fait uniquement via les contours des gouvernorats

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
      {/* Légende simplifiée */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 text-xs">
        <div className="font-semibold mb-2">Carte des gouvernorats</div>
        <div className="text-muted-foreground text-[11px]">
          Survolez un gouvernorat pour voir les informations
        </div>
      </div>
    </div>
  );
};
