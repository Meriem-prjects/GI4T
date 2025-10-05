import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Event } from '@/types/events';
import { Governorate } from '@/types/events';
import tunisiaBordersData from '@/data/tunisia-borders.json';
import tunisiaOutline from '@/data/tunisia-outline.json';
import { getGovernorateColor, countEventsByGovernorate } from '@/lib/governorateUtils';

interface GovernorateMapProps {
  governorates: Governorate[];
  events: Event[];
  onGovernorateClick?: (governorateId: string) => void;
}

export const GovernorateMap = ({ governorates, events, onGovernorateClick }: GovernorateMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [selectedGovernorate, setSelectedGovernorate] = useState<string | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map
    if (!mapRef.current) {
      // Limites géographiques strictes de la Tunisie
      const tunisiaBounds: L.LatLngBoundsExpression = [
        [30.2, 7.5],  // Sud-Ouest (plus serré)
        [37.5, 11.6]  // Nord-Est (plus serré)
      ];

      mapRef.current = L.map(mapContainerRef.current, {
        center: [34.0, 9.5],  // Centre ajusté
        zoom: 7,              // Zoom initial plus proche
        minZoom: 7,           // Zoom minimum augmenté pour éviter de voir les pays voisins
        maxZoom: 12,          // Zoom maximum réduit
        maxBounds: tunisiaBounds,
        maxBoundsViscosity: 1.0,
        zoomControl: true,
      });

      // Fond de carte simplifié
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapRef.current);

      // Créer un masque inversé pour cacher tout ce qui est en dehors de la Tunisie
      const worldBounds: [number, number][][] = [
        [
          [-90, -180],
          [90, -180],
          [90, 180],
          [-90, 180],
          [-90, -180]
        ]
      ];
      
      // Obtenir les coordonnées de la Tunisie et les inverser pour créer un trou
      const tunisiaCoords = (tunisiaOutline as any).features[0].geometry.coordinates[0];
      const invertedCoords = [worldBounds[0], tunisiaCoords];
      
      L.polygon(invertedCoords, {
        color: 'transparent',
        fillColor: 'white',
        fillOpacity: 1,
        interactive: false,
        pane: 'overlayPane'
      }).addTo(mapRef.current);

      // Compter les événements par gouvernorat
      const eventCounts = countEventsByGovernorate(events);
      
      // Créer un mapping des noms de gouvernorats vers leurs IDs
      const governorateNameToId: Record<string, string> = {};
      governorates.forEach(gov => {
        governorateNameToId[gov.name] = gov.id;
      });

      // Ajouter la couche GeoJSON pour les frontières des gouvernorats
      geoJsonLayerRef.current = L.geoJSON(tunisiaBordersData as any, {
        style: (feature) => {
          const adminLevel = feature?.properties?.admin_level;
          const governorateName = feature?.properties?.shape1;
          
          // Trouver l'ID du gouvernorat
          const governorateId = governorateName ? governorateNameToId[governorateName] : null;
          const eventCount = governorateId ? (eventCounts[governorateId] || 0) : 0;
          
          // Obtenir la couleur basée sur le nombre d'événements
          const fillColor = getGovernorateColor(eventCount);
          const isSelected = governorateId === selectedGovernorate;
          
          return {
            color: isSelected ? '#DC2626' : '#1e40af',
            weight: adminLevel === '4' ? (isSelected ? 3 : 2.5) : 1.5,
            opacity: 0.9,
            fillColor: fillColor,
            fillOpacity: eventCount > 0 ? 0.5 : 0.1
          };
        },
        onEachFeature: (feature, layer) => {
          const governorateName = feature.properties?.shape1;
          const governorateId = governorateName ? governorateNameToId[governorateName] : null;
          const eventCount = governorateId ? (eventCounts[governorateId] || 0) : 0;
          
          if (governorateName) {
            // Ajouter un tooltip avec le nom et le nombre d'événements
            layer.bindTooltip(
              `<strong>${governorateName}</strong><br/>${eventCount} événement${eventCount !== 1 ? 's' : ''}`,
              {
                permanent: false,
                direction: 'center',
                className: 'governorate-label'
              }
            );
            
            // Ajouter l'interaction au clic
            layer.on('click', () => {
              if (governorateId) {
                setSelectedGovernorate(governorateId);
                if (onGovernorateClick) {
                  onGovernorateClick(governorateId);
                }
              }
            });
            
            // Ajouter un effet de survol
            layer.on('mouseover', function(this: L.Path) {
              this.setStyle({
                weight: 3,
                opacity: 1
              });
            });
            
            layer.on('mouseout', function(this: L.Path) {
              const isSelected = governorateId === selectedGovernorate;
              this.setStyle({
                weight: isSelected ? 3 : 2.5,
                opacity: 0.9
              });
            });
          }
        }
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
        const markerIcon = L.divIcon({
          className: 'custom-event-marker',
          html: `
            <div style="
              background-color: ${markerColor};
              width: 32px;
              height: 32px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
            ">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -16]
        });

        const marker = L.marker([event.latitude, event.longitude], {
          icon: markerIcon
        });

        const popupContent = `
          <div style="min-width: 200px;">
            <h3 style="font-weight: bold; margin-bottom: 8px; color: #1f2937;">${event.title}</h3>
            <p style="margin-bottom: 8px; color: #6b7280; font-size: 14px;">${event.description}</p>
            <div style="display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: #374151;">
              <div><strong>Type:</strong> ${event.type === 'action_realisee' ? 'Action réalisée' : 'Événement à venir'}</div>
              <div><strong>Date:</strong> ${new Date(event.event_date).toLocaleDateString('fr-FR')}</div>
              ${event.governorate?.name ? `<div><strong>Gouvernorat:</strong> ${event.governorate.name}</div>` : ''}
              ${event.people_impacted ? `<div><strong>Personnes impactées:</strong> ${event.people_impacted}</div>` : ''}
              ${event.available_places ? `<div><strong>Places disponibles:</strong> ${event.available_places}</div>` : ''}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
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

  // Mettre à jour les styles quand la sélection change
  useEffect(() => {
    if (geoJsonLayerRef.current) {
      const eventCounts = countEventsByGovernorate(events);
      const governorateNameToId: Record<string, string> = {};
      governorates.forEach(gov => {
        governorateNameToId[gov.name] = gov.id;
      });

      geoJsonLayerRef.current.eachLayer((layer: any) => {
        const feature = layer.feature;
        const governorateName = feature?.properties?.shape1;
        const governorateId = governorateName ? governorateNameToId[governorateName] : null;
        const eventCount = governorateId ? (eventCounts[governorateId] || 0) : 0;
        const fillColor = getGovernorateColor(eventCount);
        const isSelected = governorateId === selectedGovernorate;

        layer.setStyle({
          color: isSelected ? '#DC2626' : '#1e40af',
          weight: isSelected ? 3 : 2.5,
          fillColor: fillColor,
          fillOpacity: eventCount > 0 ? 0.5 : 0.1
        });
      });
    }
  }, [selectedGovernorate, events, governorates]);

  return (
    <>
      <style>{`
        .governorate-label {
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid #1e40af;
          border-radius: 4px;
          padding: 6px 10px;
          font-weight: 600;
          font-size: 13px;
          color: #1e40af;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .governorate-label strong {
          display: block;
          margin-bottom: 2px;
        }
      `}</style>
      <div ref={mapContainerRef} style={{ width: '100%', height: '600px' }} />
    </>
  );
};
