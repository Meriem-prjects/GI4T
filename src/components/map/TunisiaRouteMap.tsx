import { useState, useRef } from 'react';
import { City } from '@/types/map';
import { tunisiaCities, routePath } from '@/data/tunisiaCities';
import { useLeafletMap } from '@/hooks/useLeafletMap';
import { navigateToCity } from '@/lib/mapUtils';
import { findMarkerByCity, animateMarker } from '@/lib/markerUtils';
import { CityTags } from './CityTags';
import { CityDetails } from './CityDetails';

export const TunisiaRouteMap = () => {
  const [selectedCity, setSelectedCity] = useState<City | null>(tunisiaCities[0]);
  const mapRef = useRef<HTMLDivElement>(null);

  const handleCityClick = (city: City) => {
    if (selectedCity?.id === city.id && mapState.map) {
      navigateToCity(mapState.map, city, 13);
    } else {
      setSelectedCity(city);
      if (mapState.map) {
        navigateToCity(mapState.map, city, 10);
      }
    }
  };

  const handleTagClick = (city: City) => {
    setSelectedCity(city);
    if (mapState.map) {
      navigateToCity(mapState.map, city, 10);
      const marker = findMarkerByCity(mapState.markers, city.id);
      if (marker) {
        animateMarker(marker, city);
      }
    }
  };

  const handleCityDoubleClick = (city: City) => {
    setSelectedCity(city);
    if (mapState.map) {
      navigateToCity(mapState.map, city, 14);
    }
  };

  const { mapLoaded, mapState } = useLeafletMap({
    mapRef,
    selectedCity,
    cities: tunisiaCities,
    routePath,
    handleCityClick
  });

  return (
    <div className="space-y-6">
      {/* City Tags */}
      <CityTags
        cities={tunisiaCities}
        selectedCity={selectedCity}
        onTagClick={handleTagClick}
        onTagDoubleClick={handleCityDoubleClick}
      />

      {/* Map and Details */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Map Container */}
        <div className="lg:w-1/2">
          <Card className="overflow-hidden">
            <div 
              id="map-container"
              ref={mapRef} 
              className="w-full h-[500px] lg:h-[600px]"
            />
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <p className="text-muted-foreground">Chargement de la carte...</p>
              </div>
            )}
          </Card>
        </div>

        {/* City Details */}
        <div className="lg:w-1/2">
          <CityDetails city={selectedCity} />
        </div>
      </div>
    </div>
  );
};

// Import Card for the map container
import { Card } from '@/components/ui/card';
