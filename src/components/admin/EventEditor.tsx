import { useState } from "react";
import { Event, EventFormData } from "@/types/events";
import { useEvents } from "@/hooks/useEvents";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EventForm } from "./EventForm";
import { EventsList } from "./EventsList";
import { Plus, ArrowLeft } from "lucide-react";

export const EventEditor = () => {
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { events, isLoading, createEvent, updateEvent, deleteEvent } = useEvents();

  const handleSubmit = async (data: EventFormData) => {
    if (editingEvent) {
      await updateEvent.mutateAsync({ id: editingEvent.id, data });
      setEditingEvent(null);
    } else {
      await createEvent.mutateAsync(data);
      setIsCreating(false);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setIsCreating(false);
  };

  const handleDelete = async (eventId: string) => {
    await deleteEvent.mutateAsync(eventId);
  };

  const handleCancel = () => {
    setEditingEvent(null);
    setIsCreating(false);
  };

  const showForm = isCreating || editingEvent;

  return (
    <div className="space-y-6">
      {!showForm ? (
        <>
          {/* Header avec bouton nouveau */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Liste des événements</h3>
              <p className="text-sm text-muted-foreground">
                Gérer les actions réalisées et les événements à venir
              </p>
            </div>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un événement
            </Button>
          </div>

          {/* Liste des événements */}
          <EventsList
            events={events}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isLoading}
          />
        </>
      ) : (
        <>
          {/* Header du formulaire */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleCancel}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h3 className="text-lg font-semibold">
                {editingEvent ? 'Modifier l\'événement' : 'Nouvel événement'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {editingEvent
                  ? 'Modifier les informations de l\'événement'
                  : 'Créer un nouveau événement'}
              </p>
            </div>
          </div>

          {/* Formulaire */}
          <Card className="p-6">
            <EventForm
              initialData={editingEvent || undefined}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={createEvent.isPending || updateEvent.isPending}
            />
          </Card>
        </>
      )}
    </div>
  );
};
