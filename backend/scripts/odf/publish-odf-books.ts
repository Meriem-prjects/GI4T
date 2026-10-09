// Publie dans l'ODF les documents « avec page de garde » préparés par
// prepare_odf_books.py (dossier _odf_web : manifest.json, textes HTML, pages
// WebP et PDF), via l'API REST, en local comme en production.
//
// Relancer le script est sans risque : chaque document est retrouvé par sa
// clé d'import (documents.import_key), un fichier déjà en ligne n'est pas
// renvoyé, et un document n'est modifié que si son contenu a changé (hash
// « sync » dans documents.book). Une deuxième exécution affiche 0 changement.
//
// Les documents sont créés NON publiés : ils sont publiés par
// purge-legacy-odf.ts (en même temps que la suppression des anciens) ou,
// pour des ajouts ultérieurs, avec --publish.
//
// Usage (depuis backend/) :
//   node --env-file=.env --env-file=.env.local ./node_modules/tsx/dist/cli.mjs scripts/odf/publish-odf-books.ts \
//     --web "C:/Users/<moi>/Desktop/ODF_Mise_en_forme_fiches/_odf_web" [--api http://localhost:4000]
//     [--dry-run] [--verify] [--publish] [--force] [--keys fiches/2009/,blogs/]
//     [--only=types,categories,files,documents,links,embeddings,publish] [--concurrency 4] [--reindex]
//     [--resolve domaine=ip]
//
// Identifiants : ODF_API_EMAIL / ODF_API_PASSWORD (à défaut DRI_API_*, et en
// local SEED_ADMIN_*). Le compte doit avoir le rôle admin ou admin_observatoire.

import dns from "node:dns";
import { createHash } from "node:crypto";
import { promises as fs, openAsBlob } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

type Json = Record<string, unknown>;

interface Edition {
  dir: string;
  pages: number;
  w: number;
  h: number;
  pdf: string;
  bytes: number;
  files: Array<{ rel: string; bytes: number }>;
}

interface Item {
  key: string;
  type: string;
  year: number | null;
  src: { ar: string; fr: string };
  meta: Record<string, any>;
  html: { ar: string; fr: string };
  editions: { ar?: Edition; fr?: Edition };
}

const TYPES: Record<string, { name: string; nameAr: string; description: string; descriptionAr: string }> = {
  fiches: {
    name: "Fiche de jurisprudence",
    nameAr: "جذاذة فقه القضاء",
    description: "Fiches d'analyse des décisions de justice",
    descriptionAr: "جذاذات تحليل القرارات القضائية",
  },
  analyses: {
    name: "Analyses juridiques",
    nameAr: "التحاليل القانونية",
    description: "Études approfondies d'un droit dans la jurisprudence",
    descriptionAr: "دراسات معمّقة لحقّ من الحقوق في فقه القضاء",
  },
  commentaires: {
    name: "Commentaires",
    nameAr: "التعاليق",
    description: "Commentaires de décisions par des magistrats et universitaires",
    descriptionAr: "تعاليق على القرارات من قضاة وجامعيين",
  },
  blogs: {
    name: "Blogs",
    nameAr: "المدونات",
    description: "Billets courts sur une décision récente",
    descriptionAr: "تدوينات قصيرة حول قرار حديث",
  },
  articles: {
    name: "Articles",
    nameAr: "المقالات",
    description: "Articles de fond sur l'effectivité des droits",
    descriptionAr: "مقالات حول فعلية الحقوق",
  },
  economie: {
    name: "Approche économique",
    nameAr: "المقاربة الاقتصادية",
    description: "Analyses économiques de la jurisprudence et des droits fondamentaux",
    descriptionAr: "تحاليل اقتصادية لفقه القضاء وللحقوق الأساسية",
  },
  notes: {
    name: "Notes thématiques",
    nameAr: "الأوراق الموضوعية",
    description: "Notes transversales sur une thématique",
    descriptionAr: "أوراق تتناول محورا من المحاور",
  },
  policy: {
    name: "Policy briefs",
    nameAr: "أوراق السياسات",
    description: "Recommandations à l'intention des décideurs",
    descriptionAr: "توصيات موجّهة إلى أصحاب القرار",
  },
  presentations: {
    name: "Présentations",
    nameAr: "التقديمات",
    description: "Présentations des juridictions et instances",
    descriptionAr: "تقديم الهيئات القضائية والدستورية",
  },
  recueils: {
    name: "Recueils",
    nameAr: "المجموعات",
    description: "Recueils annuels de la jurisprudence administrative",
    descriptionAr: "المجموعات السنوية لفقه القضاء الإداري",
  },
};

const PHASES = ["types", "categories", "files", "documents", "links", "embeddings", "publish"] as const;
type Phase = (typeof PHASES)[number];
const DEFAULT_PHASES: Phase[] = ["types", "categories", "files", "documents", "links", "embeddings"];

// ── CLI ──────────────────────────────────────────────────────────────────

function parseArgs(argv: string[]) {
  const opts: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const [key, inline] = arg.slice(2).split("=", 2);
    if (inline !== undefined) opts[key] = inline;
    else if (argv[i + 1] && !argv[i + 1].startsWith("--")) opts[key] = argv[++i];
    else opts[key] = true;
  }
  return opts;
}

const cli = parseArgs(process.argv.slice(2));
const API_BASE = String(cli.api ?? "http://localhost:4000").replace(/\/+$/, "");
const WEB_DIR = cli.web ? String(cli.web) : process.env.ODF_WEB_DIR;
const DRY_RUN = cli["dry-run"] === true;
const VERIFY = cli.verify === true;
const FORCE = cli.force === true;
const CONCURRENCY = Math.max(1, Number(cli.concurrency ?? 4));
const KEYS = cli.keys ? String(cli.keys).split(",").filter(Boolean) : [];
const ONLY = new Set<Phase>(
  cli.only ? (String(cli.only).split(",").map((s) => s.trim()) as Phase[]) : [...DEFAULT_PHASES, ...(cli.publish ? ["publish" as Phase] : [])],
);
const HERE = path.dirname(fileURLToPath(import.meta.url));

if (!WEB_DIR) {
  console.error("--web <dossier _odf_web> (ou ODF_WEB_DIR) est requis");
  process.exit(1);
}
for (const phase of ONLY) {
  if (!PHASES.includes(phase)) {
    console.error(`Phase inconnue : ${phase} (attendu : ${PHASES.join(", ")})`);
    process.exit(1);
  }
}

if (cli.resolve) {
  const [resolveHost, resolveIp] = String(cli.resolve).split("=");
  const lookup = dns.lookup;
  (dns as { lookup: unknown }).lookup = (hostname: string, options: unknown, callback?: unknown) => {
    const cb = (typeof options === "function" ? options : callback) as (...args: unknown[]) => void;
    const opts = (typeof options === "function" ? {} : options ?? {}) as { all?: boolean };
    if (hostname !== resolveHost) return (lookup as (...a: unknown[]) => void)(hostname, opts, cb);
    return opts.all ? cb(null, [{ address: resolveIp, family: 4 }]) : cb(null, resolveIp, 4);
  };
}

const stats = { uploads: 0, reused: 0, created: 0, patched: 0, unchanged: 0, linksAdded: 0, linksRemoved: 0, published: 0 };
const log = (msg: string) => console.log(msg);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ── HTTP ─────────────────────────────────────────────────────────────────

class ApiError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

let token: string | null = null;

async function request<T = Json>(method: string, route: string, body?: { json?: unknown; form?: FormData }): Promise<T> {
  const url = route.startsWith("http") ? route : `${API_BASE}${route}`;
  for (let attempt = 1; ; attempt++) {
    let res: Response;
    try {
      res = await fetch(url, {
        method,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(body?.json !== undefined ? { "Content-Type": "application/json" } : {}),
        },
        body: body?.form ?? (body?.json !== undefined ? JSON.stringify(body.json) : undefined),
      });
    } catch (err) {
      if (attempt < 4) {
        await sleep(2000 * attempt);
        continue;
      }
      throw new Error(`${method} ${url} : ${(err as Error).message}`);
    }
    if ([502, 503, 504].includes(res.status) && attempt < 4) {
      await sleep(2000 * attempt);
      continue;
    }
    const text = await res.text();
    if (!res.ok) throw new ApiError(res.status, `${method} ${url} → ${res.status} ${text.slice(0, 600)}`);
    return (text ? JSON.parse(text) : {}) as T;
  }
}

// Les routes génériques plafonnent `limit` à 500 : on avance du nombre
// d'éléments réellement reçus.
async function listAll(route: string, query: Record<string, string> = {}): Promise<Json[]> {
  const out: Json[] = [];
  for (;;) {
    const qs = new URLSearchParams({ limit: "500", offset: String(out.length), ...query });
    const res = await request<{ items?: Json[]; total?: number } | Json[]>("GET", `${route}?${qs}`);
    const items = Array.isArray(res) ? res : res.items ?? [];
    out.push(...items);
    const total = Array.isArray(res) ? items.length : Number(res.total ?? items.length);
    if (Array.isArray(res) || out.length >= total || items.length === 0) return out;
  }
}

async function pool<T>(items: T[], n: number, fn: (item: T) => Promise<void>) {
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(n, items.length) }, async () => {
      while (next < items.length) await fn(items[next++]);
    }),
  );
}

// ── État local (fichiers déjà envoyés, documents à indexer) ─────────────

interface State {
  files: Record<string, number>;
  pendingEmbeddings: string[];
}

const host = new URL(API_BASE);
const STATE_PATH = path.join(WEB_DIR, `state.${host.hostname}_${host.port || (host.protocol === "https:" ? "443" : "80")}.json`);
let state: State = { files: {}, pendingEmbeddings: [] };

async function loadState() {
  try {
    state = { files: {}, pendingEmbeddings: [], ...JSON.parse(await fs.readFile(STATE_PATH, "utf8")) };
  } catch {
    state = { files: {}, pendingEmbeddings: [] };
  }
}

let saving: Promise<void> = Promise.resolve();
function saveState() {
  if (DRY_RUN) return saving;
  saving = saving.then(async () => {
    const tmp = `${STATE_PATH}.part`;
    await fs.writeFile(tmp, JSON.stringify(state));
    await fs.rename(tmp, STATE_PATH);
  });
  return saving;
}

// ── Manifeste ────────────────────────────────────────────────────────────

let items: Item[] = [];

async function loadManifest() {
  const raw = JSON.parse(await fs.readFile(path.join(WEB_DIR!, "manifest.json"), "utf8"));
  if (raw.problems?.length) {
    throw new Error(`Le manifeste signale ${raw.problems.length} problème(s) : ${raw.problems.slice(0, 5).join(" | ")}`);
  }
  items = (raw.items as Item[]).filter((it) => !KEYS.length || KEYS.some((k) => it.key.startsWith(k)));
  for (const it of items) {
    if (!it.editions.ar || !it.editions.fr) throw new Error(`${it.key} : édition manquante (relancer la préparation)`);
    if (!TYPES[it.type]) throw new Error(`${it.key} : type inconnu ${it.type}`);
  }
}

const fileUrl = (key: string) => `${API_BASE}/api/storage/documents/${key}`;

// ── Phase : types de documents ───────────────────────────────────────────

const typeIds = new Map<string, string>();

async function phaseTypes() {
  log("\n▶ Types de documents");
  const existing = await listAll("/api/document-types");
  for (const [key, t] of Object.entries(TYPES)) {
    const found = existing.find((e) => String(e.name).trim() === t.name);
    if (found) {
      typeIds.set(key, String(found.id));
      continue;
    }
    log(`  + type « ${t.name} »`);
    if (DRY_RUN) {
      typeIds.set(key, `simulation:${key}`);
      continue;
    }
    const created = await request<Json>("POST", "/api/document-types", {
      json: { name: t.name, name_ar: t.nameAr, description: t.description, description_ar: t.descriptionAr },
    });
    typeIds.set(key, String(created.id));
  }
}

// ── Phase : droits fondamentaux (categories) ─────────────────────────────

const fold = (s: unknown) =>
  String(s ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u2019\u2018`]/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const categoryIds = new Map<string, string>();

async function phaseCategories() {
  log("\n▶ Droits fondamentaux");
  const map = JSON.parse(await fs.readFile(path.join(HERE, "odf_rights_map.json"), "utf8"));
  let cats = await listAll("/api/categories");
  const byName = () => {
    const m = new Map<string, Json>();
    // Les doublons (« Droit d'asile politique » / « Droit d’asile politique »)
    // se replient sur la même clé : on garde le premier, nom le plus court.
    for (const c of [...cats].sort((a, b) => String(a.name).length - String(b.name).length)) {
      if (!m.has(fold(c.name))) m.set(fold(c.name), c);
    }
    return m;
  };
  for (const [oldName, newName] of Object.entries(map.renames ?? {}) as Array<[string, string]>) {
    const idx = byName();
    const old = idx.get(fold(oldName));
    if (old && !idx.has(fold(newName))) {
      log(`  ~ « ${oldName} » → « ${newName} »`);
      if (!DRY_RUN) await request("PATCH", `/api/categories/${old.id}`, { json: { name: newName } });
      old.name = newName;
    }
  }
  for (const c of (map.create ?? []) as Array<{ name: string; name_ar: string; color?: string }>) {
    if (byName().has(fold(c.name))) continue;
    log(`  + droit « ${c.name} »`);
    if (DRY_RUN) {
      cats.push({ id: `simulation:${c.name}`, name: c.name });
      continue;
    }
    cats.push(await request<Json>("POST", "/api/categories", { json: { name: c.name, name_ar: c.name_ar, color: c.color ?? "#4F46E5" } }));
  }
  cats = cats.filter(Boolean);
  const idx = byName();
  const unknown = new Set<string>();
  for (const it of items) {
    for (const name of (it.meta.rights ?? []) as string[]) {
      const c = idx.get(fold(name));
      if (c) categoryIds.set(name, String(c.id));
      else unknown.add(name);
    }
  }
  if (unknown.size) throw new Error(`Droits introuvables dans la base : ${[...unknown].join(" | ")}`);
  log(`  ${categoryIds.size} droit(s) utilisés`);
}

// ── Phase : fichiers (pages, miniatures, PDF) ────────────────────────────

const MIME: Record<string, string> = { ".webp": "image/webp", ".pdf": "application/pdf" };

async function headOk(url: string, bytes: number): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok && Number(res.headers.get("content-length")) === bytes;
  } catch {
    return false;
  }
}

async function phaseFiles() {
  log("\n▶ Fichiers (pages, miniatures, PDF)");
  const jobs: Array<{ key: string; bytes: number; local: string }> = [];
  for (const it of items) {
    for (const ed of [it.editions.ar!, it.editions.fr!]) {
      for (const f of ed.files) {
        if (f.rel === "done.json") continue;
        const key = `${ed.dir}/${f.rel}`;
        jobs.push({ key, bytes: f.bytes, local: path.join(WEB_DIR!, "files", ...ed.dir.split("/"), f.rel) });
      }
    }
  }
  const total = jobs.length;
  let done = 0;
  let sinceSave = 0;
  await pool(jobs, CONCURRENCY, async (job) => {
    done++;
    if (state.files[job.key] === job.bytes && !VERIFY) {
      stats.reused++;
      return;
    }
    if (await headOk(fileUrl(job.key), job.bytes)) {
      state.files[job.key] = job.bytes;
      stats.reused++;
      return;
    }
    stats.uploads++;
    if (DRY_RUN) return;
    const form = new FormData();
    form.append("key", job.key);
    form.append("file", await openAsBlob(job.local, { type: MIME[path.extname(job.local)] ?? "application/octet-stream" }), path.basename(job.local));
    const res = await request<{ size: number }>("POST", "/api/storage/documents/put", { form });
    if (res.size !== job.bytes) throw new Error(`Taille reçue ${res.size} ≠ ${job.bytes} pour ${job.key}`);
    state.files[job.key] = job.bytes;
    if (++sinceSave >= 200) {
      sinceSave = 0;
      await saveState();
    }
    if (stats.uploads % 500 === 0) log(`  … ${done}/${total} (${stats.uploads} envoyés)`);
  });
  await saveState();
  log(`  ${total} fichiers : ${stats.uploads} envoyés, ${stats.reused} déjà en ligne`);
}

// ── Phase : documents ────────────────────────────────────────────────────

const existingByKey = new Map<string, Json>();
const docIdByKey = new Map<string, string>();

async function loadExisting() {
  existingByKey.clear();
  for (const d of await listAll("/api/documents", { fields: "sync", imported: "true" })) {
    existingByKey.set(String(d.import_key), d);
    docIdByKey.set(String(d.import_key), String(d.id));
  }
}

const dateTime = (d?: string | null) => (d ? `${d}T00:00:00.000Z` : null);
const edBook = (ed: Edition) => ({ dir: ed.dir, pages: ed.pages, w: ed.w, h: ed.h, pdf: ed.pdf, bytes: ed.bytes });

async function buildPayload(it: Item): Promise<Json> {
  const m = it.meta;
  const [htmlAr, htmlFr] = await Promise.all([
    fs.readFile(path.join(WEB_DIR!, it.html.ar), "utf8"),
    fs.readFile(path.join(WEB_DIR!, it.html.fr), "utf8"),
  ]);
  const fr = it.editions.fr!;
  const pdf = fileUrl(`${fr.dir}/${fr.pdf}`);
  const rights = ((m.rights ?? []) as string[]).map((r) => categoryIds.get(r)).filter(Boolean) as string[];
  const payload: Json = {
    title: m.title || m.titleAr || it.key,
    titleAr: m.titleAr || null,
    subtitle: m.subtitle || null,
    subtitleAr: m.subtitleAr || null,
    summary: m.summary || null,
    summaryAr: m.summaryAr || null,
    author: m.author || null,
    authorAr: m.authorAr || null,
    keywords: m.keywords ?? [],
    keywordsAr: m.keywordsAr ?? [],
    content: htmlAr,
    translatedContent: htmlFr,
    language: "ar",
    documentTypeId: typeIds.get(it.type),
    documentType: TYPES[it.type].name,
    categoryId: rights[0] ?? null,
    originalFilename: it.src.fr,
    fileUrl: pdf,
    pdfUrl: pdf,
    fileSize: fr.bytes,
    pageCount: fr.pages,
    status: "processed",
    year: m.year ?? null,
    validationDate: dateTime(m.validationDate),
    caseNumber: m.caseNumber || null,
    court: m.court || null,
    courtAr: m.courtAr || null,
    courtLevel: m.courtLevel || null,
    courtLevelAr: m.courtLevelAr || null,
    plaintiff: m.plaintiff || null,
    plaintiffAr: m.plaintiffAr || null,
    defendant: m.defendant || null,
    defendantAr: m.defendantAr || null,
    legalReferences: m.referenceFr ? [m.referenceFr] : [],
    legalReferencesAr: m.referenceAr ? [m.referenceAr] : [],
    dates: m.decisionDate ? [m.decisionDate] : [],
    importKey: it.key,
    sortOrder: typeof m.sortOrder === "number" ? m.sortOrder : null,
  };
  const book: Json = { v: 1, fr: edBook(fr), ar: edBook(it.editions.ar!), refs: m.refs ?? [] };
  const sync = createHash("sha256")
    .update(JSON.stringify({ payload, book, rights }))
    .digest("hex")
    .slice(0, 16);
  payload.book = { ...book, sync };
  return payload;
}

async function phaseDocuments() {
  log("\n▶ Documents");
  await loadExisting();
  const changed: string[] = [];
  await pool(items, Math.min(CONCURRENCY, 4), async (it) => {
    const payload = await buildPayload(it);
    const existing = existingByKey.get(it.key);
    if (existing) {
      const have = (existing.book as Json | null)?.sync;
      if (have === (payload.book as Json).sync && !FORCE) {
        stats.unchanged++;
        return;
      }
      stats.patched++;
      log(`  ~ ${it.key}`);
      if (!DRY_RUN) await request("PATCH", `/api/documents/${existing.id}`, { json: payload });
      changed.push(String(existing.id));
      return;
    }
    stats.created++;
    if (DRY_RUN) return;
    const created = await request<Json>("POST", "/api/documents", { json: { ...payload, published: false } });
    docIdByKey.set(it.key, String(created.id));
    changed.push(String(created.id));
    if (stats.created % 100 === 0) log(`  … ${stats.created} documents créés`);
  });
  state.pendingEmbeddings = [...new Set([...state.pendingEmbeddings, ...changed])];
  await saveState();
  log(`  ${stats.created} créé(s), ${stats.patched} mis à jour, ${stats.unchanged} inchangé(s)`);
}

// ── Phase : liens document ↔ droits ──────────────────────────────────────

async function phaseLinks() {
  log("\n▶ Liens avec les droits fondamentaux");
  await loadExisting();
  const toAdd: Json[] = [];
  const toRemove: string[] = [];
  for (const it of items) {
    const doc = existingByKey.get(it.key);
    if (!doc) {
      if (!DRY_RUN) throw new Error(`${it.key} : document absent (lancer la phase documents)`);
      continue;
    }
    const want = new Set(((it.meta.rights ?? []) as string[]).map((r) => categoryIds.get(r)!).filter(Boolean));
    const have = (doc.document_categories as Array<{ id: string; category_id: string }>) ?? [];
    for (const link of have) if (!want.has(link.category_id)) toRemove.push(link.id);
    for (const c of want) if (!have.some((l) => l.category_id === c)) toAdd.push({ document_id: doc.id, category_id: c });
  }
  stats.linksAdded = toAdd.length;
  stats.linksRemoved = toRemove.length;
  if (!DRY_RUN) {
    for (let i = 0; i < toAdd.length; i += 200) {
      await request("POST", "/api/document-categories", { json: toAdd.slice(i, i + 200) });
    }
    await pool(toRemove, CONCURRENCY, async (id) => {
      await request("DELETE", `/api/document-categories/${id}`);
    });
  }
  log(`  ${toAdd.length} lien(s) ajouté(s), ${toRemove.length} retiré(s)`);
}

// ── Phase : embeddings (recherche sémantique et assistant) ───────────────

async function phaseEmbeddings() {
  log("\n▶ Embeddings");
  if (cli.reindex) {
    await loadExisting();
    const all = items.map((it) => docIdByKey.get(it.key)).filter(Boolean) as string[];
    state.pendingEmbeddings = [...new Set([...state.pendingEmbeddings, ...all])];
  }
  const ids = state.pendingEmbeddings;
  if (!ids.length) {
    log("  rien à indexer");
    return;
  }
  if (DRY_RUN) {
    log(`  [simulation] ${ids.length} document(s) à indexer`);
    return;
  }
  let processed = 0;
  let failed = 0;
  while (state.pendingEmbeddings.length) {
    const chunk = state.pendingEmbeddings.slice(0, 50);
    const res = await request<{ processed: number; failed: number }>("POST", "/api/fn/batch-generate-embeddings", {
      json: { ids: chunk },
    });
    processed += res.processed;
    failed += res.failed;
    if (res.failed) {
      // On garde le lot pour la prochaine exécution (le serveur ne dit pas
      // quel document a échoué) et on s'arrête : voir les journaux du serveur.
      log(`  ✗ ${res.failed} échec(s) dans le lot : documents conservés pour une nouvelle tentative`);
      break;
    }
    state.pendingEmbeddings = state.pendingEmbeddings.slice(chunk.length);
    await saveState();
    log(`  … ${processed} indexé(s)`);
  }
  await saveState();
  if (failed) process.exitCode = 1;
}

// ── Phase : publication (ajouts ultérieurs) ──────────────────────────────

async function phasePublish() {
  log("\n▶ Publication");
  await loadExisting();
  const ids = items.map((it) => existingByKey.get(it.key)).filter((d) => d && !d.published).map((d) => String(d!.id));
  stats.published = ids.length;
  if (!DRY_RUN) {
    await pool(ids, CONCURRENCY, async (id) => {
      await request("PATCH", `/api/documents/${id}`, { json: { published: true, status: "processed" } });
    });
  }
  log(`  ${ids.length} document(s) publié(s)`);
}

// ── Vérification ─────────────────────────────────────────────────────────

async function verify() {
  log("\n▶ Vérification");
  await loadExisting();
  const counts: Record<string, number> = {};
  let missing = 0;
  for (const it of items) {
    if (existingByKey.has(it.key)) counts[it.type] = (counts[it.type] ?? 0) + 1;
    else missing++;
  }
  log(`  documents en ligne par type : ${JSON.stringify(counts)}${missing ? ` — ${missing} manquant(s)` : ""}`);
  const urls: Array<{ url: string; type: string }> = [];
  for (const it of items) {
    for (const ed of [it.editions.ar!, it.editions.fr!]) {
      for (const f of ed.files) {
        if (f.rel === "done.json") continue;
        urls.push({ url: fileUrl(`${ed.dir}/${f.rel}`), type: f.rel.endsWith(".pdf") ? "application/pdf" : "image/webp" });
      }
    }
  }
  let bad = 0;
  await pool(urls, 8, async ({ url, type }) => {
    const res = await fetch(url, { method: "HEAD" }).catch(() => null);
    if (!res?.ok || !(res.headers.get("content-type") ?? "").startsWith(type)) {
      bad++;
      if (bad <= 20) log(`  ✗ ${res?.status ?? "réseau"} ${url}`);
    }
  });
  log(`  ${urls.length - bad}/${urls.length} fichiers accessibles`);
  if (bad || missing) process.exitCode = 1;
}

// ── Main ─────────────────────────────────────────────────────────────────

async function main() {
  const isLocal = ["localhost", "127.0.0.1"].includes(host.hostname);
  const email = process.env.ODF_API_EMAIL ?? process.env.DRI_API_EMAIL ?? (isLocal ? process.env.SEED_ADMIN_EMAIL : undefined);
  const password =
    process.env.ODF_API_PASSWORD ?? process.env.DRI_API_PASSWORD ?? (isLocal ? process.env.SEED_ADMIN_PASSWORD : undefined);
  if (!email || !password) throw new Error("Identifiants manquants : ODF_API_EMAIL / ODF_API_PASSWORD");

  log(`Cible : ${API_BASE}${cli.resolve ? ` via ${cli.resolve}` : ""}${DRY_RUN ? " (simulation, aucune écriture)" : ""}`);
  const login = await request<{ token: string; user: { roles: string[] } }>("POST", "/api/auth/login", {
    json: { email, password },
  });
  token = login.token;
  const roles = login.user.roles ?? [];
  if (!roles.some((r) => r === "admin" || r === "admin_observatoire")) {
    throw new Error(`Le compte ${email} n'a ni le rôle admin ni admin_observatoire`);
  }
  // Un serveur sans la migration odf_books (ou un client Prisma périmé)
  // répond en erreur ici : on s'arrête avant d'écrire quoi que ce soit.
  await request("GET", "/api/documents?fields=sync&imported=true&limit=1");
  await request("GET", "/api/documents/facets?limit=1");

  await loadManifest();
  await loadState();
  log(`${items.length} document(s) dans le manifeste`);

  const needIds = ONLY.has("documents") || ONLY.has("links");
  if (ONLY.has("types") || needIds) await phaseTypes();
  if (ONLY.has("categories") || needIds) await phaseCategories();
  if (ONLY.has("files")) await phaseFiles();
  if (ONLY.has("documents")) await phaseDocuments();
  if (ONLY.has("links")) await phaseLinks();
  if (ONLY.has("embeddings")) await phaseEmbeddings();
  if (ONLY.has("publish")) await phasePublish();

  log(
    `\nBilan : ${stats.uploads} envoi(s), ${stats.reused} fichier(s) déjà en ligne, ${stats.created} création(s), ` +
      `${stats.patched} mise(s) à jour, ${stats.unchanged} inchangé(s), liens +${stats.linksAdded}/-${stats.linksRemoved}` +
      (ONLY.has("publish") ? `, ${stats.published} publication(s)` : ""),
  );
  if (VERIFY && !DRY_RUN) await verify();
}

main().catch((err) => {
  console.error(`\n✗ ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
