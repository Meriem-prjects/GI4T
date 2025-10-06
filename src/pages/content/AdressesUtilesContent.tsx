import { useState } from "react";
import { Search, MapPin, Phone, Mail, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUsefulAddresses } from "@/hooks/useUsefulAddresses";
import { useGovernorates } from "@/hooks/useGovernorates";

const AdressesUtilesContent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>("all");
  
  const { addresses, isLoading } = useUsefulAddresses(true);
  const { governorates } = useGovernorates();

  const filteredAddresses = addresses.filter((address) => {
    const matchesSearch =
      address.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      address.name_ar.includes(searchQuery) ||
      address.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      address.phone.includes(searchQuery);

    const matchesGovernorate =
      selectedGovernorate === "all" || address.governorate_id === selectedGovernorate;

    return matchesSearch && matchesGovernorate;
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

        {/* Search and Filters */}
        <div className="mb-8 space-y-4 animate-fade-in">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Rechercher par nom, adresse ou téléphone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
          <div className="max-w-md mx-auto">
            <Select value={selectedGovernorate} onValueChange={setSelectedGovernorate}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les gouvernorats" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les gouvernorats</SelectItem>
                {governorates.map((gov) => (
                  <SelectItem key={gov.id} value={gov.id}>
                    {gov.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Address Cards */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-fade-in">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded mb-4"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredAddresses.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-fade-in">
            {filteredAddresses.map((address) => (
              <Card key={address.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{address.name}</h3>
                    <h3 className="text-lg font-semibold text-right mb-3" dir="rtl">
                      {address.name_ar}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{address.category}</Badge>
                      {address.governorates && (
                        <Badge variant="outline">
                          <MapPin className="w-3 h-3 mr-1" />
                          {address.governorates.name}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-1 flex-shrink-0 text-muted-foreground" />
                      <div>
                        <p>{address.address}</p>
                        <p className="text-right text-muted-foreground" dir="rtl">
                          {address.address_ar}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <a
                        href={`tel:${address.phone.replace(/\s/g, '')}`}
                        className="hover:underline text-primary"
                      >
                        {address.phone}
                      </a>
                    </div>

                    {address.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <a
                          href={`mailto:${address.email}`}
                          className="hover:underline text-primary"
                        >
                          {address.email}
                        </a>
                      </div>
                    )}

                    {(address.hours || address.hours_ar) && (
                      <div className="pt-2 border-t">
                        <p className="font-medium mb-1">Horaires:</p>
                        {address.hours && <p>{address.hours}</p>}
                        {address.hours_ar && (
                          <p className="text-right text-muted-foreground" dir="rtl">
                            {address.hours_ar}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="animate-fade-in">
            <CardContent className="py-12 text-center text-muted-foreground">
              Aucune adresse trouvée
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
};

export default AdressesUtilesContent;
