-- Documents ODF « avec page de garde » lus page par page.
-- book       : par langue, dossier des images de pages, nombre de pages, PDF
-- import_key : clé stable de l'import (scripts/odf/publish-odf-books.ts)
-- sort_order : numéro de la fiche, du blog… pour le tri des listes
ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "book" JSONB;
ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "import_key" TEXT;
ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "sort_order" INTEGER;
CREATE UNIQUE INDEX IF NOT EXISTS "documents_import_key_key" ON "documents"("import_key");
CREATE INDEX IF NOT EXISTS "documents_year_idx" ON "documents"("year");
