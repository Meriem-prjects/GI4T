-- Migration: unify document body into `content` HTML
--
-- BEFORE: 14 structural columns + 1 JSONB (`sections`) carried
--         partial copies of the body content per type:
--         - Analyses : introduction(_ar), conclusion(_ar), sections (JSONB),
--                      bibliography(_ar)
--         - Jurisprudence : legal_problem(_ar), proposed_solution(_ar),
--                      bibliography(_ar)
--         - Commentaire : ruling(_ar), observations(_ar), bibliography(_ar)
--
-- AFTER: the editor uses a single rich-text body (`content` /
--        `translated_content`) where H1/H2 headings carry structure.
--        Per-section programmatic access is no longer possible — the
--        TOC is rebuilt from headings at render time.
--
-- Back-fill strategy
-- ------------------
-- For each document, if ANY of the structural columns is non-empty, we
-- REBUILD the appropriate body field by concatenating those columns as
-- HTML with <h1> headings. The original `content` column (raw PyMuPDF
-- output) is preserved when no structural field exists.
--
--  - If document.language = 'ar': structural fields are Arabic → body
--    goes to `content` (overwriting the raw extraction).
--  - If document.language = 'fr': structural fields are French → body
--    goes to `content` (same).
--
-- The translated_content column is left alone — translation now happens
-- on the entire HTML body in one round-trip via /api/fn/translate-fields.

-- Helper: build HTML body from structural fields (returns NULL if all empty)
CREATE OR REPLACE FUNCTION pg_temp.unify_body(
  intro text,
  legal_problem text,
  proposed_solution text,
  ruling text,
  observations text,
  sections jsonb,
  conclusion text,
  bibliography text
) RETURNS text AS $$
DECLARE
  out text := '';
  s   jsonb;
  lvl int;
  ttl text;
  cnt text;
BEGIN
  IF intro IS NOT NULL AND length(trim(intro)) > 0 THEN
    out := out || E'<h1>Introduction</h1>\n' || intro || E'\n';
  END IF;
  IF legal_problem IS NOT NULL AND length(trim(legal_problem)) > 0 THEN
    out := out || E'<h1>Problème juridique</h1>\n' || legal_problem || E'\n';
  END IF;
  IF proposed_solution IS NOT NULL AND length(trim(proposed_solution)) > 0 THEN
    out := out || E'<h1>Solution proposée</h1>\n' || proposed_solution || E'\n';
  END IF;
  IF ruling IS NOT NULL AND length(trim(ruling)) > 0 THEN
    out := out || E'<h1>Décision</h1>\n' || ruling || E'\n';
  END IF;
  IF observations IS NOT NULL AND length(trim(observations)) > 0 THEN
    out := out || E'<h1>Observations</h1>\n' || observations || E'\n';
  END IF;
  IF sections IS NOT NULL AND jsonb_typeof(sections) = 'array' THEN
    FOR s IN SELECT * FROM jsonb_array_elements(sections) LOOP
      lvl := COALESCE((s->>'level')::int, 1);
      -- Prefer Arabic title/content if available; fall back to FR.
      ttl := COALESCE(NULLIF(s->>'titleAr',''), NULLIF(s->>'title',''), '');
      cnt := COALESCE(NULLIF(s->>'contentAr',''), NULLIF(s->>'content',''), '');
      IF length(trim(ttl)) > 0 THEN
        IF lvl >= 2 THEN
          out := out || E'<h2>' || ttl || E'</h2>\n';
        ELSE
          out := out || E'<h1>' || ttl || E'</h1>\n';
        END IF;
      END IF;
      IF length(trim(cnt)) > 0 THEN
        out := out || cnt || E'\n';
      END IF;
    END LOOP;
  END IF;
  IF conclusion IS NOT NULL AND length(trim(conclusion)) > 0 THEN
    out := out || E'<h1>Conclusion</h1>\n' || conclusion || E'\n';
  END IF;
  IF bibliography IS NOT NULL AND length(trim(bibliography)) > 0 THEN
    out := out || E'<h1>Bibliographie</h1>\n' || bibliography || E'\n';
  END IF;
  IF length(trim(out)) = 0 THEN
    RETURN NULL;
  END IF;
  RETURN out;
END;
$$ LANGUAGE plpgsql;

-- Back-fill: overwrite `content` with unified HTML when structural fields exist.
UPDATE documents
SET content = COALESCE(
  pg_temp.unify_body(
    introduction_ar,
    legal_problem_ar,
    proposed_solution_ar,
    ruling_ar,
    observations_ar,
    sections,
    conclusion_ar,
    bibliography_ar
  ),
  content
)
WHERE language = 'ar' AND (
  introduction_ar IS NOT NULL
  OR legal_problem_ar IS NOT NULL
  OR proposed_solution_ar IS NOT NULL
  OR ruling_ar IS NOT NULL
  OR observations_ar IS NOT NULL
  OR conclusion_ar IS NOT NULL
  OR bibliography_ar IS NOT NULL
  OR sections IS NOT NULL
);

UPDATE documents
SET content = COALESCE(
  pg_temp.unify_body(
    introduction,
    legal_problem,
    proposed_solution,
    ruling,
    observations,
    sections,
    conclusion,
    bibliography
  ),
  content
)
WHERE (language = 'fr' OR language IS NULL) AND (
  introduction IS NOT NULL
  OR legal_problem IS NOT NULL
  OR proposed_solution IS NOT NULL
  OR ruling IS NOT NULL
  OR observations IS NOT NULL
  OR conclusion IS NOT NULL
  OR bibliography IS NOT NULL
  OR sections IS NOT NULL
);

-- Drop the unified columns.
ALTER TABLE documents
  DROP COLUMN IF EXISTS introduction,
  DROP COLUMN IF EXISTS introduction_ar,
  DROP COLUMN IF EXISTS conclusion,
  DROP COLUMN IF EXISTS conclusion_ar,
  DROP COLUMN IF EXISTS bibliography,
  DROP COLUMN IF EXISTS bibliography_ar,
  DROP COLUMN IF EXISTS legal_problem,
  DROP COLUMN IF EXISTS legal_problem_ar,
  DROP COLUMN IF EXISTS proposed_solution,
  DROP COLUMN IF EXISTS proposed_solution_ar,
  DROP COLUMN IF EXISTS ruling,
  DROP COLUMN IF EXISTS ruling_ar,
  DROP COLUMN IF EXISTS observations,
  DROP COLUMN IF EXISTS observations_ar,
  DROP COLUMN IF EXISTS sections;
