-- Drop existing restrictive policies for events
DROP POLICY IF EXISTS "Admin can manage all events" ON public.events;
DROP POLICY IF EXISTS "Public can read published events" ON public.events;

-- Drop existing restrictive policies for governorates
DROP POLICY IF EXISTS "Admin can manage governorates" ON public.governorates;

-- Drop existing restrictive policies for event_registrations
DROP POLICY IF EXISTS "Admin can read registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Admin can manage registrations" ON public.event_registrations;

-- New Policies for events
CREATE POLICY "Public can read published events"
  ON public.events
  FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins can manage all events"
  ON public.events
  FOR ALL
  USING (public.has_acces_droits_role(auth.uid()));

-- New Policies for governorates
CREATE POLICY "Admins can manage governorates"
  ON public.governorates
  FOR ALL
  USING (public.has_acces_droits_role(auth.uid()));

-- New Policies for event_registrations
CREATE POLICY "Admins can read registrations"
  ON public.event_registrations
  FOR SELECT
  USING (public.has_acces_droits_role(auth.uid()));

CREATE POLICY "Admins can manage registrations"
  ON public.event_registrations
  FOR ALL
  USING (public.has_acces_droits_role(auth.uid()));

-- Grant access to authenticated users if needed (the function handles roles)
GRANT ALL ON public.events TO authenticated;
GRANT ALL ON public.governorates TO authenticated;
GRANT ALL ON public.event_registrations TO authenticated;
