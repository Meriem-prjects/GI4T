import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Phone, Clock, Mail, ChevronRight } from "lucide-react";

const AdressesUtilesContent = () => {
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
            <span className="text-foreground">Adresses utiles</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Adresses Utiles</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Retrouvez les coordonnées des principaux organismes et services d'accès aux droits.
          </p>
        </div>

        {/* Search */}
        <div className="mb-8 animate-fade-in">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une adresse, un organisme..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Addresses List */}
        <div className="space-y-6 animate-fade-in">
          {[
            {
              name: "Médiateur de la République",
              address: "Avenue de la Liberté, Tunis 1002",
              phone: "+216 71 832 090",
              email: "contact@mediateur.tn",
              hours: "Lun-Ven: 8h-17h",
              category: "Institution"
            },
            {
              name: "Instance Nationale de Lutte contre la Torture",
              address: "Rue du Lac Windermere, Les Berges du Lac, Tunis 1053",
              phone: "+216 71 862 400",
              email: "contact@inpt.tn",
              hours: "Lun-Ven: 9h-16h",
              category: "Institution"
            },
            {
              name: "Haute Autorité des Droits de l'Homme",
              address: "Rue de la Ligue Arabe, Tunis",
              phone: "+216 71 785 366",
              email: "contact@haica.tn",
              hours: "Lun-Ven: 8h30-17h30",
              category: "Institution"
            },
            {
              name: "Bureau d'Aide Juridictionnelle",
              address: "Palais de Justice, Avenue Bab Benat, Tunis",
              phone: "+216 71 567 890",
              email: "aide.juridique@justice.tn",
              hours: "Lun-Mer-Ven: 9h-15h",
              category: "Justice"
            },
            {
              name: "Centre National d'Assistance Juridique",
              address: "Avenue Habib Bourguiba, Tunis 1001",
              phone: "+216 71 123 456",
              email: "assistance@cnaj.tn",
              hours: "Lun-Ven: 8h-17h",
              category: "Aide juridique"
            }
          ].map((org, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-semibold text-lg">{org.name}</h3>
                      <Badge variant="outline">{org.category}</Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-start text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{org.address}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{org.phone}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{org.email}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{org.hours}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm">
                      <MapPin className="h-4 w-4 mr-2" />
                      Localiser
                    </Button>
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4 mr-2" />
                      Appeler
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
};

export default AdressesUtilesContent;
