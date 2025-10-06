import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Event } from '@/types/events';
import { Governorate } from '@/types/events';

interface GovernorateMapProps {
  governorates: Governorate[];
  events: Event[];
}

export const GovernorateMap = ({ governorates, events }: GovernorateMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map
    if (!mapRef.current) {
      // Limites géographiques de la Tunisie
      const tunisiaBounds: L.LatLngBoundsExpression = [
        [30.0, 7.3],  // Sud-Ouest
        [37.7, 11.8]  // Nord-Est
      ];

      mapRef.current = L.map(mapContainerRef.current, {
        center: [34.0, 9.0],
        zoom: 6,
        minZoom: 6,
        maxZoom: 19,
        maxBounds: tunisiaBounds,
        maxBoundsViscosity: 1.0,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Add event markers
    events.forEach((event) => {
      if (event.latitude && event.longitude) {
        const markerColor = event.type === 'action_realisee' ? '#10b981' : '#3b82f6';
        const imageUrl = event.images?.[0] || null;
        
        const markerIcon = L.divIcon({
          className: 'custom-event-marker',
          html: `
            <div style="
              width: 40px;
              height: 30px;
              border: 2px solid ${markerColor};
              border-radius: 4px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              overflow: hidden;
              cursor: pointer;
              background-color: white;
            ">
              ${imageUrl ? `
                <img 
                  src="${imageUrl}" 
                  alt="${event.title}"
                  style="
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                  "
                  onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'display:flex;align-items:center;justify-content:center;height:100%;color:${markerColor};\\\'><svg width=\\'16\\' height=\\'16\\' viewBox=\\'0 0 24 24\\' fill=\\'currentColor\\'><path d=\\'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z\\'/></svg></div>';"
                />
              ` : `
                <div style="
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  height: 100%;
                  color: ${markerColor};
                ">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                </div>
              `}
            </div>
          `,
          iconSize: [40, 30],
          iconAnchor: [20, 15],
          popupAnchor: [0, 25]
        });

        const marker = L.marker([event.latitude, event.longitude], {
          icon: markerIcon
        });

        const popupContent = `
          <div style="min-width: 200px; max-width: 280px;">
            <h3 style="font-weight: bold; margin-bottom: 8px; color: #1f2937; font-size: 15px;">${event.title}</h3>
            <p style="margin-bottom: 10px; color: #6b7280; font-size: 13px; line-height: 1.4;">${event.description}</p>
            <div style="display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: #374151;">
              <div><strong>Type:</strong> ${event.type === 'action_realisee' ? 'Action réalisée' : 'Événement à venir'}</div>
              <div><strong>Date:</strong> ${new Date(event.event_date).toLocaleDateString('fr-FR')}</div>
              ${event.governorate?.name ? `<div><strong>Gouvernorat:</strong> ${event.governorate.name}</div>` : ''}
              ${event.people_impacted ? `<div><strong>Personnes impactées:</strong> ${event.people_impacted}</div>` : ''}
              ${event.available_places ? `<div><strong>Places disponibles:</strong> ${event.available_places}</div>` : ''}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, {
          autoPan: true,
          autoPanPadding: [80, 80],
          maxHeight: 250,
          maxWidth: 280,
          closeButton: true,
          keepInView: false,
          className: 'custom-popup-overflow'
        });
        marker.addTo(map);
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [governorates, events]);

  return <div ref={mapContainerRef} style={{ width: '100%', height: '600px', position: 'relative', zIndex: 1 }} />;
};
