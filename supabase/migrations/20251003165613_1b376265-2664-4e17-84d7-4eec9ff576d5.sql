-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to documents table for AI semantic search
ALTER TABLE documents ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Create index for fast vector similarity search using cosine distance
CREATE INDEX IF NOT EXISTS documents_embedding_idx ON documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Add index on published status for faster filtering
CREATE INDEX IF NOT EXISTS documents_published_idx ON documents(published) WHERE published = true;