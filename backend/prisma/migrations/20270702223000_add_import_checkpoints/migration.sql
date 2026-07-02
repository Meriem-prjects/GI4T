-- Checkpoint table for the drive → observatoire bulk import script.
-- Lets a run resume after interruption without re-processing PDFs that
-- have already been ingested.
CREATE TABLE IF NOT EXISTS "import_checkpoints" (
    "file_hash" TEXT PRIMARY KEY,
    "drive_path" TEXT NOT NULL,
    "document_id" UUID,
    "category_name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "error" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "import_checkpoints_status_idx"
    ON "import_checkpoints"("status");
