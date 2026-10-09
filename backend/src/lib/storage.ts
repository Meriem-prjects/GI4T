import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { env } from "../config/env.js";

export type Bucket = "documents" | "media" | "album-photos";

const BUCKETS: Bucket[] = ["documents", "media", "album-photos"];

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

// Fichiers des documents ODF lus page par page : chemin imposé par le script
// d'import (dossier dont le nom contient un hash du document source), écrit
// tel quel pour que les adresses soient stables et mises en cache longtemps.
const ODF_KEY_RE = /^odf\/[a-z0-9][a-z0-9_.-]*(?:\/[a-z0-9][a-z0-9_.-]*)*\.(?:webp|pdf)$/;

export function isOdfKey(key: string): boolean {
  return ODF_KEY_RE.test(key) && !key.includes("..");
}

function insideBucket(bucket: Bucket, absPath: string): boolean {
  return absPath.startsWith(resolveBucketDir(bucket) + path.sep);
}

export async function saveFileAtKey(
  bucket: Bucket,
  key: string,
  buffer: Buffer,
): Promise<{ key: string; url: string; size: number }> {
  const absPath = buildStoragePath(bucket, key);
  if (!insideBucket(bucket, absPath)) throw new Error("Invalid key");
  await fs.mkdir(path.dirname(absPath), { recursive: true });
  const tmp = `${absPath}.${randomUUID()}.part`;
  await fs.writeFile(tmp, buffer);
  await fs.rename(tmp, absPath);
  return { key, url: buildPublicUrl(bucket, key), size: buffer.length };
}

// Supprime un dossier ODF (ex. les pages d'un document supprimé).
export async function removeOdfDir(bucket: Bucket, dir: string): Promise<void> {
  if (!/^odf\/[a-z0-9][a-z0-9_.\/-]*$/.test(dir) || dir.includes("..")) return;
  const absPath = buildStoragePath(bucket, dir);
  if (!insideBucket(bucket, absPath)) return;
  await fs.rm(absPath, { recursive: true, force: true });
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
