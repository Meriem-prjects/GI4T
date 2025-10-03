-- Ajouter les colonnes latitude et longitude à la table events
ALTER TABLE public.events
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8);

-- Créer un index pour les recherches géospatiales
CREATE INDEX idx_events_coordinates ON public.events(latitude, longitude);