// Bulk import PDFs from an unzipped Drive folder into the Observatoire.
// Each parent folder is treated as a category (matched case+accent-
// insensitive against `categories.name`, auto-created if missing). The
// existing runProcessingPipeline handles OCR, metadata extraction and
// embedding generation.
//
// Idempotent via the `import_checkpoints` table (keyed on file SHA-256).
// A crash or SIGINT can be resumed by just re-running the same command.
//
// Usage:
//   npx tsx backend/scripts/import-from-zip.ts <folder>            # start / resume
//   npx tsx backend/scripts/import-from-zip.ts <folder> --dry-run  # list what would be imported
//
// Recommended launch (survives SSH disconnect):
//   nohup npx tsx backend/scripts/import-from-zip.ts /tmp/drive-extract \
//     > /var/log/import.log 2>&1 &
//   tail -f /var/log/import.log
//
import { promises as fs } from "fs";
import * as fssync from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { prisma } from "../src/lib/prisma.js";
import { saveFile } from "../src/lib/storage.js";
import { runProcessingPipeline } from "../src/routes/functions/upload-document.js";

const DEFAULT_LANGUAGE: "ar" | "fr" | "auto" = "ar"; // corpus is majority Arabic
const IMPORTER_EMAIL = "ceo@feelinx.dev";
const CONCURRENCY = 1; // OCR is memory-heavy; ramp up only if RAM is comfortable

// ── Normalisation helpers ────────────────────────────────────────────────

// Normalise a category name for matching: strip accents, lowercase, treat
// "_" as "'" (Drive replaces apostrophes), collapse whitespace, drop
// trailing punctuation. Applied to both the folder name AND the DB name
// before comparison.
function normalise(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip Latin diacritics
    .replace(/_/g, "'")
    .toLowerCase()
    .trim()
    .replace(/[.,;:!?]+$/g, "")
    .replace(/\s+/g, " ");
}

// Restore a "friendly" name to write into the DB when auto-creating.
function friendlyName(rawFolder: string): string {
  return rawFolder.replace(/_/g, "'").trim();
}

// ── Category cache ───────────────────────────────────────────────────────

interface CategoryRow {
  id: string;
  name: string;
}

class CategoryResolver {
  private byNormalised = new Map<string, CategoryRow>();

  async load(): Promise<void> {
    const rows = await prisma.category.findMany({ select: { id: true, name: true } });
    for (const r of rows) this.byNormalised.set(normalise(r.name), r);
    console.log(`[categories] loaded ${rows.length} existing`);
  }

  async resolveFromFolder(rawFolder: string): Promise<CategoryRow> {
    const key = normalise(rawFolder);
    const hit = this.byNormalised.get(key);
    if (hit) return hit;
    // Auto-create with a Latin-cleaned display name.
    const name = friendlyName(rawFolder);
    const created = await prisma.category.create({
      data: { name, nameAr: null, color: "#3b82f6" },
      select: { id: true, name: true },
    });
    this.byNormalised.set(key, created);
    console.log(`[categories] + created "${name}" (${created.id})`);
    return created;
  }
}

// ── Checkpoint helpers (raw SQL, keeps schema drift-free) ────────────────

async function ensureCheckpointTable(): Promise<void> {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "import_checkpoints" (
      "file_hash" TEXT PRIMARY KEY,
      "drive_path" TEXT NOT NULL,
      "document_id" UUID,
      "category_name" TEXT,
      "status" TEXT NOT NULL DEFAULT 'pending',
      "error" TEXT,
      "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "import_checkpoints_status_idx" ON "import_checkpoints"("status")`,
  );
}

async function getCheckpoint(fileHash: string): Promise<{ status: string; document_id: string | null } | null> {
  const rows = await prisma.$queryRawUnsafe<Array<{ status: string; document_id: string | null }>>(
    `SELECT status, document_id FROM "import_checkpoints" WHERE file_hash = $1 LIMIT 1`,
    fileHash,
  );
  return rows[0] ?? null;
}

async function upsertCheckpoint(
  fileHash: string,
  drivePath: string,
  categoryName: string,
  status: "pending" | "processing" | "done" | "failed",
  documentId?: string | null,
  error?: string | null,
): Promise<void> {
  // Explicit ::uuid cast on the nullable document_id — Prisma sends
  // JS null as an untyped parameter and Postgres can't implicitly cast
  // "text NULL" to a uuid column (error 42804).
  await prisma.$executeRawUnsafe(
    `INSERT INTO "import_checkpoints" (file_hash, drive_path, category_name, status, document_id, error, updated_at)
     VALUES ($1, $2, $3, $4, $5::uuid, $6, CURRENT_TIMESTAMP)
     ON CONFLICT (file_hash) DO UPDATE SET
       status = EXCLUDED.status,
       document_id = COALESCE(EXCLUDED.document_id, "import_checkpoints".document_id),
       error = EXCLUDED.error,
       updated_at = CURRENT_TIMESTAMP`,
    fileHash,
    drivePath,
    categoryName,
    status,
    documentId ?? null,
    error ?? null,
  );
}

// ── PDF discovery ────────────────────────────────────────────────────────

async function findPdfs(root: string): Promise<Array<{ path: string; parentFolder: string }>> {
  const out: Array<{ path: string; parentFolder: string }> = [];
  async function walk(dir: string): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) await walk(p);
      else if (e.isFile() && e.name.toLowerCase().endsWith(".pdf")) {
        out.push({ path: p, parentFolder: path.basename(path.dirname(p)) });
      }
    }
  }
  await walk(root);
  return out;
}

// ── Main ─────────────────────────────────────────────────────────────────

function sha256(buf: Buffer): string {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

async function main(): Promise<void> {
  const rootArg = process.argv[2];
  const dryRun = process.argv.includes("--dry-run");
  if (!rootArg) {
    console.error("Usage: import-from-zip.ts <folder> [--dry-run]");
    process.exit(1);
  }
  const root = path.resolve(rootArg);
  if (!fssync.existsSync(root)) {
    console.error(`Folder not found: ${root}`);
    process.exit(1);
  }

  console.log(`[import] root=${root} dryRun=${dryRun} language=${DEFAULT_LANGUAGE}`);
  await ensureCheckpointTable();

  const importer = await prisma.user.findUnique({ where: { email: IMPORTER_EMAIL }, select: { id: true } });
  if (!importer) {
    console.error(`Importer user not found: ${IMPORTER_EMAIL}`);
    process.exit(1);
  }
  console.log(`[import] importer userId=${importer.id}`);

  const categories = new CategoryResolver();
  await categories.load();

  const pdfs = await findPdfs(root);
  console.log(`[import] discovered ${pdfs.length} PDFs`);

  let processed = 0;
  let skipped = 0;
  let failed = 0;
  const startAt = Date.now();

  for (let i = 0; i < pdfs.length; i++) {
    const { path: filePath, parentFolder } = pdfs[i];
    const filename = path.basename(filePath);
    const relDrivePath = path.relative(root, filePath);
    const buffer = await fs.readFile(filePath);
    const hash = sha256(buffer);

    const cp = await getCheckpoint(hash);
    if (cp?.status === "done") {
      skipped++;
      if ((i + 1) % 25 === 0) logProgress(i + 1, pdfs.length, processed, skipped, failed, startAt);
      continue;
    }

    if (dryRun) {
      console.log(`  [dry] ${relDrivePath}  (category="${parentFolder}")`);
      continue;
    }

    const category = await categories.resolveFromFolder(parentFolder);
    await upsertCheckpoint(hash, relDrivePath, category.name, "processing", cp?.document_id ?? null);

    try {
      // 1. Persist the file to storage
      const saved = await saveFile("documents", importer.id, filename, buffer);

      // 2. Create document row
      const doc = await prisma.document.create({
        data: {
          userId: importer.id,
          title: filename.replace(/\.pdf$/i, ""),
          content: "",
          originalFilename: filename,
          fileUrl: saved.url,
          pdfUrl: saved.url,
          fileSize: saved.size,
          language: DEFAULT_LANGUAGE,
          categoryId: category.id,
          status: "processing",
          published: false,
        },
      });

      // 3. Link primary + secondary via document_categories join
      await prisma.documentCategory.create({
        data: { documentId: doc.id, categoryId: category.id },
      });

      // 4. Create processing job
      const job = await prisma.processingJob.create({
        data: {
          fileName: filename,
          fileSize: saved.size,
          status: "pending",
          progress: 0,
          currentStep: "queued",
        },
      });
      await prisma.document.update({
        where: { id: doc.id },
        data: { processingJobId: job.id },
      });

      // 5. Run the full OCR + metadata + embedding pipeline SYNCHRONOUSLY
      //    (we want per-doc failure isolation and back-pressure).
      await runProcessingPipeline({
        jobId: job.id,
        documentId: doc.id,
        buffer,
        filename,
        mimeType: "application/pdf",
        language: DEFAULT_LANGUAGE,
        processingMode: "ai",
      });

      // 6. Mark checkpoint done
      await upsertCheckpoint(hash, relDrivePath, category.name, "done", doc.id, null);
      processed++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await upsertCheckpoint(hash, relDrivePath, category.name, "failed", null, msg.slice(0, 500));
      failed++;
      console.error(`  ✗ FAILED ${relDrivePath}: ${msg}`);
    }

    if ((i + 1) % 5 === 0 || i === pdfs.length - 1) {
      logProgress(i + 1, pdfs.length, processed, skipped, failed, startAt);
    }
  }

  const elapsed = Math.round((Date.now() - startAt) / 1000);
  console.log(
    `\n[import] DONE in ${elapsed}s — processed=${processed} skipped=${skipped} failed=${failed}`,
  );
  await prisma.$disconnect();
}

function logProgress(
  index: number,
  total: number,
  processed: number,
  skipped: number,
  failed: number,
  startAt: number,
): void {
  const elapsed = (Date.now() - startAt) / 1000;
  const done = processed + failed;
  const rate = done > 0 ? elapsed / done : 0;
  const remaining = Math.max(0, (total - index) * rate);
  const eta = new Date(Date.now() + remaining * 1000).toLocaleTimeString();
  console.log(
    `[progress] ${index}/${total} ` +
      `(processed=${processed} skipped=${skipped} failed=${failed}) ` +
      `rate=${rate.toFixed(1)}s/doc ETA=${eta}`,
  );
}

// Graceful shutdown: mark any in-flight "processing" checkpoint as pending
// so the next run resumes cleanly.
process.on("SIGINT", async () => {
  console.log("\n[import] SIGINT received — flushing state…");
  await prisma.$executeRawUnsafe(
    `UPDATE "import_checkpoints" SET status = 'pending' WHERE status = 'processing'`,
  );
  await prisma.$disconnect();
  process.exit(130);
});

main().catch(async (err) => {
  console.error("[import] fatal:", err);
  await prisma.$disconnect();
  process.exit(1);
});
