-- Adds a 1536-dim pgvector column on every "Accès-aux-droits" content
-- surface so the chat can search them semantically the same way it does
-- for observatoire documents. `content_hash` gives us idempotency for
-- the batch re-embedder: on save we bump the hash, on the next batch
-- run we only re-embed rows whose hash != last-embedded-hash.

CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE chatbot_training_documents
  ADD COLUMN IF NOT EXISTS embedding vector(1536),
  ADD COLUMN IF NOT EXISTS embedding_hash text;

ALTER TABLE practical_guides
  ADD COLUMN IF NOT EXISTS embedding vector(1536),
  ADD COLUMN IF NOT EXISTS embedding_hash text;

ALTER TABLE news
  ADD COLUMN IF NOT EXISTS embedding vector(1536),
  ADD COLUMN IF NOT EXISTS embedding_hash text;

ALTER TABLE practical_resources
  ADD COLUMN IF NOT EXISTS embedding vector(1536),
  ADD COLUMN IF NOT EXISTS embedding_hash text;

ALTER TABLE useful_links
  ADD COLUMN IF NOT EXISTS embedding vector(1536),
  ADD COLUMN IF NOT EXISTS embedding_hash text;
