import { useEffect, useRef, useState } from 'react';
import * as L from 'leaflet';
import { City, MapState } from '@/types/map';
import { createCustomMarker, createPopup, findMarkerByCity } from '@/lib/markerUtils';
import { createAnimatedPolyline, createFullscreenControl, createMapLegend } from '@/lib/mapUtils';

interface UseLeafletMapProps {
  mapRef: React.RefObject<HTMLDivElement>;
  selectedCity: City | null;
  cities: City[];
  routePath: string[];
  handleCityClick: (city: City) => void;
}

export const useLeafletMap = ({
  mapRef,
  selectedCity,
  cities,
  routePath,
  handleCityClick
}: UseLeafletMapProps) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapState, setMapState] = useState<MapState>({
    map: null,
    markers: [],
    polyline: null
  });
  const markersRef = useRef<L.Marker[]>([]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapState.map) return;

    const map = L.map(mapRef.current, {
      center: [34.5, 9.5],
      zoom: 7,
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      dragging: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    // Add custom controls
    createFullscreenControl().addTo(map);
    createMapLegend().addTo(map);

    // Create markers
    const markers: L.Marker[] = [];
    cities.forEach((city) => {
      const isSelected = selectedCity?.id === city.id;
      const customIcon = createCustomMarker(city, isSelected);
      
      const marker = L.marker([city.position.lat, city.position.lng], {
        icon: customIcon
      });

      (marker as any).cityData = city;
      marker.bindPopup(createPopup(city, isSelected));

      marker.on('mouseover', () => {
        marker.openPopup();
      });

      marker.on('mouseout', () => {
        marker.closePopup();
      });

      marker.on('click', () => {
        handleCityClick(city);
      });

      marker.addTo(map);
      markers.push(marker);
    });

    markersRef.current = markers;

    // Create route polyline
    const routeCoordinates: L.LatLngExpression[] = routePath
      .map(cityId => {
        const city = cities.find(c => c.id === cityId);
        return city ? [city.position.lat, city.position.lng] as L.LatLngExpression : null;
      })
      .filter((pos): pos is L.LatLngExpression => pos !== null);

    const polyline = createAnimatedPolyline(routeCoordinates, map);

    // Fit bounds
    const group = new L.FeatureGroup(markers);
    map.fitBounds(group.getBounds(), { padding: [20, 20] });
    
    if (map.getZoom() > 7) {
      map.setZoom(7);
    }

    setMapState({
      map,
      markers,
      polyline
    });
    setMapLoaded(true);

    return () => {
      map.remove();
    };
  }, [mapRef]);

  // Update markers when selection changes
  useEffect(() => {
    if (!mapState.map || !markersRef.current.length || !selectedCity) return;

    markersRef.current.forEach(marker => {
      const cityData = (marker as any).cityData as City;
      const isSelected = cityData.id === selectedCity.id;
      marker.setIcon(createCustomMarker(cityData, isSelected));
      marker.setPopupContent(createPopup(cityData, isSelected));
    });
  }, [selectedCity, mapState.map]);

  return {
    mapLoaded,
    mapState
  };
};
