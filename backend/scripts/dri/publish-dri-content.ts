// Publishes the DRI campaign content (Taktouk / CinémaTdour) to the
// "Accès aux droits" section through the REST API, so the same run works
// against the local backend and against production (whose storage is not
// synced by the deploy).
//
// Photos, posters and PDFs come from the _web folder written by
// prepare_dri_media.py, texts from dri-content.ts; the videos are YouTube
// links (dri-videos.ts). Reruns are safe: rows are matched by natural key
// (stage governorate, title, phone…), uploads are cached per target in
// _web/state.<host>_<port>.json and re-checked with HEAD, and unchanged
// rows are not PATCHed. A second run reports 0 upload / 0 create / 0 patch.
// Nothing is ever deleted.
//
// Usage (from backend/):
//   node --use-system-ca --env-file=.env ./node_modules/tsx/dist/cli.mjs scripts/dri/publish-dri-content.ts \
//     --web "C:/Users/<me>/Desktop/DRI/_web" [--api http://localhost:4000] [--dry-run] [--verify]
//     [--only=events,albums,media,news,resources,addresses,training,embeddings]
//     [--resolve test.justclic.org=102.204.206.147]   # host without working DNS
//
// Credentials: DRI_API_EMAIL / DRI_API_PASSWORD (e.g. in the git-ignored
// .env.local: add --env-file=.env.local). Against localhost only, they
// default to SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD from .env.

import dns from "node:dns";
import { promises as fs, openAsBlob } from "node:fs";
import path from "node:path";
import {
  ADDRESSES,
  ALBUMS,
  NEWS,
  RESOURCES,
  STAGES,
  TRAINING_DOCS,
  VIDEOS,
  YOUTUBE_LINKS,
  type StageKey,
} from "./dri-content.js";

type Json = Record<string, unknown>;
type Bucket = "documents" | "media" | "album-photos";

interface FileRef {
  out: string;
  sha256: string;
  bytes: number;
}

interface ManifestItem extends FileRef {
  id: string;
  kind: "photo" | "poster" | "video" | "doc";
  group: string;
  order?: number;
  durationLabel?: string;
  thumb?: FileRef;
}

const PHASES = ["events", "albums", "media", "news", "resources", "addresses", "training", "embeddings"] as const;
type Phase = (typeof PHASES)[number];

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
const WEB_DIR = cli.web ? String(cli.web) : process.env.DRI_WEB_DIR;
const DRY_RUN = cli["dry-run"] === true;
const VERIFY = cli.verify === true;
const ONLY = new Set<Phase>(
  cli.only ? (String(cli.only).split(",").map((s) => s.trim()) as Phase[]) : PHASES,
);

if (!WEB_DIR) {
  console.error("--web <dossier _web> (ou DRI_WEB_DIR) est requis");
  process.exit(1);
}
for (const phase of ONLY) {
  if (!PHASES.includes(phase)) {
    console.error(`Phase inconnue : ${phase} (attendu : ${PHASES.join(", ")})`);
    process.exit(1);
  }
}

// --resolve host=ip: reach a server whose domain no longer resolves while
// keeping the Host/SNI (and therefore the stored URLs) on the domain.
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

const stats = { uploads: 0, reused: 0, created: 0, patched: 0, unchanged: 0 };
const log = (msg: string) => console.log(msg);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ── HTTP ─────────────────────────────────────────────────────────────────

class ApiError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

let token: string | null = null;

async function request<T = Json>(
  method: string,
  route: string,
  body?: { json?: unknown; form?: FormData },
): Promise<T> {
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
      if (attempt < 3) {
        await sleep(2000 * attempt);
        continue;
      }
      throw new Error(`${method} ${url} : ${(err as Error).message}`);
    }
    if ([502, 503, 504].includes(res.status) && attempt < 3) {
      await sleep(2000 * attempt);
      continue;
    }
    const text = await res.text();
    if (!res.ok) throw new ApiError(res.status, `${method} ${url} → ${res.status} ${text.slice(0, 600)}`);
    return (text ? JSON.parse(text) : {}) as T;
  }
}

async function getOrNull(route: string): Promise<Json | null> {
  try {
    return await request<Json>("GET", route);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

async function list(route: string, query: Record<string, string> = {}): Promise<Json[]> {
  const qs = new URLSearchParams({ limit: "500", ...query });
  const res = await request<{ items: Json[] }>("GET", `${route}?${qs}`);
  return res.items ?? [];
}

// ── State & manifest ─────────────────────────────────────────────────────

interface State {
  uploads: Record<string, { url: string; bytes: number }>;
  ids: Record<string, string>;
}

const host = new URL(API_BASE);
const STATE_PATH = path.join(WEB_DIR, `state.${host.hostname}_${host.port || (host.protocol === "https:" ? "443" : "80")}.json`);
let state: State = { uploads: {}, ids: {} };

async function loadState() {
  try {
    state = JSON.parse(await fs.readFile(STATE_PATH, "utf8"));
  } catch {
    state = { uploads: {}, ids: {} };
  }
}

async function saveState() {
  if (DRY_RUN) return;
  const tmp = `${STATE_PATH}.part`;
  await fs.writeFile(tmp, JSON.stringify(state, null, 2));
  await fs.rename(tmp, STATE_PATH);
}

let manifest = new Map<string, ManifestItem>();

async function loadManifest() {
  const raw = JSON.parse(await fs.readFile(path.join(WEB_DIR!, "manifest.json"), "utf8"));
  manifest = new Map((raw.items as ManifestItem[]).map((i) => [i.id, i]));
}

function need(id: string): ManifestItem {
  const item = manifest.get(id);
  if (!item) throw new Error(`Élément absent du manifeste : ${id} (relancer prepare_dri_media.py)`);
  return item;
}

// ── Uploads ──────────────────────────────────────────────────────────────

const MIME: Record<string, string> = {
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".pdf": "application/pdf",
};

const slug = (s: string) =>
  s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

async function headOk(url: string, bytes: number): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok && Number(res.headers.get("content-length")) === bytes;
  } catch {
    return false;
  }
}

async function ensureUpload(bucket: Bucket, owner: string, file: FileRef, nameHint: string): Promise<string> {
  const cacheKey = `${bucket}:${file.sha256}`;
  const cached = state.uploads[cacheKey];
  if (cached && (await headOk(cached.url, file.bytes))) {
    stats.reused++;
    return cached.url;
  }
  const ext = path.extname(file.out).toLowerCase();
  // The server prefixes a UUID; keeping the hash in the name ties the
  // stored key back to its source file.
  const fileName = `${slug(nameHint)}-${file.sha256.slice(0, 10)}${ext}`;
  stats.uploads++;
  if (DRY_RUN) {
    log(`  [simulation] envoi ${bucket}/${owner}/${fileName} (${(file.bytes / 1e6).toFixed(1)} Mo)`);
    return `${API_BASE}/api/storage/${bucket}/${owner}/${fileName}`;
  }
  const form = new FormData();
  form.append("owner", owner);
  form.append("file", await openAsBlob(path.join(WEB_DIR!, file.out), { type: MIME[ext] ?? "application/octet-stream" }), fileName);
  const res = await request<{ url: string; size: number }>("POST", `/api/storage/${bucket}/upload`, { form });
  const expectedPrefix = `${API_BASE}/api/storage/`;
  if (!res.url.startsWith(expectedPrefix)) {
    throw new Error(
      `URL de stockage inattendue « ${res.url} » (attendu : ${expectedPrefix}…). Vérifier STORAGE_PUBLIC_URL du serveur.`,
    );
  }
  if (res.size !== file.bytes) throw new Error(`Taille reçue ${res.size} ≠ ${file.bytes} pour ${file.out}`);
  state.uploads[cacheKey] = { url: res.url, bytes: file.bytes };
  await saveState();
  if (file.bytes > 5e6) log(`  ↑ ${file.out} (${(file.bytes / 1e6).toFixed(1)} Mo)`);
  return res.url;
}

// ── Upsert ───────────────────────────────────────────────────────────────

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

function same(want: unknown, have: unknown): boolean {
  if (want === null || want === undefined) return have === null || have === undefined || have === "";
  if (typeof want === "string" && DATE_ONLY.test(want) && typeof have === "string") return have.slice(0, 10) === want;
  if (typeof want === "number") return Number(have) === want;
  if (Array.isArray(want)) return JSON.stringify(want) === JSON.stringify(have ?? []);
  return want === have;
}

function diff(payload: Json, existing: Json): Json {
  const changes: Json = {};
  for (const [key, value] of Object.entries(payload)) {
    if (!same(value, existing[key])) changes[key] = value;
  }
  return changes;
}

async function upsert(
  label: string,
  route: string,
  stateKey: string,
  payload: Json,
  find: () => Promise<Json | null> | Json | null,
): Promise<string> {
  let existing: Json | null = null;
  const knownId = state.ids[stateKey];
  if (knownId) existing = await getOrNull(`${route}/${knownId}`);
  if (!existing) existing = await find();

  if (existing) {
    const id = String(existing.id);
    const changes = diff(payload, existing);
    if (Object.keys(changes).length === 0) {
      stats.unchanged++;
    } else {
      stats.patched++;
      log(`  ~ ${label} : ${Object.keys(changes).join(", ")}`);
      if (!DRY_RUN) await request("PATCH", `${route}/${id}`, { json: changes });
    }
    state.ids[stateKey] = id;
    await saveState();
    return id;
  }

  stats.created++;
  log(`  + ${label}`);
  if (DRY_RUN) return `simulation:${stateKey}`;
  const created = await request<Json>("POST", route, { json: payload });
  state.ids[stateKey] = String(created.id);
  await saveState();
  return String(created.id);
}

// ── Phases ───────────────────────────────────────────────────────────────

// Titles typed in the admin can carry stray spaces ("Taktouk à Nefta (Tozeur)  ").
const normTitle = (t: unknown) => String(t ?? "").normalize("NFC").replace(/\s+/g, " ").trim();

let governorateIds = new Map<string, string>();
const eventIds = new Map<StageKey, string>();
let eventsCache: Json[] | null = null;

async function existingEvents(): Promise<Json[]> {
  eventsCache ??= (await request<{ items: Json[] }>("GET", "/api/events")).items ?? [];
  return eventsCache;
}

function governorateId(name: string): string {
  const id = governorateIds.get(name);
  if (!id) throw new Error(`Gouvernorat introuvable en base : ${name}`);
  return id;
}

async function posterUrl(stage: StageKey) {
  return ensureUpload("documents", "events", need(`poster:${stage}`), `affiche-taktouk-${stage}`);
}

async function phaseEvents(write: boolean) {
  log(write ? "\n▶ Actions (carte interactive)" : "\n▶ Actions : résolution des identifiants");
  for (const s of STAGES) {
    const titles = [s.title, ...s.legacyTitles].map(normTitle);
    // By title first, else the Taktouk event already on this governorate
    // (admins typed e.g. "Taktouk à Beja" without the accent).
    const find = async () => {
      const events = await existingEvents();
      return (
        events.find((e) => titles.includes(normTitle(e.title))) ??
        events.find(
          (e) => (e.governorate as Json | null)?.name === s.governorate && /taktouk/i.test(String(e.title)),
        ) ??
        null
      );
    };
    if (!write) {
      const known = state.ids[`event:${s.key}`];
      const found = known ? await getOrNull(`/api/events/${known}`) : await find();
      if (!found) throw new Error(`Action « ${s.title} » introuvable : lancer la phase events d'abord`);
      eventIds.set(s.key, String(found.id));
      continue;
    }
    const payload: Json = {
      title: s.title,
      title_ar: s.titleAr,
      description: s.description,
      description_ar: s.descriptionAr,
      type: "action_realisee",
      governorate_id: governorateId(s.governorate),
      event_date: s.start,
      people_impacted: s.peopleImpacted,
      available_places: null,
      registration_enabled: false,
      images: [await posterUrl(s.key)],
      latitude: s.latitude,
      longitude: s.longitude,
      status: "published",
    };
    eventIds.set(s.key, await upsert(`action ${s.title}`, "/api/events", `event:${s.key}`, payload, find));
  }
}

function albumPhotos(albumKey: string): ManifestItem[] {
  return [...manifest.values()]
    .filter((i) => i.kind === "photo" && i.group === albumKey)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.out.localeCompare(b.out));
}

async function photoUrl(item: ManifestItem, albumKey: string) {
  const stem = item.id.split("__").pop()!;
  return ensureUpload("album-photos", "photos", item, `${albumKey}-${stem}`);
}

async function phaseAlbums() {
  log("\n▶ Albums photos");
  const existingAlbums = await list("/api/photo-albums");
  // The public page lists the newest first: create in reverse display order.
  for (const album of [...ALBUMS].reverse()) {
    const photos = albumPhotos(album.key);
    if (photos.length === 0) throw new Error(`Aucune photo dans le manifeste pour l'album ${album.key}`);
    const cover = photos.find((p) => p.id.endsWith(`__${album.cover}`));
    if (!cover) throw new Error(`Couverture ${album.cover} introuvable dans l'album ${album.key}`);
    // Cover first: it also opens the photo strip on the map's event card.
    const ordered = [cover, ...photos.filter((p) => p !== cover)];
    const urls: string[] = [];
    for (const photo of ordered) urls.push(await photoUrl(photo, album.key));
    const stage = STAGES.find((s) => s.key === album.stage)!;
    const payload: Json = {
      title: album.title,
      title_ar: album.titleAr,
      description: album.description,
      description_ar: album.descriptionAr,
      date: album.date,
      location: album.location,
      location_ar: album.locationAr,
      governorate: stage.governorate,
      category: album.category,
      cover_image_url: urls[0],
      photo_urls: urls,
      photo_count: urls.length,
      featured: album.featured,
      published: true,
      event_id: eventIds.get(album.stage) ?? null,
    };
    const titles = [album.title, ...(album.legacyTitles ?? [])].map(normTitle);
    await upsert(`album ${album.title} (${urls.length} photos)`, "/api/photo-albums", `album:${album.key}`, payload, () =>
      existingAlbums.find((a) => titles.includes(normTitle(a.title))) ?? null,
    );
  }
}

const YOUTUBE_ID =
  /(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([\w-]{11})/i;

async function phaseMedia() {
  log("\n▶ Médiathèque (vidéos YouTube)");
  let pending = 0;
  for (const v of [...VIDEOS].reverse()) {
    const link = YOUTUBE_LINKS[v.id]?.trim();
    if (!link) {
      pending++;
      continue;
    }
    const youTubeId = link.match(YOUTUBE_ID)?.[1];
    if (!youTubeId) throw new Error(`Lien YouTube invalide pour ${v.id} : ${link}`);
    const payload: Json = {
      title: v.title,
      title_ar: v.titleAr,
      description: v.description,
      description_ar: v.descriptionAr,
      type: "Vidéo",
      category: v.categoryLabel,
      category_id: v.categoryId,
      governorate: v.governorate,
      // Shorts keep their URL so the player shows them vertically.
      video_url: /\/shorts\//i.test(link) ? link : `https://www.youtube.com/watch?v=${youTubeId}`,
      thumbnail_url: `https://i.ytimg.com/vi/${youTubeId}/hqdefault.jpg`,
      featured: v.featured,
      published: true,
    };
    await upsert(`vidéo ${v.title}`, "/api/media-items", `media:${v.id}`, payload, async () =>
      (await list("/api/media-items", { title: v.title }))[0] ?? null,
    );
  }
  if (pending) log(`  ${pending}/${VIDEOS.length} vidéo(s) en attente de leur lien YouTube (YOUTUBE_LINKS dans dri-videos.ts)`);
}

async function phaseNews() {
  log("\n▶ Actualités (section accès aux droits)");
  for (const n of NEWS) {
    let imageUrl: string;
    if (n.stage) {
      imageUrl = await posterUrl(n.stage);
    } else {
      const photo = albumPhotos(n.imagePhoto!.album).find((p) => p.id.endsWith(`__${n.imagePhoto!.stem}`));
      if (!photo) throw new Error(`Photo ${n.imagePhoto!.stem} introuvable pour l'actualité « ${n.title} »`);
      imageUrl = await photoUrl(photo, n.imagePhoto!.album);
    }
    const payload: Json = {
      title: n.title,
      title_ar: n.titleAr,
      excerpt: n.excerpt,
      excerpt_ar: n.excerptAr,
      content: n.content,
      content_ar: n.contentAr,
      category: n.category,
      tags: n.tags,
      tags_ar: n.tagsAr,
      image_url: imageUrl,
      is_published: true,
      is_featured: n.featured,
      read_time: n.stage ? 2 : 3,
      section: "acces_droits",
      published_at: n.publishedAt,
    };
    await upsert(`actualité ${n.title}`, "/api/news", `news:${n.stage ?? "bilan"}`, payload, async () =>
      (await list("/api/news", { title: n.title, section: "acces_droits" }))[0] ?? null,
    );
  }
}

async function phaseResources() {
  log("\n▶ Ressources pratiques");
  for (const r of RESOURCES) {
    const item = need(r.doc);
    const fileUrl = await ensureUpload("documents", "resources", item, r.title);
    const payload: Json = {
      title: r.title,
      title_ar: r.titleAr,
      description: r.description,
      description_ar: r.descriptionAr,
      file_url: fileUrl,
      file_size: item.bytes,
      file_type: "application/pdf",
      category: r.category,
      category_ar: r.categoryAr,
      display_order: r.displayOrder,
      is_published: true,
    };
    await upsert(`ressource ${r.title}`, "/api/practical-resources", `resource:${r.doc}`, payload, async () =>
      (await list("/api/practical-resources", { title: r.title }))[0] ?? null,
    );
  }
}

async function phaseAddresses() {
  log("\n▶ Adresses utiles");
  const digits = (s: unknown) => String(s ?? "").replace(/\D/g, "");
  const existing = await list("/api/useful-addresses");
  for (const a of ADDRESSES) {
    const payload: Json = {
      name: a.name,
      name_ar: a.nameAr,
      address: a.address,
      address_ar: a.addressAr,
      phone: a.phone,
      email: a.email,
      category: a.category,
      category_ar: a.categoryAr,
      governorate_id: governorateId(a.governorate),
      is_published: true,
    };
    await upsert(`adresse ${a.name}`, "/api/useful-addresses", `address:${digits(a.phone)}`, payload, () =>
      existing.find((e) => digits(e.phone) === digits(a.phone)) ?? null,
    );
  }
}

async function phaseTraining() {
  log("\n▶ Connaissances de l'assistant");
  for (const [i, d] of TRAINING_DOCS.entries()) {
    if (d.content.length > 8000) log(`  ⚠ « ${d.title} » fait ${d.content.length} caractères (> 8000)`);
    const payload: Json = { title: d.title, title_ar: d.titleAr, content: d.content, category: d.category, is_active: true };
    await upsert(`document ${d.title}`, "/api/chatbot-training-documents", `training:${i}`, payload, async () =>
      (await list("/api/chatbot-training-documents", { title: d.title }))[0] ?? null,
    );
  }
}

async function phaseEmbeddings(isAdmin: boolean) {
  log("\n▶ Embeddings de l'assistant");
  if (!isAdmin) {
    log("  ⚠ le compte n'a pas le rôle admin : POST /api/fn/refresh-aad-embeddings ignoré");
    return;
  }
  if (DRY_RUN) {
    log("  [simulation] POST /api/fn/refresh-aad-embeddings");
    return;
  }
  const res = await request<Json>("POST", "/api/fn/refresh-aad-embeddings", { json: {} });
  log(`  ${JSON.stringify(res.summary ?? res)}`);
}

// ── Verification ─────────────────────────────────────────────────────────

async function verify() {
  log("\n▶ Vérification des fichiers publiés");
  const urls = new Set<string>();
  // Only our own storage: YouTube links and thumbnails are not checked.
  const add = (u: unknown) => typeof u === "string" && u.startsWith(`${API_BASE}/api/storage/`) && urls.add(u);
  const events = (await request<{ items: Json[] }>("GET", "/api/events")).items;
  const ours = events.filter((e) => STAGES.some((s) => s.title === e.title));
  ours.forEach((e) => (e.images as string[]).forEach(add));
  for (const album of await list("/api/photo-albums")) {
    if (!ALBUMS.some((a) => a.title === album.title)) continue;
    add(album.cover_image_url);
    (album.photo_urls as string[]).forEach(add);
  }
  const videos = (await list("/api/media-items")).filter((m) => VIDEOS.some((v) => v.title === m.title));
  const news = (await list("/api/news", { section: "acces_droits" })).filter((n) => NEWS.some((x) => x.title === n.title));
  news.forEach((n) => add(n.image_url));
  const resources = (await list("/api/practical-resources")).filter((r) => RESOURCES.some((x) => x.title === r.title));
  resources.forEach((r) => add(r.file_url));

  let bad = 0;
  for (const url of urls) {
    const res = await fetch(url, { method: "HEAD" }).catch(() => null);
    const type = res?.headers.get("content-type") ?? "";
    if (!res?.ok || !/^(image\/webp|application\/pdf)/.test(type)) {
      bad++;
      log(`  ✗ ${res?.status ?? "réseau"} ${type} ${url}`);
    }
  }
  const people = ours.reduce((sum, e) => sum + Number(e.people_impacted ?? 0), 0);
  log(
    `  actions ${ours.length}/${STAGES.length} (personnes : ${people}), albums ${ALBUMS.length}, vidéos ${videos.length}/${VIDEOS.length}, actualités ${news.length}/${NEWS.length}, ressources ${resources.length}/${RESOURCES.length}`,
  );
  log(`  ${urls.size - bad}/${urls.size} fichiers accessibles`);
  if (bad) process.exitCode = 1;
}

// ── Main ─────────────────────────────────────────────────────────────────

async function main() {
  const isLocal = ["localhost", "127.0.0.1"].includes(host.hostname);
  const email = process.env.DRI_API_EMAIL ?? (isLocal ? process.env.SEED_ADMIN_EMAIL : undefined);
  const password = process.env.DRI_API_PASSWORD ?? (isLocal ? process.env.SEED_ADMIN_PASSWORD : undefined);
  if (!email || !password) throw new Error("Identifiants manquants : DRI_API_EMAIL / DRI_API_PASSWORD");

  log(`Cible : ${API_BASE}${cli.resolve ? ` via ${cli.resolve}` : ""}${DRY_RUN ? " (simulation, aucune écriture)" : ""}`);
  // (No /health check: in production nginx only proxies /api/.)
  const login = await request<{ token: string; user: { roles: string[] } }>("POST", "/api/auth/login", {
    json: { email, password },
  });
  token = login.token;
  const roles = login.user.roles ?? [];
  if (!roles.some((r) => r === "admin" || r === "admin_acces_droits")) {
    throw new Error(`Le compte ${email} n'a ni le rôle admin ni admin_acces_droits`);
  }
  // A stale Prisma client makes these two return 500: fail before writing.
  await request("GET", "/api/events");
  await request("GET", "/api/photo-albums?limit=1");

  await loadManifest();
  await loadState();
  governorateIds = new Map((await list("/api/governorates")).map((g) => [String(g.name), String(g.id)]));
  for (const name of new Set([...STAGES.map((s) => s.governorate), ...ADDRESSES.map((a) => a.governorate)])) {
    governorateId(name);
  }

  if (ONLY.has("events")) await phaseEvents(true);
  else if (ONLY.has("albums")) await phaseEvents(false);
  if (ONLY.has("albums")) await phaseAlbums();
  if (ONLY.has("media")) await phaseMedia();
  if (ONLY.has("news")) await phaseNews();
  if (ONLY.has("resources")) await phaseResources();
  if (ONLY.has("addresses")) await phaseAddresses();
  if (ONLY.has("training")) await phaseTraining();
  if (ONLY.has("embeddings")) await phaseEmbeddings(roles.includes("admin"));

  log(
    `\nBilan : ${stats.uploads} envoi(s), ${stats.reused} fichier(s) déjà en ligne, ${stats.created} création(s), ${stats.patched} mise(s) à jour, ${stats.unchanged} inchangé(s)`,
  );
  if (VERIFY && !DRY_RUN) await verify();
}

main().catch((err) => {
  console.error(`\n✗ ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
