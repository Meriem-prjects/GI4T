// Downloads files from Supabase Storage buckets and copies them into the local
// filesystem under backend/storage/<bucket>/. Then rewrites DB rows that
// reference Supabase URLs to point to the new local paths.
//
// Usage: tsx scripts/migrate-storage.ts <supabase-url> <service-role-key>

import fs from "node:fs/promises";
import path from "node:path";
import { prisma } from "../src/lib/prisma.js";
import { env } from "../src/config/env.js";

const BUCKETS = ["documents", "media"] as const;

interface StorageObject {
  name: string;
  id: string;
  metadata?: { size?: number };
}

async function listBucket(
  supabaseUrl: string,
  serviceKey: string,
  bucket: string,
  prefix = "",
): Promise<StorageObject[]> {
  const res = await fetch(`${supabaseUrl}/storage/v1/object/list/${bucket}`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prefix, limit: 1000, offset: 0 }),
  });
  if (!res.ok) throw new Error(`List ${bucket} failed: ${res.status}`);
  return res.json() as Promise<StorageObject[]>;
}

async function downloadFile(
  supabaseUrl: string,
  serviceKey: string,
  bucket: string,
  key: string,
): Promise<Buffer> {
  const res = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${key}`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
  });
  if (!res.ok) throw new Error(`Download ${key} failed: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function rewriteDocumentUrls(oldBase: string) {
  const docs = await prisma.document.findMany({
    where: {
      OR: [
        { fileUrl: { contains: oldBase } },
        { pdfUrl: { contains: oldBase } },
      ],
    },
    select: { id: true, fileUrl: true, pdfUrl: true },
  });
  for (const d of docs) {
    const fileUrl = d.fileUrl?.replace(oldBase, env.STORAGE_PUBLIC_URL);
    const pdfUrl = d.pdfUrl?.replace(oldBase, env.STORAGE_PUBLIC_URL);
    await prisma.document.update({
      where: { id: d.id },
      data: { fileUrl, pdfUrl },
    });
  }
  console.log(`Rewrote ${docs.length} document URLs`);
}

async function main() {
  const [supabaseUrl, serviceKey] = process.argv.slice(2);
  if (!supabaseUrl || !serviceKey) {
    console.error("Usage: tsx scripts/migrate-storage.ts <url> <service-role-key>");
    process.exit(1);
  }

  for (const bucket of BUCKETS) {
    console.log(`\n=== Bucket: ${bucket} ===`);
    const items = await listBucket(supabaseUrl, serviceKey, bucket);
    console.log(`  ${items.length} objects`);

    for (const item of items) {
      const key = item.name;
      const destPath = path.resolve(env.STORAGE_DIR, bucket, key);
      await fs.mkdir(path.dirname(destPath), { recursive: true });
      try {
        const buffer = await downloadFile(supabaseUrl, serviceKey, bucket, key);
        await fs.writeFile(destPath, buffer);
        console.log(`  ✓ ${key} (${buffer.length} bytes)`);
      } catch (err) {
        console.error(`  ✗ ${key}:`, err);
      }
    }
  }

  const oldBase = `${supabaseUrl}/storage/v1/object/public`;
  await rewriteDocumentUrls(oldBase);
  await rewriteDocumentUrls(`${supabaseUrl}/storage/v1/object`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
