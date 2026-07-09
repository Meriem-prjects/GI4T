export interface Governorate {
  id: string;
  name: string;
  name_ar?: string;
  code: string;
  geojson: GeoJSON.Feature;
  population?: number;
  area_km2?: number;
  created_at?: string;
  updated_at?: string;
}

// Compact album shape emitted alongside events for the "Voir les photos"
// CTA on the carte interactive. Only what the picker/viewer needs.
export interface EventLinkedAlbum {
  id: string;
  title: string;
  title_ar?: string | null;
  cover_image_url?: string | null;
  photo_urls?: string[];
}

export interface Event {
  id: string;
  title: string;
  title_ar?: string;
  description: string;
  description_ar?: string;
  type: 'action_realisee' | 'evenement_a_venir';
  governorate_id?: string;
  governorate?: Governorate;
  event_date: string;
  people_impacted?: number;
  available_places?: number;
  registration_enabled?: boolean;
  images?: string[];
  latitude?: number;
  longitude?: number;
  status?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  // Populated by GET /api/events (list + detail) via Prisma include.
  photo_albums?: EventLinkedAlbum[];
}

export interface EventRegistration {
  id: string;
  event_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  registered_at: string;
}

export interface EventFilters {
  type?: 'action_realisee' | 'evenement_a_venir' | 'all';
  governorate_id?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
}

export interface EventFormData {
  type: 'action_realisee' | 'evenement_a_venir';
  title: string;
  title_ar?: string;
  description: string;
  description_ar?: string;
  governorate_id?: string;
  event_date: string;
  people_impacted?: number;
  available_places?: number;
  registration_enabled?: boolean;
  images?: string[];
  latitude?: number;
  longitude?: number;
}
