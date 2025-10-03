import * as L from 'leaflet';

export interface City {
  id: string;
  name: string;
  region: string;
  image: string;
  description: string;
  position: {
    lat: number;
    lng: number;
  };
  type?: 'hotel' | 'guesthouse' | 'activity';
  price?: string;
  rating?: number;
  services?: string[];
  phone?: string;
  hours?: string;
}

export interface MapState {
  map: L.Map | null;
  markers: L.Marker[];
  polyline: L.Polyline | null;
}
