import { Event } from "@/types/events";

/**
 * Obtient la couleur d'un gouvernorat selon le nombre d'événements
 */
export const getGovernorateColor = (eventCount: number): string => {
  if (eventCount === 0) return '#E5E7EB'; // Gris clair
  if (eventCount <= 3) return '#FEF3C7'; // Jaune clair
  if (eventCount <= 6) return '#FCD34D'; // Jaune
  if (eventCount <= 10) return '#F59E0B'; // Orange
  return '#DC2626'; // Rouge
};

/**
 * Compte les événements par gouvernorat
 */
export const countEventsByGovernorate = (
  events: Event[]
): Record<string, number> => {
  const counts: Record<string, number> = {};
  
  events.forEach((event) => {
    if (event.governorate_id) {
      counts[event.governorate_id] = (counts[event.governorate_id] || 0) + 1;
    }
  });
  
  return counts;
};

/**
 * Obtient le centre d'un polygone GeoJSON
 */
export const getPolygonCenter = (coordinates: number[][][]): [number, number] => {
  let totalLat = 0;
  let totalLng = 0;
  let count = 0;

  coordinates[0].forEach(([lng, lat]) => {
    totalLng += lng;
    totalLat += lat;
    count++;
  });

  return [totalLat / count, totalLng / count];
};

/**
 * Filtre les événements par gouvernorat
 */
export const filterEventsByGovernorate = (
  events: Event[],
  governorateId?: string
): Event[] => {
  if (!governorateId) return events;
  return events.filter(event => event.governorate_id === governorateId);
};

/**
 * Obtient le label du type d'événement
 */
export const getEventTypeLabel = (type: 'action_realisee' | 'evenement_a_venir'): string => {
  return type === 'action_realisee' ? 'Action réalisée' : 'Événement à venir';
};

/**
 * Obtient la couleur du badge selon le type d'événement
 */
export const getEventTypeBadgeColor = (type: 'action_realisee' | 'evenement_a_venir'): string => {
  return type === 'action_realisee' ? 'bg-green-500' : 'bg-blue-500';
};
