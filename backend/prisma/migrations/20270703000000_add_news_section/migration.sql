-- News.section is in the Prisma schema but no migration ever created it:
-- databases set up with `prisma db push` have it, production did not, and
-- every query filtering on it (Actualités pages) failed with a 500.
-- IF NOT EXISTS keeps this a no-op where the column is already there.
ALTER TABLE "news" ADD COLUMN IF NOT EXISTS "section" TEXT NOT NULL DEFAULT 'observatoire';
