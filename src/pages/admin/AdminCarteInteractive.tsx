import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Map, Edit, Calendar, Users, MapPin } from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { useGovernorates } from "@/hooks/useGovernorates";
import { EventEditor } from "@/components/admin/EventEditor";
import { GovernorateMap } from "@/components/map/GovernorateMap";

const AdminCarteInteractive = () => {
  const { events } = useEvents();
  const { governorates } = useGovernorates();

  // Calculs des statistiques
  const totalEvents = events.length;
  const actionsRealisees = events.filter(e => e.type === 'action_realisee').length;
  const evenementsAVenir = events.filter(e => e.type === 'evenement_a_venir').length;
  const totalPeopleImpacted = events
    .filter(e => e.type === 'action_realisee')
    .reduce((sum, e) => sum + (e.people_impacted || 0), 0);
  const totalRegistrations = events
    .filter(e => e.type === 'evenement_a_venir')
    .reduce((sum, e) => sum + (e.available_places || 0), 0);
  const governoratesCovered = new Set(events.map(e => e.governorate_id).filter(Boolean)).size;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Gestion Carte Interactive</h2>
        <p className="text-muted-foreground">
          Gérer les événements et actions par gouvernorat en Tunisie
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Total événements
            </CardDescription>
            <CardTitle className="text-2xl">{totalEvents}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1">
              ✅ Actions réalisées
            </CardDescription>
            <CardTitle className="text-2xl text-green-600">{actionsRealisees}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1">
              📅 À venir
            </CardDescription>
            <CardTitle className="text-2xl text-blue-600">{evenementsAVenir}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              Personnes touchées
            </CardDescription>
            <CardTitle className="text-2xl">{totalPeopleImpacted}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              Places disponibles
            </CardDescription>
            <CardTitle className="text-2xl">{totalRegistrations}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Gouvernorats couverts
            </CardDescription>
            <CardTitle className="text-2xl">{governoratesCovered}/{governorates.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="edit" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="edit" className="flex items-center gap-2">
            <Edit className="w-4 h-4" />
            <span className="hidden sm:inline">Édition</span>
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Map className="w-4 h-4" />
            <span className="hidden sm:inline">Preview</span>
          </TabsTrigger>
        </TabsList>

        {/* Edit Tab */}
        <TabsContent value="edit" className="space-y-4">
          <EventEditor />
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Aperçu de la carte interactive</CardTitle>
              <CardDescription>
                Visualisez les événements par gouvernorat sur la carte de Tunisie
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GovernorateMap governorates={governorates} events={events} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminCarteInteractive;
