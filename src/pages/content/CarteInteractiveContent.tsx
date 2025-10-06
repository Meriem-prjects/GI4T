import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Calendar, MapPin, Users } from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { useGovernorates } from "@/hooks/useGovernorates";
import { GovernorateMap } from "@/components/map/GovernorateMap";

const CarteInteractiveContent = () => {
  const { events = [] } = useEvents();
  const { governorates = [] } = useGovernorates();

  return (
    <main className="flex-1">
      {/* Breadcrumb */}
      <div className="bg-muted/30 py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Accueil</span>
            <ChevronRight className="h-4 w-4" />
            <span>Accès aux droits</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">Carte interactive</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Carte Interactive</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Découvrez les actions et événements d'accès aux droits sur l'ensemble du territoire tunisien.
          </p>
        </div>

        {/* Layout: Events List + Map */}
        <div className="grid grid-cols-1 lg:grid-cols-[30%_70%] gap-6">
          {/* Left Side - Events List */}
          <div className="space-y-4 overflow-y-auto max-h-[700px] pr-2">
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-background z-10 py-2">
              <h2 className="text-xl font-semibold">Événements</h2>
              <Badge variant="outline">{events.length} événement{events.length !== 1 ? 's' : ''}</Badge>
            </div>
            
            {events.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun événement disponible pour le moment</p>
              </div>
            ) : (
              events.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-4">
                    {/* Event Image */}
                    {event.images && event.images.length > 0 && (
                      <div className="mb-4 rounded-lg overflow-hidden">
                        <img 
                          src={event.images[0]} 
                          alt={event.title}
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    )}
                    
                    {/* Event Info */}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-lg flex-1">{event.title}</h3>
                        <Badge 
                          variant={event.type === 'action_realisee' ? 'default' : 'secondary'}
                          className="flex-shrink-0"
                        >
                          {event.type === 'action_realisee' ? 'Réalisée' : 'À venir'}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {event.description}
                      </p>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4 flex-shrink-0" />
                          <span>{new Date(event.event_date).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}</span>
                        </div>
                        
                        {event.governorate?.name && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            <span>{event.governorate.name}</span>
                          </div>
                        )}
                        
                        {event.people_impacted && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-4 w-4 flex-shrink-0" />
                            <span>{event.people_impacted} personnes impactées</span>
                          </div>
                        )}
                        
                        {event.available_places && event.type === 'evenement_a_venir' && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-4 w-4 flex-shrink-0" />
                            <span>{event.available_places} places disponibles</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Right Side - Map */}
          <div className="lg:sticky lg:top-4 h-[700px]">
            <Card className="h-full">
              <CardContent className="p-0 h-full">
                <GovernorateMap 
                  governorates={governorates} 
                  events={events} 
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CarteInteractiveContent;