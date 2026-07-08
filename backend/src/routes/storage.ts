import { Router } from "express";
import path from "node:path";
import fs from "node:fs";
import { upload } from "../middleware/upload.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler, HttpError } from "../middleware/error.js";
import { saveFile, resolveBucketDir, deleteFile, type Bucket } from "../lib/storage.js";

export const storageRouter = Router();

const VALID_BUCKETS: Bucket[] = ["documents", "media", "album-photos"];

function assertBucket(bucket: string): asserts bucket is Bucket {
  if (!VALID_BUCKETS.includes(bucket as Bucket)) {
    throw new HttpError(400, `Invalid bucket: ${bucket}`);
  }
}

storageRouter.post(
  "/:bucket/upload",
  requireAuth,
  upload.single("file"),
  asyncHandler(async (req, res) => {
    const { bucket } = req.params;
    assertBucket(bucket);
    if (!req.file) throw new HttpError(400, "No file provided");

    const owner = (req.body.owner as string | undefined) ?? req.user!.userId;
    const result = await saveFile(bucket, owner, req.file.originalname, req.file.buffer);
    res.status(201).json({
      key: result.key,
      url: result.url,
      size: result.size,
      bucket,
    });
  }),
);

storageRouter.delete(
  "/:bucket/*",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { bucket } = req.params;
    assertBucket(bucket);
    const key = (req.params as Record<string, string>)[0];
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
    res.sendFile(absPath);
  }),
);
