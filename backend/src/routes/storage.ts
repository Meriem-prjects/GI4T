import { Router } from "express";
import path from "node:path";
import fs from "node:fs";
import { upload } from "../middleware/upload.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler, HttpError } from "../middleware/error.js";
import {
  saveFile,
  saveFileAtKey,
  isOdfKey,
  resolveBucketDir,
  deleteFile,
  type Bucket,
} from "../lib/storage.js";

export const storageRouter = Router();

const VALID_BUCKETS: Bucket[] = ["documents", "media", "album-photos"];

function assertBucket(bucket: string): asserts bucket is Bucket {
  if (!VALID_BUCKETS.includes(bucket as Bucket)) {
    throw new HttpError(400, `Invalid bucket: ${bucket}`);
  }
}

// Sous-dossier choisi par le client : un seul segment, sans « .. » ni
// séparateur, pour qu'il reste dans le bucket.
const OWNER_RE = /^[A-Za-z0-9_][A-Za-z0-9_.-]*$/;

storageRouter.post(
  "/:bucket/upload",
  requireAuth,
  upload.single("file"),
  asyncHandler(async (req, res) => {
    const { bucket } = req.params;
    assertBucket(bucket);
    if (!req.file) throw new HttpError(400, "No file provided");

    const owner = (req.body.owner as string | undefined) || req.user!.userId;
    if (!OWNER_RE.test(owner) || owner.includes("..")) {
      throw new HttpError(400, "Invalid owner");
    }
    const result = await saveFile(bucket, owner, req.file.originalname, req.file.buffer);
    res.status(201).json({
      key: result.key,
      url: result.url,
      size: result.size,
      bucket,
    });
  }),
);

// Dépôt à un chemin imposé (pages et PDF des documents ODF, voir
// scripts/odf/publish-odf-books.ts). Réservé aux administrateurs de l'ODF.
storageRouter.post(
  "/:bucket/put",
  requireAuth,
  requireRole("admin", "admin_observatoire"),
  upload.single("file"),
  asyncHandler(async (req, res) => {
    const { bucket } = req.params;
    assertBucket(bucket);
    if (!req.file) throw new HttpError(400, "No file provided");
    const key = String(req.body.key ?? "");
    if (!isOdfKey(key)) throw new HttpError(400, "Invalid key");
    const result = await saveFileAtKey(bucket, key, req.file.buffer);
    res.status(201).json({ ...result, bucket });
  }),
);

storageRouter.delete(
  "/:bucket/*",
  requireAuth,
  requireRole("admin", "admin_observatoire", "admin_acces_droits"),
  asyncHandler(async (req, res) => {
    const { bucket } = req.params;
    assertBucket(bucket);
    const key = (req.params as Record<string, string>)[0];
    const absPath = path.resolve(resolveBucketDir(bucket), key);
    if (!absPath.startsWith(resolveBucketDir(bucket) + path.sep)) {
      throw new HttpError(400, "Invalid path");
    }
    await deleteFile(bucket, key);
    res.json({ ok: true });
  }),
);

storageRouter.get(
  "/:bucket/*",
  asyncHandler(async (req, res) => {
    const { bucket } = req.params;
    assertBucket(bucket);
    const key = (req.params as Record<string, string>)[0];
    const absPath = path.resolve(resolveBucketDir(bucket), key);
    if (!absPath.startsWith(resolveBucketDir(bucket))) {
      throw new HttpError(400, "Invalid path");
    }
    if (!fs.existsSync(absPath)) {
      throw new HttpError(404, "File not found");
    }
    // Les fichiers ODF ne changent jamais à la même adresse (le dossier
    // porte un hash du document) : cache navigateur long.
    if (isOdfKey(key)) {
      res.sendFile(absPath, { maxAge: "365d", immutable: true });
      return;
    }
    res.sendFile(absPath);
  }),
);
