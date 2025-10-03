import * as L from 'leaflet';
import { City } from '@/types/map';

export const navigateToCity = (
  map: L.Map,
  city: City,
  zoom: number = 10
) => {
  const currentZoom = map.getZoom();
  
  if (currentZoom > 7) {
    map.setZoom(7);
    
    setTimeout(() => {
      map.panTo([city.position.lat, city.position.lng]);
      setTimeout(() => {
        map.setZoom(zoom);
      }, 500);
    }, 300);
  } else {
    map.panTo([city.position.lat, city.position.lng]);
    setTimeout(() => {
      map.setZoom(zoom);
    }, 500);
  }
};

export const createAnimatedPolyline = (
  coordinates: L.LatLngExpression[],
  map: L.Map
): L.Polyline => {
  const polyline = L.polyline(coordinates, {
    color: '#347EFF',
    weight: 4,
    opacity: 1,
    smoothFactor: 1
  }).addTo(map);

  return polyline;
};

export const createFullscreenControl = (): L.Control => {
  const control = new L.Control({ position: 'topright' });
  
  control.onAdd = function() {
    const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
    div.innerHTML = `
      <a href="#" title="Plein écran" style="
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: white;
        text-decoration: none;
        color: #333;
        font-size: 18px;
      ">⛶</a>
    `;
    
    div.onclick = function(e) {
      e.preventDefault();
      const mapContainer = document.getElementById('map-container');
      if (mapContainer) {
        if (!document.fullscreenElement) {
          mapContainer.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
      }
    };
    
    return div;
  };
  
  return control;
};

export const createMapLegend = (): L.Control => {
  const legend = new L.Control({ position: 'bottomleft' });
  
  legend.onAdd = function() {
    const div = L.DomUtil.create('div', 'map-legend');
    div.innerHTML = `
      <div style="background: white; padding: 10px; border-radius: 6px; box-shadow: 0 1px 5px rgba(0,0,0,0.2); font-size: 12px;">
        <div style="font-weight: bold; margin-bottom: 6px;">Légende</div>
        <div style="display: flex; align-items: center; margin-bottom: 4px;">
          <span style="display: inline-block; width: 12px; height: 12px; background: #347EFF; border-radius: 50%; margin-right: 6px;"></span>
          <span>Activité</span>
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 4px;">
          <span style="display: inline-block; width: 12px; height: 12px; background: #22C55E; border-radius: 50%; margin-right: 6px;"></span>
          <span>Hôtel</span>
        </div>
        <div style="display: flex; align-items: center;">
          <span style="display: inline-block; width: 12px; height: 12px; background: #F59E0B; border-radius: 50%; margin-right: 6px;"></span>
          <span>Maison d'hôte</span>
        </div>
      </div>
    `;
    return div;
  };
  
  return legend;
};
