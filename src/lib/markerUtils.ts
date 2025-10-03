import * as L from 'leaflet';
import { City } from '@/types/map';

const getMarkerConfig = (type?: string) => {
  switch (type) {
    case 'activity':
      return {
        color: '#347EFF',
        icon: '🎯',
        label: 'Activité'
      };
    case 'hotel':
      return {
        color: '#22C55E',
        icon: '🏨',
        label: 'Hôtel'
      };
    case 'guesthouse':
      return {
        color: '#F59E0B',
        icon: '🏠',
        label: 'Maison d\'hôte'
      };
    default:
      return {
        color: '#6366F1',
        icon: '📍',
        label: 'Lieu'
      };
  }
};

export const createCustomMarker = (city: City, isSelected: boolean): L.DivIcon => {
  const config = getMarkerConfig(city.type);
  const size = isSelected ? 32 : 24;
  const imageSize = isSelected ? 24 : 16;
  
  const iconHtml = `
    <div style="
      width: ${size}px;
      height: ${size}px;
      background-color: ${config.color};
      border: ${isSelected ? 3 : 2}px solid #FFFFFF;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      transition: all 0.3s ease;
      opacity: 0.9;
      ${isSelected ? 'animation: bounce 1.5s ease-in-out;' : ''}
    ">
      <span style="font-size: ${imageSize}px;">${config.icon}</span>
    </div>
  `;

  return new L.DivIcon({
    html: iconHtml,
    className: 'custom-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
};

export const createPopup = (city: City, isSelected: boolean): string => {
  const config = getMarkerConfig(city.type);
  
  return `
    <div style="font-family: Inter, sans-serif; min-width: 180px; max-width: 220px;">
      ${city.image ? `
        <div style="margin-bottom: 8px; position: relative;">
          <img src="${city.image}" alt="${city.name}" style="
            width: 100%;
            height: 100px;
            object-fit: cover;
            border-radius: 6px;
          " />
          ${isSelected ? `
            <div style="
              position: absolute;
              top: 6px;
              left: 6px;
              background-color: #dc2626;
              color: white;
              padding: 2px 6px;
              border-radius: 8px;
              font-size: 10px;
              font-weight: bold;
            ">✓ SÉLECTIONNÉ</div>
          ` : ''}
          <div style="
            position: absolute;
            top: 6px;
            right: 6px;
            background-color: ${config.color};
            color: white;
            padding: 2px 6px;
            border-radius: 8px;
            font-size: 10px;
            font-weight: bold;
          ">${config.icon} ${config.label}</div>
        </div>
      ` : ''}
      
      <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">
        ${city.name}
      </div>
      
      <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px;">
        📍 ${city.region}
      </div>
      
      ${city.price ? `
        <div style="font-size: 12px; color: ${config.color}; font-weight: 600; margin-bottom: 4px;">
          💰 ${city.price}/nuit
        </div>
      ` : ''}
      
      ${city.rating ? `
        <div style="font-size: 11px; color: #f59e0b; margin-bottom: 4px;">
          ${'⭐'.repeat(Math.floor(city.rating))} (${city.rating}/5)
        </div>
      ` : ''}
      
      <div style="font-size: 11px; color: #4b5563; margin-top: 6px;">
        ${city.description.substring(0, 100)}...
      </div>
    </div>
  `;
};

export const findMarkerByCity = (
  markers: L.Marker[],
  cityId: string
): L.Marker | null => {
  return markers.find(m => (m as any).cityData?.id === cityId) || null;
};

export const animateMarker = (marker: L.Marker | null, city?: City) => {
  if (!marker || !city) return;
  
  marker.setIcon(createCustomMarker(city, true));
  
  setTimeout(() => {
    marker.setIcon(createCustomMarker(city, false));
  }, 1500);
};
