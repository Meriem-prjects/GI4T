import { City } from '@/types/map';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Clock, Star } from 'lucide-react';

interface CityDetailsProps {
  city: City | null;
}

export const CityDetails = ({ city }: CityDetailsProps) => {
  if (!city) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Sélectionnez une destination</CardTitle>
          <CardDescription>
            Cliquez sur un marqueur ou un tag pour voir les détails
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getTypeLabel = (type?: string) => {
    switch (type) {
      case 'activity': return { label: 'Activité', color: 'bg-[#347EFF]' };
      case 'hotel': return { label: 'Hôtel', color: 'bg-[#22C55E]' };
      case 'guesthouse': return { label: 'Maison d\'hôte', color: 'bg-[#F59E0B]' };
      default: return { label: 'Lieu', color: 'bg-gray-500' };
    }
  };

  const typeInfo = getTypeLabel(city.type);

  return (
    <Card className="h-full overflow-auto">
      <CardHeader className="space-y-4">
        {city.image && (
          <div className="relative w-full h-48 rounded-lg overflow-hidden">
            <img 
              src={city.image} 
              alt={city.name}
              className="w-full h-full object-cover"
            />
            <div className={`absolute top-3 right-3 ${typeInfo.color} text-white px-3 py-1 rounded-full text-xs font-bold`}>
              {typeInfo.label}
            </div>
          </div>
        )}
        
        <div>
          <CardTitle className="text-2xl mb-2">{city.name}</CardTitle>
          <CardDescription className="flex items-center gap-1 text-base">
            <MapPin className="w-4 h-4" />
            {city.region}
          </CardDescription>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {city.rating && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{city.rating}/5</span>
            </div>
          )}
          
          {city.price && (
            <div className={`${typeInfo.color} text-white px-3 py-1 rounded-full text-sm font-bold`}>
              {city.price}/nuit
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {city.description}
          </p>
        </div>

        {city.services && city.services.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Services disponibles</h3>
            <div className="flex flex-wrap gap-2">
              {city.services.map((service, index) => (
                <span 
                  key={index}
                  className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>
        )}

        {(city.phone || city.hours) && (
          <div className="space-y-2">
            <h3 className="font-semibold">Informations pratiques</h3>
            
            {city.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{city.phone}</span>
              </div>
            )}
            
            {city.hours && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>{city.hours}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button className="flex-1" variant="default">
            Voir l'itinéraire
          </Button>
          {city.phone && (
            <Button className="flex-1" variant="outline">
              Appeler
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
