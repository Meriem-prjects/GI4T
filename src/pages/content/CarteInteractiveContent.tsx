import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, Calendar, MapPin, Users, X } from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { useGovernorates } from "@/hooks/useGovernorates";
import { GovernorateMap } from "@/components/map/GovernorateMap";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";
import type { Event } from "@/types/events";

type FilterType = 'all' | 'action_realisee' | 'evenement_a_venir';

const CarteInteractiveContent = () => {
  const { events = [] } = useEvents();
  const { governorates = [] } = useGovernorates();
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedGovernorate, setSelectedGovernorate] = useState<string | null>(null);
  const { isRTL } = useLanguage();
  const { t } = useTranslation();

  // Type filter + governorate filter (when a region is selected on the SVG map).
  const filteredEvents = useMemo(() => {
    return events.filter((event: Event) => {
      if (filter !== 'all' && event.type !== filter) return false;
      if (selectedGovernorate && event.governorate?.name !== selectedGovernorate) return false;
      return true;
    });
  }, [events, filter, selectedGovernorate]);

  const selectedGovernorateAr = useMemo(() => {
    if (!selectedGovernorate) return null;
    return governorates.find((g) => g.name === selectedGovernorate)?.name_ar ?? selectedGovernorate;
  }, [governorates, selectedGovernorate]);

  return (
    <main className={`flex-1 ${isRTL ? 'font-almarai' : ''}`}>
      {/* Breadcrumb */}
      <div className="bg-muted/30 py-2">
        <div className="container mx-auto px-4">
          <div className={`flex items-center gap-2 text-sm text-muted-foreground ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
            <span>{t('home')}</span>
            <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            <span>{t('accessRights')}</span>
            <ChevronRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
            <span className="text-foreground">{t('mapInteractiveTitle')}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className={`text-center mb-8 animate-fade-in ${isRTL ? 'text-right' : ''}`}>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{t('mapInteractiveTitle')}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('mapDescription')}
          </p>
        </div>

        {/* Layout: Map first on mobile, then Events List */}
        <div className="flex flex-col lg:grid lg:grid-cols-[30%_70%] gap-4 lg:gap-6">
          {/* Map - First on mobile */}
          <div className="order-1 lg:order-2 lg:sticky lg:top-4 h-[300px] sm:h-[400px] lg:h-[700px] overflow-visible">
            <Card className="h-full overflow-visible">
              <CardContent className="p-0 h-full overflow-visible relative">
                <GovernorateMap
                  governorates={governorates}
                  events={filteredEvents}
                  selectedGovernorate={selectedGovernorate}
                  onGovernorateClick={setSelectedGovernorate}
                />
                
                {/* Legend */}
                <div className={`absolute top-2 sm:top-4 ${isRTL ? 'left-2 sm:left-4' : 'right-2 sm:right-4'} bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-2 sm:p-3 space-y-1.5 sm:space-y-2 border border-gray-200 z-[1000]`}>
                  <div className={`flex items-center gap-1.5 sm:gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-600 rounded"></div>
                    <span className="text-[10px] sm:text-xs font-medium text-gray-700">{t('actionCompleted')}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 sm:gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-600 rounded"></div>
                    <span className="text-[10px] sm:text-xs font-medium text-gray-700">{t('upcomingEvent')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Events List - Second on mobile */}
          <div className="order-2 lg:order-1 space-y-3 sm:space-y-4 lg:overflow-y-auto lg:max-h-[700px] lg:pr-2 scrollbar-events">
            <div className="sticky top-0 bg-background z-10 pb-3 sm:pb-4 space-y-3 sm:space-y-4">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <h2 className="text-lg sm:text-xl font-semibold">{t('events')}</h2>
                <Badge variant="outline" className="text-xs sm:text-sm">{filteredEvents.length} {filteredEvents.length !== 1 ? t('events').toLowerCase() : t('events').toLowerCase()}</Badge>
              </div>
              
              {/* Filter Bar - Stacked on mobile */}
              <div className="flex flex-col sm:flex-row gap-2 sm:flex-wrap">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                  className="flex-1 sm:min-w-[100px] h-10 sm:h-9 text-sm"
                >
                  {t('allEvents')}
                </Button>
                <Button
                  variant={filter === 'action_realisee' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('action_realisee')}
                  className={`flex-1 sm:min-w-[140px] h-10 sm:h-9 text-sm ${
                    filter === 'action_realisee' 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'border-green-600 text-green-600 hover:bg-green-50'
                  }`}
                >
                  {t('completedActions')}
                </Button>
                <Button
                  variant={filter === 'evenement_a_venir' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('evenement_a_venir')}
                  className={`flex-1 sm:min-w-[140px] h-10 sm:h-9 text-sm ${
                    filter === 'evenement_a_venir'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'border-blue-600 text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {t('upcomingEvents')}
                </Button>
              </div>

              {/* Active governorate filter chip — appears when a region is clicked on the SVG map */}
              {selectedGovernorate && (
                <div className={`flex items-center ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                  <button
                    type="button"
                    onClick={() => setSelectedGovernorate(null)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors ${isRTL ? 'flex-row-reverse font-almarai' : ''}`}
                  >
                    <MapPin className="h-3 w-3" />
                    <span>
                      {isRTL ? `الولاية : ${selectedGovernorateAr}` : `Filtré par : ${selectedGovernorate}`}
                    </span>
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
            
            {filteredEvents.length === 0 ? (
              <div className="text-center py-8 sm:py-12 text-muted-foreground">
                <Calendar className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                <p className="text-sm sm:text-base">{t('noResults')}</p>
              </div>
            ) : (
              filteredEvents.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-3 sm:p-4">
                    {/* Event Image */}
                    {event.images && event.images.length > 0 && (
                      <div className="mb-3 sm:mb-4 rounded-lg overflow-hidden">
                        <img 
                          src={event.images[0]} 
                          alt={event.title}
                          className="w-full h-36 sm:h-48 object-cover"
                        />
                      </div>
                    )}
                    
                    {/* Event Info */}
                    <div className="space-y-2 sm:space-y-3">
                      <div className={`flex items-start justify-between gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <h3 className={`font-semibold text-base sm:text-lg flex-1 ${isRTL ? 'text-right' : ''}`}>{event.title}</h3>
                        <Badge 
                          className={`flex-shrink-0 text-xs ${
                            event.type === 'action_realisee' 
                              ? 'bg-green-600 text-white hover:bg-green-700' 
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {event.type === 'action_realisee' ? t('actionCompleted') : t('upcomingEvent')}
                        </Badge>
                      </div>
                      
                      <p className={`text-xs sm:text-sm text-muted-foreground line-clamp-2 ${isRTL ? 'text-right' : ''}`}>
                        {event.description}
                      </p>
                      
                      <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                        <div className={`flex items-center gap-2 text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span>{new Date(event.event_date).toLocaleDateString(isRTL ? 'ar-TN' : 'fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}</span>
                        </div>
                        
                        {event.governorate?.name && (
                          <div className={`flex items-center gap-2 text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span>{event.governorate.name}</span>
                          </div>
                        )}
                        
                        {event.people_impacted && (
                          <div className={`flex items-center gap-2 text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span>{event.people_impacted} {isRTL ? 'شخص متأثر' : 'personnes impactées'}</span>
                          </div>
                        )}
                        
                        {event.available_places && event.type === 'evenement_a_venir' && (
                          <div className={`flex items-center gap-2 text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span>{event.available_places} {isRTL ? 'مقعد متاح' : 'places disponibles'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default CarteInteractiveContent;