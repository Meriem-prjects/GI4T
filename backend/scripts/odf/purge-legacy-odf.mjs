// Supprime les anciens documents de l'ODF (ceux qui ne viennent pas de
// l'import « avec page de garde ») et publie les nouveaux, en une seule
// transaction. Accès direct à la base (variables de backend/.env).
//
// Par défaut : simulation (décompte de tout ce qui serait touché).
//
//   node --env-file=.env scripts/odf/purge-legacy-odf.mjs
//   node --env-file=.env scripts/odf/purge-legacy-odf.mjs --apply --expect-legacy=911 [--publish-import] [--cutoff=2027-10-10T00:00:00Z]
//   node --env-file=.env scripts/odf/purge-legacy-odf.mjs --purge-quarantine --older-than-days=7
//
// Ce qui est supprimé (--apply) :
//   - les documents sans import_key (et créés avant --cutoff s'il est donné) ;
//     leurs liens aux droits, vues et commentaires partent en cascade ;
//   - les traitements (processing_jobs) que plus aucun document n'utilise ;
//   - les points de reprise de l'ancien import (import_checkpoints).
// Fichiers : dans le bucket « documents », seuls les fichiers que plus aucune
// ligne de la base ne cite sont déplacés en quarantaine
// (storage/_quarantine/odf-<date>/), jamais supprimés directement. Les
// dossiers events/, resources/, news/ et training/ ne sont jamais touchés,
// ni les buckets album-photos et media.

import { PrismaClient } from "@prisma/client";
import { promises as fs } from "node:fs";
import path from "node:path";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  }),
);
const APPLY = args.apply === true;
const STORAGE_DIR = path.resolve(process.env.STORAGE_DIR ?? "./storage");
const BUCKET_DIR = path.join(STORAGE_DIR, "documents");
const PROTECTED = ["events/", "resources/", "news/", "training/"];
const prisma = new PrismaClient();
const log = (...a) => console.log(...a);

const legacyWhere = () => {
  const cutoff = args.cutoff ? new Date(String(args.cutoff)) : null;
  if (cutoff && Number.isNaN(cutoff.getTime())) throw new Error("--cutoff invalide");
  return cutoff ? { importKey: null, createdAt: { lt: cutoff } } : { importKey: null };
};

async function walk(dir, base = dir) {
  const out = [];
  let entries = [];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(abs, base)));
    else out.push(path.relative(base, abs).split(path.sep).join("/"));
  }
  return out;
}

// Chemins du bucket « documents » cités par la base, en ignorant les lignes
// qui vont être supprimées.
async function referencedKeys(excludeDocumentIds) {
  const tables = await prisma.$queryRawUnsafe(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`,
  );
  const refs = new Set();
  const re = /\/api\/storage\/documents\/([^"'\s?#)\\<>]+)/g;
  const exclude = new Set(excludeDocumentIds);
  for (const { table_name } of tables) {
    if (table_name.startsWith("_prisma")) continue;
    const rows = await prisma.$queryRawUnsafe(`SELECT row_to_json(t)::text AS j FROM "${table_name}" t`);
    for (const { j } of rows) {
      if (table_name === "documents" && exclude.size) {
        const id = /"id":"([0-9a-f-]{36})"/.exec(j)?.[1];
        if (id && exclude.has(id)) continue;
      }
      for (const m of j.matchAll(re)) {
        try {
          refs.add(decodeURIComponent(m[1]));
        } catch {
          refs.add(m[1]);
        }
      }
    }
  }
  return refs;
}

async function filePlan(legacyIds) {
  const refs = await referencedKeys(legacyIds);
  // Dossiers des pages encore utilisés par un document importé
  const books = await prisma.document.findMany({ where: { importKey: { not: null } }, select: { book: true } });
  const liveDirs = new Set();
  for (const { book } of books) {
    for (const ed of Object.values(book ?? {})) if (ed && typeof ed === "object" && typeof ed.dir === "string") liveDirs.add(ed.dir + "/");
  }
  const all = await walk(BUCKET_DIR);
  const move = [];
  let bytes = 0;
  for (const key of all) {
    if (key === ".gitkeep" || PROTECTED.some((p) => key.startsWith(p))) continue;
    if (key.startsWith("odf/")) {
      if ([...liveDirs].some((d) => key.startsWith(d))) continue;
    } else if (refs.has(key)) {
      continue;
    }
    move.push(key);
    bytes += (await fs.stat(path.join(BUCKET_DIR, key))).size;
  }
  return { total: all.length, move, bytes };
}

async function counts() {
  const rows = await prisma.$queryRawUnsafe(`
    SELECT 'documents' AS t, count(*)::int AS n FROM documents
    UNION ALL SELECT 'documents_importes', count(*)::int FROM documents WHERE import_key IS NOT NULL
    UNION ALL SELECT 'documents_importes_publies', count(*)::int FROM documents WHERE import_key IS NOT NULL AND published
    UNION ALL SELECT 'document_categories', count(*)::int FROM document_categories
    UNION ALL SELECT 'document_views', count(*)::int FROM document_views
    UNION ALL SELECT 'document_comments', count(*)::int FROM document_comments
    UNION ALL SELECT 'processing_jobs', count(*)::int FROM processing_jobs
    UNION ALL SELECT 'import_checkpoints', count(*)::int FROM import_checkpoints
    UNION ALL SELECT 'categories', count(*)::int FROM categories
    UNION ALL SELECT 'document_types', count(*)::int FROM document_types`);
  return Object.fromEntries(rows.map((r) => [r.t, r.n]));
}

async function main() {
  if (args["purge-quarantine"]) {
    const days = Number(args["older-than-days"] ?? 7);
    const qdir = path.join(STORAGE_DIR, "_quarantine");
    for (const name of await fs.readdir(qdir).catch(() => [])) {
      const st = await fs.stat(path.join(qdir, name));
      if (Date.now() - st.mtimeMs > days * 86400e3) {
        await fs.rm(path.join(qdir, name), { recursive: true, force: true });
        log("quarantaine supprimée :", name);
      }
    }
    return;
  }

  const where = legacyWhere();
  const legacy = await prisma.document.findMany({
    where,
    select: { id: true, status: true, published: true, documentTypeRel: { select: { name: true } } },
  });
  const legacyIds = legacy.map((d) => d.id);
  const byType = {};
  for (const d of legacy) {
    const k = `${d.documentTypeRel?.name ?? "(sans type)"} / ${d.status} / ${d.published ? "publié" : "non publié"}`;
    byType[k] = (byType[k] ?? 0) + 1;
  }
  const [links, views, comments] = await Promise.all([
    prisma.documentCategory.count({ where: { documentId: { in: legacyIds } } }),
    prisma.documentView.count({ where: { documentId: { in: legacyIds } } }),
    prisma.documentComment.count({ where: { documentId: { in: legacyIds } } }),
  ]);
  const before = await counts();
  log("Anciens documents :", legacy.length);
  for (const [k, v] of Object.entries(byType).sort((a, b) => b[1] - a[1])) log(`  ${v}\t${k}`);
  log(`Liens aux droits : ${links} ; vues : ${views} ; commentaires : ${comments}`);
  log("Tables avant :", JSON.stringify(before));
  const plan = await filePlan(legacyIds);
  log(`Fichiers du bucket documents : ${plan.total} ; à mettre en quarantaine : ${plan.move.length} (${(plan.bytes / 1e6).toFixed(1)} Mo)`);

  if (!APPLY) {
    log("\nSimulation : rien n'a été modifié. Relancer avec --apply --expect-legacy=" + legacy.length);
    return;
  }
  const expected = Number(args["expect-legacy"]);
  if (!Number.isInteger(expected) || expected !== legacy.length) {
    throw new Error(`--expect-legacy=${args["expect-legacy"]} ne correspond pas aux ${legacy.length} anciens documents : arrêt`);
  }

  const result = await prisma.$transaction(async (tx) => {
    const n = await tx.document.count({ where });
    if (n !== expected) throw new Error(`Nombre d'anciens documents changé (${n}) : annulation`);
    const deleted = await tx.document.deleteMany({ where });
    const jobs = await tx.$executeRawUnsafe(
      `DELETE FROM processing_jobs pj WHERE NOT EXISTS (SELECT 1 FROM documents d WHERE d.processing_job_id = pj.id)`,
    );
    const checkpoints = await tx.$executeRawUnsafe(`DELETE FROM import_checkpoints`);
    let published = 0;
    if (args["publish-import"]) {
      published = (
        await tx.document.updateMany({
          where: { importKey: { not: null }, OR: [{ published: false }, { published: null }, { status: { not: "processed" } }] },
          data: { published: true, status: "processed" },
        })
      ).count;
    }
    return { deleted: deleted.count, jobs, checkpoints, published };
  }, { timeout: 120000 });
  log("Base :", JSON.stringify(result));

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const qroot = path.join(STORAGE_DIR, "_quarantine", `odf-${stamp}`);
  let moved = 0;
  for (const key of plan.move) {
    const src = path.join(BUCKET_DIR, key);
    const dst = path.join(qroot, key);
    await fs.mkdir(path.dirname(dst), { recursive: true });
    await fs.rename(src, dst).then(() => moved++).catch((e) => log("  ✗", key, e.message));
  }
  await fs.mkdir(qroot, { recursive: true });
  await fs.writeFile(path.join(qroot, "report.json"), JSON.stringify({ result, moved: plan.move, before, after: await counts() }, null, 1));
  log(`Fichiers déplacés en quarantaine : ${moved} → ${qroot}`);
  log("Tables après :", JSON.stringify(await counts()));
}

main()
  .catch((err) => {
    console.error("✗", err.message ?? err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
