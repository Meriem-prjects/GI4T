-- Create enum for event types
CREATE TYPE public.event_type AS ENUM ('action_realisee', 'evenement_a_venir');

-- Table des gouvernorats tunisiens
CREATE TABLE public.governorates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_ar TEXT,
  code TEXT UNIQUE NOT NULL,
  geojson JSONB NOT NULL,
  population INTEGER,
  area_km2 DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des événements
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_ar TEXT,
  description TEXT NOT NULL,
  description_ar TEXT,
  type event_type NOT NULL,
  governorate_id UUID REFERENCES public.governorates(id) ON DELETE SET NULL,
  event_date DATE NOT NULL,
  people_impacted INTEGER,
  available_places INTEGER,
  registration_enabled BOOLEAN DEFAULT false,
  images TEXT[],
  status TEXT DEFAULT 'published',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des inscriptions aux événements
CREATE TABLE public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  registered_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_events_governorate ON public.events(governorate_id);
CREATE INDEX idx_events_type ON public.events(type);
CREATE INDEX idx_events_date ON public.events(event_date);
CREATE INDEX idx_event_registrations_event ON public.event_registrations(event_id);

-- Enable RLS
ALTER TABLE public.governorates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies pour governorates (lecture publique)
CREATE POLICY "Public can read governorates"
  ON public.governorates
  FOR SELECT
  USING (true);

CREATE POLICY "Admin can manage governorates"
  ON public.governorates
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies pour events
CREATE POLICY "Public can read published events"
  ON public.events
  FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admin can manage all events"
  ON public.events
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies pour event_registrations
CREATE POLICY "Public can register for events"
  ON public.event_registrations
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin can read registrations"
  ON public.event_registrations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can manage registrations"
  ON public.event_registrations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger pour updated_at
CREATE TRIGGER update_governorates_updated_at
  BEFORE UPDATE ON public.governorates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();