-- Re-introduce the bibliography fields as a dedicated multi-line text
-- column (one reference per line). They were dropped by the
-- 20260517000001_unify_body migration. The editor now exposes a
-- dedicated <Textarea> for this so users can curate the references
-- separately from the body's <h1>/<h2> structure.

ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS bibliography text,
  ADD COLUMN IF NOT EXISTS bibliography_ar text;
