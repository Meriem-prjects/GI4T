#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Prépare les médias de la campagne DRI pour la section « Accès aux droits ».

Lit les zips Google Drive du dossier source membre par membre (sans tout
extraire : le disque de dev est presque plein) et écrit dans <src>/_web :

  photos/<album>/<theme>__<nom>.webp   photos d'albums, EXIF/GPS retirés
  posters/<etape>.webp                 affiches d'annonce par étape
  videos/<groupe>/<nom>.mp4            H.264/AAC, côté long 1280, ≤ 90 Mo, +faststart
  videos/<groupe>/<nom>.webp           vignette 1280x720 (fond flouté si verticale)
  docs/…                               guide citoyen PDF + planche BD (webp + pdf)
  contact/…                            planches-contact pour choisir couvertures/titres
  manifest.json                        inventaire lu par publish-dri-content.ts

Relançable : un élément déjà présent dans le manifeste (et sur disque) est sauté.
Chaque fichier est écrit en .part puis renommé, les temporaires vont dans <src>/_tmp.

Les vidéos du site sont hébergées sur YouTube : l'étape « videos » (transcodage
local) n'est plus lancée par défaut, seulement avec --only ...,videos.

Prérequis : Python 3.7+, Pillow (WebP), PyMuPDF, ffmpeg/ffprobe dans le PATH.

Usage :
  py backend/scripts/dri/prepare_dri_media.py --src "C:\\Users\\<moi>\\Desktop\\DRI"
  py backend/scripts/dri/prepare_dri_media.py --src ... --only docs,posters,photos
"""
import argparse
import glob
import hashlib
import io
import json
import os
import re
import shutil
import struct
import subprocess
import sys
import time
import unicodedata
import zipfile

from PIL import Image, ImageDraw, ImageOps

# nginx (client_max_body_size 100M) et multer (MAX_FILE_SIZE_MB=100) bloquent
# au-delà de 100 Mo : on garde de la marge.
MAX_VIDEO_BYTES = 90 * 1000 * 1000
VIDEO_LONG_SIDE = 1280
PHOTO_LONG_SIDE = 1600
POSTER_LONG_SIDE = 1200
MIN_PHOTO_LONG_SIDE = 1000

CAMPAIGN_ROOT = "campagne terrain - cinematdour"

# Dossier de région du zip (normalisé) -> clé d'étape
REGIONS = {
    "mahdia": "mahdia",
    "hay ettadhamen": "ettadhamen",
    "nefta": "nefta",
    "zaghouan": "zaghouan",
    "djerba": "djerba",
    "mareth": "mareth",
    "el kef": "kef",
    "beja": "beja",
}

# Fichier d'affiche (normalisé, sans extension) -> clé d'étape
POSTERS = {
    "annonce el kef": "kef",
    "annonce beja": "beja",
    "annonce mareth": "mareth",
    "annonce zaghouan": "zaghouan",
    "annonce mahdia": "mahdia",
    "annonce nefta": "nefta",
    "annonce cite ettadhamon tunis": "ettadhamen",
    "taktouk annonce djerba": "djerba",
}

# Ordre d'affichage des thèmes dans un album
THEME_ORDER = [
    "projections-et-spots",
    "meditateurs-et-distributions-supports",
    "debats-et-consultations-experts",
    "performance-artistique",
    "formation-benevoles",
    "photos",
]

# Doublons exacts entre dossiers : l'EXIF montre à quelle étape ils appartiennent.
DUP_PREFERRED_ALBUMS = ["ettadhamen", "chebba"]

PHOTO_EXT = (".jpg", ".jpeg", ".png", ".heic")
VIDEO_EXT = (".mp4", ".mov")


# ── utilitaires ──────────────────────────────────────────────────────────

def log(msg):
    print("[%s] %s" % (time.strftime("%H:%M:%S"), msg), flush=True)


def norm(s):
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = s.replace("\u2019", "'")
    return re.sub(r"\s+", " ", s).strip().lower()


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", norm(s)).strip("-")


def sha256_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def run(cmd, check=True):
    p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if check and p.returncode != 0:
        tail = p.stderr.decode("utf-8", "replace")[-1500:]
        raise RuntimeError("commande en échec (%s) : %s\n%s" % (p.returncode, " ".join(cmd[:6]), tail))
    return p


def mmss(seconds):
    s = int(round(seconds))
    return "%d:%02d" % (s // 60, s % 60)


class Manifest:
    def __init__(self, out_dir):
        self.path = os.path.join(out_dir, "manifest.json")
        self.out_dir = out_dir
        self.items = {}
        self.skipped = {}
        if os.path.exists(self.path):
            with open(self.path, encoding="utf-8") as f:
                data = json.load(f)
            self.items = {i["id"]: i for i in data.get("items", [])}
            self.skipped = {s["src"]: s for s in data.get("skipped", [])}

    def done(self, item_id):
        item = self.items.get(item_id)
        return bool(item) and os.path.exists(os.path.join(self.out_dir, item["out"]))

    def add(self, item):
        self.items[item["id"]] = item
        self.skipped.pop(item.get("src", {}).get("member", ""), None)
        self.save()

    def skip(self, src, reason):
        self.skipped[src] = {"src": src, "reason": reason}
        log("  ignoré : %s — %s" % (src, reason))
        self.save()

    def save(self):
        data = {
            "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%S"),
            "items": sorted(self.items.values(), key=lambda i: i["id"]),
            "skipped": sorted(self.skipped.values(), key=lambda s: s["src"]),
        }
        tmp = self.path + ".part"
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        os.replace(tmp, self.path)


# ── images ───────────────────────────────────────────────────────────────

def open_image(data):
    im = Image.open(io.BytesIO(data))
    orig = im.size
    if im.format == "JPEG":
        im.draft("RGB", (PHOTO_LONG_SIDE, PHOTO_LONG_SIDE))
    try:
        im = ImageOps.exif_transpose(im)
    except Exception:
        pass
    if im.mode != "RGB":
        if im.mode in ("RGBA", "LA", "P"):
            im = im.convert("RGBA")
            bg = Image.new("RGB", im.size, (255, 255, 255))
            bg.paste(im, mask=im.split()[-1])
            im = bg
        else:
            im = im.convert("RGB")
    return im, orig


def save_webp(im, dst, long_side, quality):
    im = im.copy()
    im.thumbnail((long_side, long_side), Image.Resampling.LANCZOS)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    tmp = dst + ".part"
    # Pas de paramètre exif= : les métadonnées (GPS compris) ne sont pas recopiées.
    im.save(tmp, "WEBP", quality=quality, method=6)
    os.replace(tmp, dst)
    return im.size


def image_item(item_id, kind, group, src, out_dir, rel, size, extra=None):
    path = os.path.join(out_dir, rel)
    item = {
        "id": item_id,
        "kind": kind,
        "group": group,
        "src": src,
        "out": rel.replace("\\", "/"),
        "sha256": sha256_file(path),
        "bytes": os.path.getsize(path),
        "w": size[0],
        "h": size[1],
    }
    if extra:
        item.update(extra)
    return item


# ── vidéos ───────────────────────────────────────────────────────────────

def probe(path):
    p = run([
        "ffprobe", "-v", "error",
        "-show_entries", "format=duration:stream=codec_type,codec_name,width,height,color_transfer",
        "-of", "json", path,
    ])
    data = json.loads(p.stdout.decode("utf-8") or "{}")
    duration = float(data.get("format", {}).get("duration") or 0)
    video = next((s for s in data.get("streams", []) if s.get("codec_type") == "video"), {})
    return duration, video


def moov_before_mdat(path):
    with open(path, "rb") as f:
        while True:
            header = f.read(8)
            if len(header) < 8:
                return False
            size, box = struct.unpack(">I4s", header)
            header_len = 8
            if size == 1:
                size = struct.unpack(">Q", f.read(8))[0]
                header_len = 16
            if box == b"moov":
                return True
            if box == b"mdat" or size == 0:
                return False
            f.seek(size - header_len, 1)


def video_filters(hdr):
    chain = []
    if hdr:
        chain.append(
            "zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,"
            "tonemap=tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv"
        )
    # Côté long ramené à 1280 (portrait comme paysage), dimensions paires.
    chain.append(
        "scale=w='if(gte(iw,ih),trunc(min({L},iw)/2)*2,-2)'"
        ":h='if(gte(iw,ih),-2,trunc(min({L},ih)/2)*2)':flags=lanczos".format(L=VIDEO_LONG_SIDE)
    )
    chain.append("format=yuv420p")
    return ",".join(chain)


def transcode(src, dst, duration, tune, hdr, tmp_dir):
    budget_kbps = MAX_VIDEO_BYTES * 8 / duration / 1000
    maxrate = int(min(4500, 0.92 * budget_kbps - 128))
    common = [
        "ffmpeg", "-hide_banner", "-nostdin", "-y", "-i", src,
        "-map", "0:v:0", "-map", "0:a:0?", "-map_metadata", "-1", "-map_chapters", "-1",
        "-dn", "-sn", "-vf", video_filters(hdr), "-fpsmax", "30",
        "-c:v", "libx264", "-preset", "medium", "-profile:v", "high",
    ]
    if tune:
        common += ["-tune", tune]
    if hdr:
        common += ["-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709"]
    audio = ["-c:a", "aac", "-b:a", "128k", "-ac", "2"]
    part = dst + ".part"
    run(common + ["-crf", "23", "-maxrate", "%dk" % maxrate, "-bufsize", "%dk" % (2 * maxrate)]
        + audio + ["-movflags", "+faststart", "-f", "mp4", part])
    if os.path.getsize(part) > MAX_VIDEO_BYTES:
        bitrate = int(0.95 * budget_kbps - 128)
        log("  > %d Mo, ré-encodage en 2 passes à %dk" % (os.path.getsize(part) // 10 ** 6, bitrate))
        passlog = os.path.join(tmp_dir, "x264pass")
        run(common + ["-b:v", "%dk" % bitrate, "-pass", "1", "-passlogfile", passlog, "-an", "-f", "null", "NUL"])
        run(common + ["-b:v", "%dk" % bitrate, "-pass", "2", "-passlogfile", passlog]
            + audio + ["-movflags", "+faststart", "-f", "mp4", part])
        for f in glob.glob(passlog + "*"):
            os.remove(f)
    if os.path.getsize(part) > MAX_VIDEO_BYTES:
        raise RuntimeError("toujours au-dessus de 90 Mo après 2 passes")
    out_duration, out_video = probe(part)
    if abs(out_duration - duration) > max(1.0, 0.01 * duration):
        raise RuntimeError("durée incohérente : source %.1fs, sortie %.1fs" % (duration, out_duration))
    if not moov_before_mdat(part):
        raise RuntimeError("index moov absent du début du fichier")
    os.replace(part, dst)
    return out_duration, out_video


def frame_png(mp4, t, width):
    p = run([
        "ffmpeg", "-hide_banner", "-nostdin", "-ss", "%.2f" % t, "-i", mp4, "-frames:v", "1",
        "-vf", "scale=%d:-2" % width, "-f", "image2pipe", "-c:v", "png", "-",
    ])
    return Image.open(io.BytesIO(p.stdout)).convert("RGB")


def make_thumbnail(mp4, dst, t):
    graph = (
        "[0:v]thumbnail=48,split[a][b];"
        "[a]scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,"
        "gblur=sigma=24,eq=brightness=-0.06[bg];"
        "[b]scale=1280:720:force_original_aspect_ratio=decrease[fg];"
        "[bg][fg]overlay=(W-w)/2:(H-h)/2,format=yuv420p"
    )
    part = dst + ".part"
    run([
        "ffmpeg", "-hide_banner", "-nostdin", "-y", "-ss", "%.2f" % t, "-i", mp4,
        "-filter_complex", graph, "-frames:v", "1", "-c:v", "libwebp", "-quality", "82",
        "-f", "webp", part,
    ])
    os.replace(part, dst)


def video_contact(mp4, duration, dst):
    frames = [frame_png(mp4, duration * r, 320) for r in (0.1, 0.35, 0.6, 0.85)]
    h = max(f.size[1] for f in frames)
    sheet = Image.new("RGB", (sum(f.size[0] for f in frames) + 30, h + 10), (30, 30, 30))
    x = 5
    for f in frames:
        sheet.paste(f, (x, 5))
        x += f.size[0] + 7
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    sheet.save(dst, "JPEG", quality=80)


# ── étapes ───────────────────────────────────────────────────────────────

def zips(src, pattern):
    return sorted(glob.glob(os.path.join(src, pattern)))


def campaign_location(member):
    """Retourne (étape, album, thème) pour un membre du zip campagne."""
    parts = member.split("/")
    if len(parts) < 3 or norm(parts[0]) != CAMPAIGN_ROOT:
        return None
    region = REGIONS.get(norm(parts[1]))
    if not region:
        return None
    dirs = [p.strip() for p in parts[2:-1]]
    joined = norm(" / ".join(dirs))
    album = region
    if region == "mahdia":
        album = "chebba" if "chebba" in joined else "mahdia"
    elif region == "djerba":
        album = "djerba-formation" if "formation" in joined else "djerba"
    theme = slug(dirs[-1]) if dirs else "photos"
    if theme not in THEME_ORDER:
        theme = "photos"
    return region, album, theme


def step_docs(args, manifest):
    log("Documents")
    for z in zips(args.src, "guide citoyen-*.zip"):
        zf = zipfile.ZipFile(z)
        for info in zf.infolist():
            if not info.filename.lower().endswith(".pdf"):
                continue
            src = {"zip": os.path.basename(z), "member": info.filename}
            if not manifest.done("doc:guide-pdf"):
                rel = "docs/guide-citoyen-justice-administrative.pdf"
                dst = os.path.join(args.out, rel)
                os.makedirs(os.path.dirname(dst), exist_ok=True)
                with zf.open(info) as fsrc, open(dst + ".part", "wb") as fdst:
                    shutil.copyfileobj(fsrc, fdst, 1 << 20)
                os.replace(dst + ".part", dst)
                import fitz
                pages = fitz.open(dst).page_count
                manifest.add(image_item("doc:guide-pdf", "doc", "docs", src, args.out, rel, (0, 0), {"pages": pages}))
            if not manifest.done("doc:guide-cover"):
                import fitz
                doc = fitz.open(os.path.join(args.out, "docs/guide-citoyen-justice-administrative.pdf"))
                pix = doc[0].get_pixmap(matrix=fitz.Matrix(2, 2))
                im = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
                rel = "docs/guide-citoyen-couverture.webp"
                size = save_webp(im, os.path.join(args.out, rel), 900, 85)
                manifest.add(image_item("doc:guide-cover", "doc", "docs", src, args.out, rel, size))
    planche = os.path.join(args.src, "planche 02_Plan de travail 1.jpg")
    if os.path.exists(planche):
        src = {"zip": None, "member": os.path.basename(planche)}
        with open(planche, "rb") as f:
            data = f.read()
        im, _ = open_image(data)
        if not manifest.done("doc:planche-webp"):
            rel = "docs/planche-bd-refere-suspension.webp"
            size = save_webp(im, os.path.join(args.out, rel), 1600, 88)
            manifest.add(image_item("doc:planche-webp", "doc", "docs", src, args.out, rel, size))
        if not manifest.done("doc:planche-pdf"):
            rel = "docs/planche-bd-refere-suspension.pdf"
            dst = os.path.join(args.out, rel)
            im.save(dst + ".part", "PDF", resolution=150)
            os.replace(dst + ".part", dst)
            manifest.add(image_item("doc:planche-pdf", "doc", "docs", src, args.out, rel, im.size))


def step_posters(args, manifest):
    log("Affiches")
    for z in zips(args.src, "Photos Annonce par r*.zip"):
        zf = zipfile.ZipFile(z)
        for info in zf.infolist():
            stem = os.path.splitext(os.path.basename(info.filename))[0]
            region = POSTERS.get(norm(stem))
            if not region:
                if not info.is_dir():
                    manifest.skip(info.filename, "affiche non reconnue")
                continue
            item_id = "poster:%s" % region
            if manifest.done(item_id):
                continue
            im, orig = open_image(zf.read(info))
            rel = "posters/%s.webp" % region
            size = save_webp(im, os.path.join(args.out, rel), POSTER_LONG_SIDE, 85)
            src = {"zip": os.path.basename(z), "member": info.filename}
            manifest.add(image_item(item_id, "poster", region, src, args.out, rel, size))
            log("  affiche %s (%dx%d)" % (region, size[0], size[1]))


def step_photos(args, manifest):
    log("Photos de campagne")
    members = []
    for z in zips(args.src, "Campagne terrain*.zip"):
        for info in zipfile.ZipFile(z).infolist():
            name = info.filename
            if info.is_dir() or not name.lower().endswith(PHOTO_EXT):
                continue
            loc = campaign_location(name)
            if not loc:
                manifest.skip(name, "emplacement inconnu")
                continue
            members.append((z, info, loc))

    # Doublons exacts (CRC + taille) : on garde la copie de l'album préféré.
    groups = {}
    for m in members:
        groups.setdefault((m[1].CRC, m[1].file_size), []).append(m)
    dropped = set()
    for group in groups.values():
        if len(group) < 2:
            continue
        keeper = group[0]
        for album in DUP_PREFERRED_ALBUMS:
            match = [m for m in group if m[2][1] == album]
            if match:
                keeper = match[0]
                break
        for m in group:
            if m is not keeper:
                dropped.add(m[1].filename)
                manifest.skip(m[1].filename, "doublon de %s" % keeper[1].filename)

    stems = set()
    for _, info, loc in members:
        if not info.filename.lower().endswith(".heic"):
            stems.add((loc[1], os.path.splitext(os.path.basename(info.filename))[0].lower()))

    by_zip = {}
    for z, info, loc in members:
        by_zip.setdefault(z, []).append((info, loc))
    for z, entries in by_zip.items():
        zf = zipfile.ZipFile(z)
        for info, (region, album, theme) in entries:
            name = info.filename
            base = os.path.basename(name)
            stem, ext = os.path.splitext(base)
            if name in dropped:
                continue
            if norm(base).startswith("capture d"):
                manifest.skip(name, "capture d'écran")
                continue
            if norm(base).startswith("artboard"):
                manifest.skip(name, "visuel graphique, pas une photo de terrain")
                continue
            item_id = "photo:%s:%s__%s" % (album, theme, slug(stem))
            if manifest.done(item_id):
                continue
            src = {"zip": os.path.basename(z), "member": name}
            try:
                if ext.lower() == ".heic":
                    if (album, stem.lower()) in stems:
                        manifest.skip(name, "jumeau JPG conservé")
                        continue
                    data = heic_to_png(zf, info, args.tmp)
                    if data is None:
                        manifest.skip(name, "HEIC non décodable par ffmpeg")
                        continue
                else:
                    data = zf.read(info)
                im, orig = open_image(data)
                if max(orig) < MIN_PHOTO_LONG_SIDE:
                    manifest.skip(name, "basse résolution (%dx%d)" % orig)
                    continue
                rel = "photos/%s/%s__%s.webp" % (album, theme, slug(stem))
                size = save_webp(im, os.path.join(args.out, rel), PHOTO_LONG_SIDE, 80)
                manifest.add(image_item(item_id, "photo", album, src, args.out, rel, size,
                                        {"region": region, "theme": theme,
                                         "order": THEME_ORDER.index(theme)}))
                log("  %s/%s (%dx%d)" % (album, base, size[0], size[1]))
            except Exception as e:  # noqa: BLE001 — on continue avec les autres photos
                manifest.skip(name, "erreur : %s" % e)


def heic_to_png(zf, info, tmp_dir):
    os.makedirs(tmp_dir, exist_ok=True)
    src = os.path.join(tmp_dir, "photo.heic")
    dst = os.path.join(tmp_dir, "photo.png")
    with zf.open(info) as fsrc, open(src, "wb") as fdst:
        shutil.copyfileobj(fsrc, fdst, 1 << 20)
    try:
        p = run(["ffmpeg", "-hide_banner", "-nostdin", "-y", "-i", src, "-frames:v", "1", dst], check=False)
        if p.returncode != 0 or not os.path.exists(dst):
            return None
        with open(dst, "rb") as f:
            data = f.read()
        if min(Image.open(io.BytesIO(data)).size) < MIN_PHOTO_LONG_SIDE:
            return None  # une seule tuile décodée
        return data
    finally:
        for f in (src, dst):
            if os.path.exists(f):
                os.remove(f)


def album_contacts(args, manifest):
    log("Planches-contact des albums")
    albums = {}
    for item in manifest.items.values():
        if item["kind"] == "photo":
            albums.setdefault(item["group"], []).append(item)
    for album, items in albums.items():
        items.sort(key=lambda i: (i["order"], i["out"]))
        cols, tw, th = 6, 260, 190
        rows = (len(items) + cols - 1) // cols
        sheet = Image.new("RGB", (cols * tw, rows * th), (25, 25, 25))
        draw = ImageDraw.Draw(sheet)
        for n, item in enumerate(items):
            im = Image.open(os.path.join(args.out, item["out"]))
            im.thumbnail((tw - 8, th - 26))
            x, y = (n % cols) * tw, (n // cols) * th
            sheet.paste(im, (x + 4, y + 4))
            label = item["out"].rsplit("__", 1)[-1].replace(".webp", "")
            draw.text((x + 6, y + th - 20), "%d %s" % (n + 1, label), fill=(255, 255, 0))
        dst = os.path.join(args.out, "contact", "album-%s.jpg" % album)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        sheet.save(dst, "JPEG", quality=82)
        log("  %s : %d photos" % (album, len(items)))


def video_sources(args):
    """Liste (zip, membre, groupe, étape) de toutes les vidéos, zip imbriqué compris."""
    out = []
    for z in zips(args.src, "Campagne terrain*.zip"):
        for info in zipfile.ZipFile(z).infolist():
            if info.filename.lower().endswith(VIDEO_EXT):
                loc = campaign_location(info.filename)
                if loc:
                    out.append((z, info.filename, loc[0], loc[0]))
    for pattern, group in (("Vid*os Fiction*.zip", "fiction"), ("Vid*os taktouk 2D*.zip", "taktouk")):
        for z in zips(args.src, pattern):
            for info in zipfile.ZipFile(z).infolist():
                low = info.filename.lower()
                if low.endswith(VIDEO_EXT):
                    out.append((z, info.filename, group, None))
                elif low.endswith(".zip"):
                    out.append((z, info.filename, group, "nested"))
    return out


def step_videos(args, manifest):
    log("Vidéos")
    os.makedirs(args.tmp, exist_ok=True)
    count = 0
    for z, member, group, region in video_sources(args):
        if region == "nested":
            count += nested_videos(args, manifest, z, member, group)
            continue
        if args.limit_videos and count >= args.limit_videos:
            break
        stem = os.path.splitext(os.path.basename(member))[0]
        item_id = "video:%s:%s" % (group, slug(stem))
        if manifest.done(item_id):
            continue
        zf = zipfile.ZipFile(z)
        process_video(args, manifest, item_id, group, region,
                      {"zip": os.path.basename(z), "member": member},
                      lambda dst: extract(zf, member, dst))
        count += 1


def nested_videos(args, manifest, z, member, group):
    inner_zip = os.path.join(args.tmp, "nested.zip")
    count = 0
    try:
        with zipfile.ZipFile(z) as outer:
            names = []
            log("  extraction du zip imbriqué %s" % os.path.basename(member))
            extract(outer, member, inner_zip)
            inner = zipfile.ZipFile(inner_zip)
            for info in inner.infolist():
                if not info.filename.lower().endswith(VIDEO_EXT):
                    continue
                stem = os.path.splitext(os.path.basename(info.filename))[0]
                item_id = "video:%s:%s" % (group, slug(stem))
                if manifest.done(item_id):
                    continue
                names.append((item_id, info.filename))
            for item_id, name in names:
                process_video(args, manifest, item_id, group, None,
                              {"zip": os.path.basename(z), "member": member + "!" + name},
                              lambda dst, n=name: extract(inner, n, dst))
                count += 1
            inner.close()
    finally:
        if os.path.exists(inner_zip):
            os.remove(inner_zip)
    return count


def extract(zf, member, dst):
    with zf.open(member) as fsrc, open(dst, "wb") as fdst:
        shutil.copyfileobj(fsrc, fdst, 16 << 20)


def process_video(args, manifest, item_id, group, region, src, extract_to):
    name = item_id.split(":")[-1]
    tmp_src = os.path.join(args.tmp, "source" + os.path.splitext(src["member"])[1].lower())
    rel = "videos/%s/%s.mp4" % (group, name)
    rel_thumb = "videos/%s/%s.webp" % (group, name)
    dst = os.path.join(args.out, rel)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    started = time.time()
    try:
        log("  %s : extraction" % src["member"])
        extract_to(tmp_src)
        duration, video = probe(tmp_src)
        if duration <= 0:
            raise RuntimeError("durée illisible")
        hdr = video.get("color_transfer") in ("arib-std-b67", "smpte2084")
        tune = {"fiction": "film"}.get(group)
        if group == "taktouk" and "2d" in name:
            tune = "animation"
        log("    %s %sx%s %.0fs%s → transcodage" % (video.get("codec_name"), video.get("width"),
                                                  video.get("height"), duration, " HDR" if hdr else ""))
        out_duration, out_video = transcode(tmp_src, dst, duration, tune, hdr, args.tmp)
        make_thumbnail(dst, os.path.join(args.out, rel_thumb), out_duration * 0.25)
        video_contact(dst, out_duration, os.path.join(args.out, "contact", "video-%s-%s.jpg" % (group, name)))
        w, h = int(out_video.get("width") or 0), int(out_video.get("height") or 0)
        item = {
            "id": item_id,
            "kind": "video",
            "group": group,
            "region": region,
            "src": src,
            "out": rel,
            "sha256": sha256_file(dst),
            "bytes": os.path.getsize(dst),
            "w": w,
            "h": h,
            "orientation": "portrait" if h > w else "landscape",
            "duration": round(out_duration, 2),
            "durationLabel": mmss(out_duration),
            "thumb": {
                "out": rel_thumb,
                "sha256": sha256_file(os.path.join(args.out, rel_thumb)),
                "bytes": os.path.getsize(os.path.join(args.out, rel_thumb)),
            },
        }
        manifest.add(item)
        log("    ok : %.1f Mo, %s, %dx%d en %.0fs" % (item["bytes"] / 1e6, item["durationLabel"], w, h,
                                                     time.time() - started))
    except Exception as e:  # noqa: BLE001 — une vidéo en échec ne bloque pas les autres
        manifest.skip(src["member"], "erreur vidéo : %s" % e)
        for leftover in (dst + ".part", dst):
            if os.path.exists(leftover) and item_id not in manifest.items:
                os.remove(leftover)
    finally:
        if os.path.exists(tmp_src):
            os.remove(tmp_src)


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--src", required=True, help="dossier contenant les zips DRI")
    parser.add_argument("--out", help="dossier de sortie (défaut : <src>/_web)")
    parser.add_argument("--tmp", help="dossier temporaire (défaut : <src>/_tmp)")
    parser.add_argument("--only", default="docs,posters,photos,contact",
                        help="étapes à exécuter, séparées par des virgules (videos en option)")
    parser.add_argument("--limit-videos", type=int, default=0, help="nombre max de vidéos (tests)")
    args = parser.parse_args()
    args.out = args.out or os.path.join(args.src, "_web")
    args.tmp = args.tmp or os.path.join(args.src, "_tmp")
    os.makedirs(args.out, exist_ok=True)
    steps = [s.strip() for s in args.only.split(",") if s.strip()]
    manifest = Manifest(args.out)
    if "docs" in steps:
        step_docs(args, manifest)
    if "posters" in steps:
        step_posters(args, manifest)
    if "photos" in steps:
        step_photos(args, manifest)
    if "contact" in steps:
        album_contacts(args, manifest)
    if "videos" in steps:
        step_videos(args, manifest)
    kinds = {}
    for item in manifest.items.values():
        kinds[item["kind"]] = kinds.get(item["kind"], 0) + 1
    log("Terminé : %s ; %d élément(s) ignoré(s)" % (kinds, len(manifest.skipped)))


if __name__ == "__main__":
    sys.exit(main())
