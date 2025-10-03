import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Event, EventFilters, EventFormData } from "@/types/events";
import { useToast } from "@/hooks/use-toast";

export const useEvents = (filters?: EventFilters) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: events, isLoading, error } = useQuery({
    queryKey: ['events', filters],
    queryFn: async () => {
      let query = supabase
        .from('events')
        .select(`
          *,
          governorate:governorates(*)
        `)
        .eq('status', 'published')
        .order('event_date', { ascending: false });

      if (filters?.type && filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }

      if (filters?.governorate_id) {
        query = query.eq('governorate_id', filters.governorate_id);
      }

      if (filters?.start_date) {
        query = query.gte('event_date', filters.start_date);
      }

      if (filters?.end_date) {
        query = query.lte('event_date', filters.end_date);
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as unknown as Event[];
    },
  });

  const createEvent = useMutation({
    mutationFn: async (eventData: EventFormData) => {
      const { data, error } = await supabase
        .from('events')
        .insert([eventData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: "Événement créé",
        description: "L'événement a été créé avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'événement",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  const updateEvent = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<EventFormData> }) => {
      const { data: updated, error } = await supabase
        .from('events')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: "Événement modifié",
        description: "L'événement a été modifié avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'événement",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: "Événement supprimé",
        description: "L'événement a été supprimé avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'événement",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  return {
    events: events || [],
    isLoading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
  };
};
