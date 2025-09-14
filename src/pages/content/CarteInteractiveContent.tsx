import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Phone, Clock, Navigation, Filter, ChevronRight } from "lucide-react";

const CarteInteractiveContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("Tous");

  const services = [
    {
      id: 1,
      name: "Centre de médiation sociale Nord",
      type: "Médiation",
      address: "12 Avenue Habib Bourguiba, Tunis 1001",
      phone: "+216 71 123 456",
      hours: "Lun-Ven: 8h-17h",
      distance: "0.8 km",
      services: ["Médiation familiale", "Aide juridique", "Accompagnement social"]
    },
    {
      id: 2,
      name: "Bureau d'aide juridictionnelle",
      type: "Justice",
      address: "Avenue de la République, Tunis 1000",
      phone: "+216 71 234 567", 
      hours: "Lun-Mer-Ven: 9h-16h",
      distance: "1.2 km",
      services: ["Aide juridictionnelle", "Consultation gratuite", "Assistance judiciaire"]
    },
    {
      id: 3,
      name: "Délégué à la protection des droits",
      type: "Protection",
      address: "Rue de la Liberté, Tunis 1002",
      phone: "+216 71 345 678",
      hours: "Mar-Jeu: 14h-18h",
      distance: "2.1 km",
      services: ["Protection des droits", "Réclamations", "Médiation administrative"]
    },
    {
      id: 4,
      name: "Centre d'accueil et d'orientation",
      type: "Orientation",
      address: "Boulevard du 20 Mars, Tunis 1005",
      phone: "+216 71 456 789",
      hours: "Lun-Ven: 8h30-16h30",
      distance: "0.5 km", 
      services: ["Orientation juridique", "Information citoyenne", "Aide administrative"]
    },
    {
      id: 5,
      name: "Antenne mobile de proximité",
      type: "Mobile",
      address: "Place de l'Indépendance (Jeudi)",
      phone: "+216 71 567 890",
      hours: "Jeudi: 10h-15h",
      distance: "Variable",
      services: ["Consultations mobiles", "Information de proximité", "Aide ponctuelle"]
    }
  ];

  const serviceTypes = ["Tous", "Médiation", "Justice", "Protection", "Orientation", "Mobile"];

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.services.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === "Tous" || service.type === selectedType;
    return matchesSearch && matchesType;
  });

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
            Trouvez les services d'accès aux droits près de chez vous grâce à notre carte interactive.
          </p>
        </div>

        {/* Search and Location */}
        <div className="mb-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un service, une adresse..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Navigation className="h-4 w-4" />
              Me géolocaliser
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {serviceTypes.map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(type)}
                className="transition-all duration-200"
              >
                {type}
              </Button>
            ))}
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="mb-8 animate-fade-in">
          <div className="bg-muted/20 border-2 border-dashed border-muted-foreground/20 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Carte interactive en cours de développement
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                La carte sera bientôt disponible pour localiser les services
              </p>
            </div>
          </div>
        </div>

        {/* Services List */}
        <div className="mb-12 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">
              Services disponibles {selectedType !== "Tous" && `- ${selectedType}`}
            </h2>
            <Badge variant="outline" className="text-sm">
              {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          
          <div className="space-y-4">
            {filteredServices.map((service) => (
              <Card key={service.id} className="hover:shadow-md transition-shadow duration-300 hover-scale">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-semibold text-lg">{service.name}</h3>
                        <Badge variant="outline">{service.type}</Badge>
                        <Badge variant="secondary" className="text-xs">
                          {service.distance}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                          {service.address}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                          {service.phone}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                          {service.hours}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">Services proposés :</p>
                        <div className="flex flex-wrap gap-2">
                          {service.services.map((serviceItem, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {serviceItem}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:ml-4">
                      <Button className="flex items-center gap-2">
                        <Navigation className="h-4 w-4" />
                        Itinéraire
                      </Button>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Appeler
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Load More & Report Missing Service */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
          <Button variant="outline" className="w-full sm:w-auto">
            Voir plus de services
          </Button>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Un service manquant ?
            </p>
            <Button variant="link" className="text-sm h-auto p-0">
              Signaler un service manquant
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CarteInteractiveContent;