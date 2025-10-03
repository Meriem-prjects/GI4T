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
      mapRef.current = L.map(mapContainerRef.current, {
        center: [34.0, 9.0],
        zoom: 6,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;

    // Clear existing layers
    map.eachLayer((layer) => {
      if (layer instanceof L.GeoJSON || layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Add governorate boundaries
    governorates.forEach((gov) => {
      if (gov.geojson) {
        L.geoJSON(gov.geojson as GeoJSON.Feature, {
          style: {
            color: '#94a3b8',
            weight: 2,
            fillOpacity: 0.1,
            fillColor: '#e2e8f0',
          },
        }).addTo(map);
      }
    });

    // Add event markers
    events.forEach((event) => {
      if (event.latitude && event.longitude) {
        const markerColor = event.type === 'action_realisee' ? '#22c55e' : '#3b82f6';
        const icon = L.divIcon({
          className: 'custom-event-marker',
          html: `<div style="background-color: ${markerColor}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([event.latitude, event.longitude], { icon })
          .bindPopup(`
            <div style="min-width: 200px;">
              <h3 style="font-weight: bold; margin-bottom: 8px;">${event.title}</h3>
              <p style="font-size: 14px; color: #64748b; margin-bottom: 4px;">
                ${event.type === 'action_realisee' ? '✅ Action réalisée' : '📅 Événement à venir'}
              </p>
              <p style="font-size: 14px; margin-bottom: 4px;">${event.description}</p>
              <p style="font-size: 12px; color: #94a3b8;">
                📍 ${event.governorate?.name || 'Non spécifié'}<br/>
                📅 ${new Date(event.event_date).toLocaleDateString('fr-FR')}
              </p>
            </div>
          `)
          .addTo(map);
      }
    });

    // Add legend
    const LegendControl = L.Control.extend({
      onAdd: function() {
        const div = L.DomUtil.create('div', 'info legend');
        div.style.background = 'white';
        div.style.padding = '10px';
        div.style.borderRadius = '5px';
        div.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        div.innerHTML = `
          <div style="font-weight: bold; margin-bottom: 8px;">Légende</div>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <div style="background-color: #22c55e; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white;"></div>
            <span style="font-size: 14px;">Action réalisée</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white;"></div>
            <span style="font-size: 14px;">Événement à venir</span>
          </div>
        `;
        return div;
      },
      options: { position: 'bottomright' }
    });
    
    new LegendControl().addTo(map);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [governorates, events]);

  return <div ref={mapContainerRef} style={{ width: '100%', height: '600px' }} />;
};
