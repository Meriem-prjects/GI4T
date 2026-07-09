import { useState } from "react";
import { EventFormData } from "@/types/events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GovernorateSelector } from "./GovernorateSelector";
import { EventImageUploader } from "./EventImageUploader";
import { Calendar, Users, MapPin, Image as ImageIcon } from "lucide-react";

interface EventFormProps {
  initialData?: Partial<EventFormData>;
  onSubmit: (data: EventFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

// HTML5 <input type="date"> only accepts `YYYY-MM-DD`. The API returns
// event_date as a full ISO string (`2025-10-28T00:00:00.000Z`), so trim
// it before seeding the form or the field renders empty and the admin
// silently loses the date on save.
const toDateInputValue = (v?: string): string => {
  if (!v) return new Date().toISOString().split('T')[0];
  return v.length >= 10 ? v.slice(0, 10) : v;
};

export const EventForm = ({ initialData, onSubmit, onCancel, isLoading }: EventFormProps) => {
  const [formData, setFormData] = useState<EventFormData>({
    type: initialData?.type || 'action_realisee',
    title: initialData?.title || '',
    title_ar: initialData?.title_ar || '',
    description: initialData?.description || '',
    description_ar: initialData?.description_ar || '',
    governorate_id: initialData?.governorate_id || '',
    event_date: toDateInputValue(initialData?.event_date),
    people_impacted: initialData?.people_impacted,
    available_places: initialData?.available_places,
    registration_enabled: initialData?.registration_enabled || false,
    images: initialData?.images || [],
    latitude: initialData?.latitude,
    longitude: initialData?.longitude,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isActionRealisee = formData.type === 'action_realisee';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Type d'événement */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Type d'événement</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={formData.type}
            onValueChange={(value: 'action_realisee' | 'evenement_a_venir') =>
              setFormData({ ...formData, type: value })
            }
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="action_realisee" id="action" />
              <Label htmlFor="action" className="cursor-pointer">
                ✅ Action réalisée
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="evenement_a_venir" id="evenement" />
              <Label htmlFor="evenement" className="cursor-pointer">
                📅 Événement à venir
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Informations générales */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre (Français) *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="Titre de l'événement"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title_ar">Titre (Arabe)</Label>
              <Input
                id="title_ar"
                value={formData.title_ar}
                onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                placeholder="عنوان الحدث"
                dir="rtl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Français) *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              placeholder="Description détaillée"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description_ar">Description (Arabe)</Label>
            <Textarea
              id="description_ar"
              value={formData.description_ar}
              onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
              placeholder="وصف تفصيلي"
              rows={4}
              dir="rtl"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="governorate">
                <MapPin className="inline-block w-4 h-4 mr-1" />
                Gouvernorat *
              </Label>
              <GovernorateSelector
                value={formData.governorate_id}
                onChange={(value) => setFormData({ ...formData, governorate_id: value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event_date">
                <Calendar className="inline-block w-4 h-4 mr-1" />
                Date *
              </Label>
              <Input
                id="event_date"
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="0.000001"
                value={formData.latitude || ''}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="Ex: 36.8065"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="0.000001"
                value={formData.longitude || ''}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="Ex: 10.1815"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Détails spécifiques */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {isActionRealisee ? 'Impact de l\'action' : 'Détails de l\'événement'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isActionRealisee ? (
            <div className="space-y-2">
              <Label htmlFor="people_impacted">
                <Users className="inline-block w-4 h-4 mr-1" />
                Nombre de personnes touchées
              </Label>
              <Input
                id="people_impacted"
                type="number"
                min="0"
                value={formData.people_impacted || ''}
                onChange={(e) =>
                  setFormData({ ...formData, people_impacted: parseInt(e.target.value) || undefined })
                }
                placeholder="Ex: 150"
              />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="available_places">
                  <Users className="inline-block w-4 h-4 mr-1" />
                  Places disponibles
                </Label>
                <Input
                  id="available_places"
                  type="number"
                  min="0"
                  value={formData.available_places || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, available_places: parseInt(e.target.value) || undefined })
                  }
                  placeholder="Ex: 50"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="registration"
                  checked={formData.registration_enabled}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, registration_enabled: checked })
                  }
                />
                <Label htmlFor="registration" className="cursor-pointer">
                  Activer les inscriptions en ligne
                </Label>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            <ImageIcon className="inline-block w-4 h-4 mr-1" />
            Images
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EventImageUploader
            images={formData.images || []}
            onChange={(images) => setFormData({ ...formData, images })}
            maxImages={8}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </div>
    </form>
  );
};
