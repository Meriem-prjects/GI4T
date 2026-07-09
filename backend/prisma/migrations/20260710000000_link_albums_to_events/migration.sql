-- Rattache un album photo à un événement (0..1 → 0..N). Nullable +
-- ON DELETE SET NULL : supprimer l'événement laisse ses albums orphelins
-- au lieu de les cascader. Le pattern est le même que
-- event_registrations.event_id ↔ events.id.

ALTER TABLE photo_albums
  ADD COLUMN IF NOT EXISTS event_id UUID
    REFERENCES events(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS photo_albums_event_id_idx ON photo_albums(event_id);
