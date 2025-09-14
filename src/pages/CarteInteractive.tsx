import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Search, MapPin, Phone, Clock, Navigation, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import AccesAuxDroitsNav from "@/components/AccesAuxDroitsNav";
import Footer from "@/components/Footer";

const CarteInteractive = () => {
  const services = [
    {
      name: "Maison de Justice et du Droit - Centre",
      type: "Justice",
      address: "15 Avenue Hassan II, Casablanca",
      phone: "05 22 12 34 56",
      hours: "Lun-Ven: 9h-17h",
      services: ["Aide juridictionnelle", "Médiation", "Information juridique"],
      distance: "1.2 km"
    },
    {
      name: "Point d'accès au droit - Maarif",
      type: "Aide juridique",
      address: "Boulevard Zerktouni, Casablanca",
      phone: "05 22 98 76 54",
      hours: "Mar-Sam: 10h-16h",
      services: ["Consultation gratuite", "Orientation juridique"],
      distance: "2.8 km"
    },
    {
      name: "Centre d'aide sociale",
      type: "Social",
      address: "Rue Abdelmoumen, Casablanca",
      phone: "05 22 45 67 89",
      hours: "Lun-Ven: 8h30-16h30",
      services: ["Aide sociale", "Logement", "Handicap"],
      distance: "3.1 km"
    },
    {
      name: "Antenne AMDH",
      type: "Droits humains",
      address: "Quartier Palmier, Casablanca",
      phone: "05 22 33 44 55",
      hours: "Lun-Ven: 14h-18h",
      services: ["Défense des droits", "Accompagnement juridique"],
      distance: "4.5 km"
    }
  ];

  const serviceTypes = ["Tous", "Justice", "Aide juridique", "Social", "Droits humains", "Santé"];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card animate-fade-in">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link 
                to="/acces-aux-droits" 
                className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors duration-200 mr-2 sm:mr-4"
              >
                ←
              </Link>
              <Link to="/acces-aux-droits" className="flex items-center space-x-2 sm:space-x-4 hover:opacity-80 transition-opacity duration-200">
                <img src="/Feelinx_upload/logo-acces-aux-droits.png" alt="Accès aux Droits Logo" className="h-3 sm:h-6" />
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-foreground">Accès aux Droits</h1>
                  <p className="text-xs sm:text-sm text-muted-foreground">Carte interactive</p>
                </div>
              </Link>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button variant="outline" size="sm" className="text-xs sm:text-sm">العربية</Button>
              <Link to="/observatoire">
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm">Observatoire</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <AccesAuxDroitsNav />

      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-4 sm:mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/acces-aux-droits">Accès aux Droits</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Carte interactive</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-4">
            <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold">Carte interactive</h1>
          </div>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
            Trouvez les services d'aide juridique et sociale près de chez vous
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 sm:mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Entrez votre adresse..." className="pl-10 text-sm sm:text-base" />
            </div>
            <Button className="w-full sm:w-auto">
              <Navigation className="h-4 w-4 mr-2" />
              Me géolocaliser
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Type de service:</span>
            {serviceTypes.map((type) => (
              <Button
                key={type}
                variant={type === "Tous" ? "default" : "outline"}
                size="sm"
              >
                {type}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Map Placeholder */}
          <div className="lg:col-span-2">
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle>Carte des services</CardTitle>
                <CardDescription>
                  Services d'aide juridique et sociale dans votre région
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-full bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Carte interactive</h3>
                    <p className="text-muted-foreground">
                      La carte interactive sera intégrée ici.<br />
                      Elle affichera tous les points de service géolocalisés.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Services List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Services près de vous</h2>
            <div className="space-y-4">
              {services.map((service, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg leading-tight mb-2">
                          {service.name}
                        </CardTitle>
                        <div className="flex gap-2 mb-2">
                          <Badge variant="secondary">{service.type}</Badge>
                          <Badge variant="outline">{service.distance}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span>{service.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{service.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{service.hours}</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm font-medium mb-2">Services proposés:</p>
                      <div className="flex flex-wrap gap-1">
                        {service.services.map((s, sIndex) => (
                          <Badge key={sIndex} variant="outline" className="text-xs">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" className="flex-1">
                        Voir les détails
                      </Button>
                      <Button variant="outline" size="sm">
                        Itinéraire
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center">
              <Button variant="outline">Voir plus de services</Button>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <Card className="inline-block p-8">
            <h3 className="text-xl font-semibold mb-2">Un service manque ?</h3>
            <p className="text-muted-foreground mb-4">
              Aidez-nous à compléter la carte en signalant un nouveau service
            </p>
            <Link to="/contact">
              <Button>Signaler un service</Button>
            </Link>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CarteInteractive;