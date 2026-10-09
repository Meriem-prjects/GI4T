-- Vecteur de recherche sémantique des documents (assistant, recherche IA).
-- La colonne a été créée par une ancienne migration Supabase : les bases
-- construites uniquement avec les migrations Prisma ne l'avaient pas.
-- Sans effet là où elle existe déjà (production).
CREATE EXTENSION IF NOT EXISTS vector;
ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "embedding" vector(1536);
CREATE INDEX IF NOT EXISTS "documents_embedding_idx" ON "documents" USING ivfflat ("embedding" vector_cosine_ops) WITH (lists = 100);
