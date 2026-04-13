import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { env } from "../config/env.js";

export type Bucket = "documents" | "media";

const BUCKETS: Bucket[] = ["documents", "media"];

export function resolveBucketDir(bucket: Bucket): string {
  return path.resolve(env.STORAGE_DIR, bucket);
}

export async function ensureStorageDirs(): Promise<void> {
  for (const bucket of BUCKETS) {
    await fs.mkdir(resolveBucketDir(bucket), { recursive: true });
  }
}

export function buildStoragePath(bucket: Bucket, subpath: string): string {
  return path.resolve(resolveBucketDir(bucket), subpath);
}

export function buildPublicUrl(bucket: Bucket, subpath: string): string {
  const normalized = subpath.replace(/^\/+/, "").split(path.sep).join("/");
  return `${env.STORAGE_PUBLIC_URL}/${bucket}/${normalized}`;
}

export async function saveFile(
  bucket: Bucket,
  ownerId: string | null,
  originalFilename: string,
  buffer: Buffer,
): Promise<{ key: string; url: string; size: number }> {
  const dir = ownerId ? path.join(resolveBucketDir(bucket), ownerId) : resolveBucketDir(bucket);
  await fs.mkdir(dir, { recursive: true });
  const ext = path.extname(originalFilename);
  const base = path.basename(originalFilename, ext).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80);
  const unique = `${randomUUID()}-${base}${ext}`;
  const absPath = path.join(dir, unique);
  await fs.writeFile(absPath, buffer);
  const key = path.relative(resolveBucketDir(bucket), absPath).split(path.sep).join("/");
  return { key, url: buildPublicUrl(bucket, key), size: buffer.length };
}

export async function deleteFile(bucket: Bucket, key: string): Promise<void> {
  const absPath = buildStoragePath(bucket, key);
  await fs.rm(absPath, { force: true });
}

export async function fileExists(bucket: Bucket, key: string): Promise<boolean> {
  try {
    await fs.access(buildStoragePath(bucket, key));
    return true;
  } catch {
    return false;
  }
}
