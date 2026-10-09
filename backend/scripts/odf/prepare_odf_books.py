"""Prépare les documents ODF « avec page de garde » pour le site.

Pour chaque paire de documents Word (arabe + français) :
  scan       appariement AR/FR, doublons, clé d'import stable
  meta       métadonnées (page de garde, référence de la décision, droits…)
             + texte HTML (recherche, assistant, bloc « Texte intégral »)
  normalize  copie de travail corrigée (image mal typée, lettres persanes,
             police Traditional Arabic → Amiri) — les sources ne sont jamais modifiées
  convert    Word (COM, via word_to_pdf.ps1) exporte chaque copie en PDF
  render     PyMuPDF : une image WebP par page (1600 px) + miniature (320 px),
             PDF nettoyé pour le téléchargement
  manifest   manifest.json pour publish-odf-books.ts
  contact    planches-contact par type (contrôle visuel)

Tout est reprenable : relancer le script ne refait que ce qui manque.

Usage (Python 3.7, Windows, Word installé) :
  py -I backend/scripts/odf/prepare_odf_books.py [--phases scan,meta,...]
      [--keys fiches/2009/,blogs/] [--types fiches,blogs] [--limit 10]
"""
import argparse
import csv
import hashlib
import json
import os
import queue
import re
import shutil
import subprocess
import sys
import threading
import time
import unicodedata
from concurrent.futures import ProcessPoolExecutor, as_completed

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import odf_docx as dx  # noqa: E402

DEFAULT_SRC = r"C:\Users\wassim.ayari\Desktop\ODF_Mise_en_forme_fiches\Documents avec page de garde"
DEFAULT_OUT = r"C:\Users\wassim.ayari\Desktop\ODF_Mise_en_forme_fiches\_odf_web"
DEFAULT_WORK = os.path.join(os.environ.get("LOCALAPPDATA", r"C:\Temp"), "odfw")

# Changer cette valeur force un nouveau rendu de toutes les pages.
RENDER_VERSION = "r2-pdfa-1600-q80-t320"
PAGE_WIDTH = 1600
THUMB_WIDTH = 320
PAGE_QUALITY = 80
THUMB_QUALITY = 70

# Dossier source → type (clé utilisée partout ailleurs)
TYPE_FOLDERS = [
    ("analyses juridiques", "analyses"),
    ("approche economique", "economie"),
    ("articles", "articles"),
    ("blog", "blogs"),
    ("commentaires", "commentaires"),
    ("fiches", "fiches"),
    ("notes thematiques", "notes"),
    ("policy briefs", "policy"),
    ("presentations", "presentations"),
    ("recueils", "recueils"),
]
TYPE_LABELS = {
    "analyses": ("Analyse juridique", "تحليل قانوني"),
    "articles": ("Article", "مقال"),
    "economie": ("Article", "مقال"),
    "blogs": ("Blog", "تدوينة"),
    "commentaires": ("Commentaire", "تعليق"),
    "fiches": ("Fiche", "جذاذة"),
    "notes": ("Note thématique", "ورقة موضوعية"),
    "policy": ("Policy brief", "ورقة سياسية"),
    "presentations": ("Présentation", "تقديم"),
    "recueils": ("Recueil", "مجموعة"),
}
LANG_TOKEN = r"(?:AR|FR|FRançais|Français|FRANÇAIS)"

COURTS_AR = {
    "tribunal administratif": "المحكمة الإدارية",
    "conseil constitutionnel": "المجلس الدستوري",
    "cour de cassation": "محكمة التعقيب",
    "instance provisoire de controle de la constitutionnalite des projets de loi": "الهيئة الوقتية لمراقبة دستورية مشاريع القوانين",
}
LEVELS_AR = {
    "cassation": "تعقيب",
    "appel": "استئناف",
    "premiere instance": "ابتدائي",
    "refere": "استعجالي",
    "sursis a execution": "توقيف التنفيذ",
    "suspension d'execution": "توقيف التنفيذ",
    "civil": "مدني",
    "penal": "جزائي",
    "assemblee pleniere": "الجلسة العامة",
    "chambres reunies": "الدوائر المجتمعة",
    "avis": "رأي",
}
MONTHS_AR = ["جانفي", "فيفري", "مارس", "أفريل", "ماي", "جوان", "جويلية", "أوت", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]
MONTHS_FR = {
    "janvier": 1, "fevrier": 2, "mars": 3, "avril": 4, "mai": 5, "juin": 6, "juillet": 7,
    "aout": 8, "septembre": 9, "octobre": 10, "novembre": 11, "decembre": 12,
}


# ---------------------------------------------------------------------------
# Utilitaires
# ---------------------------------------------------------------------------

def log(*a):
    print(time.strftime("%H:%M:%S"), *a, flush=True)


def lp(path):
    """Chemin Windows long (certains blogs dépassent 259 caractères)."""
    path = os.path.abspath(path)
    return path if path.startswith("\\\\?\\") else "\\\\?\\" + path


def nfc(s):
    return unicodedata.normalize("NFC", s or "")


def fold(s):
    """minuscules, sans accents, apostrophes unifiées, espaces réduits."""
    s = nfc(s).replace("\u2019", "'").replace("\u2018", "'").replace("`", "'")
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    return re.sub(r"\s+", " ", s.lower()).strip()


def ascii_slug(s, maxlen=60):
    s = fold(s)
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    if len(s) > maxlen:
        s = s[:maxlen].rsplit("-", 1)[0]
    return s


def sha256_file(path):
    h = hashlib.sha256()
    with open(lp(path), "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def short(s, n):
    s = s or ""
    if len(s) <= n:
        return s
    cut = s[:n].rsplit(" ", 1)[0]
    return cut.rstrip(" ,;:،") + "…"


def write_json(path, data):
    tmp = path + ".part"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    os.replace(tmp, path)


def read_json(path, default=None):
    if not os.path.exists(path):
        return default
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def pair_key(stem):
    s = nfc(stem)
    prev = None
    while s != prev:
        prev = s
        s = s.strip().rstrip(".").strip()
        s = re.sub(r"\s*\(\d+\)$", "", s)
        s = re.sub(r"[_\s]+" + LANG_TOKEN + r"$", "", s)
    s = re.sub(r"_" + LANG_TOKEN + r"_", "_", s)
    return s.strip()


def flat(key):
    return key.replace("/", "__")


# ---------------------------------------------------------------------------
# Phase scan
# ---------------------------------------------------------------------------

def phase_scan(args):
    src = args.src
    pairs_cfg = read_json(os.path.join(HERE, "odf_pairs.json"), {}) or {}
    overrides = read_json(os.path.join(HERE, "odf_overrides.json"), {}) or {}
    groups = {}
    errors = []
    for type_dir in sorted(os.listdir(lp(src))):
        tkey = None
        for prefix, k in TYPE_FOLDERS:
            if fold(type_dir).startswith(prefix):
                tkey = k
        if not tkey:
            continue
        for lang_dir in sorted(os.listdir(lp(os.path.join(src, type_dir)))):
            lang = "ar" if fold(lang_dir).startswith("arab") else "fr" if fold(lang_dir).startswith("fran") else None
            base = os.path.join(src, type_dir, lang_dir)
            if not lang or not os.path.isdir(lp(base)):
                continue
            for dirpath, _dirs, files in os.walk(lp(base)):
                for name in sorted(files):
                    if name.startswith("~$") or not name.lower().endswith(".docx"):
                        continue
                    full = os.path.join(dirpath, name)
                    rel = os.path.relpath(full, lp(src))
                    parent = os.path.basename(dirpath)
                    year = int(parent) if re.fullmatch(r"(19|20)\d\d", parent) else None
                    stem = nfc(os.path.splitext(name)[0])
                    pk = pair_key(stem)
                    if tkey == "analyses" and lang == "fr":
                        pk = pairs_cfg.get("analyses", {}).get(pk, pk)
                    groups.setdefault((tkey, year, pk), {}).setdefault(lang, []).append(rel)

    items = []
    for (tkey, year, pk), langs in sorted(groups.items(), key=lambda kv: (kv[0][0], kv[0][1] or 0, kv[0][2])):
        chosen = {}
        dups = []
        for lang in ("ar", "fr"):
            files = sorted(langs.get(lang, []), key=lambda r: (len(r), r))
            if not files:
                continue
            if len(files) > 1:
                preferred = [r for r in files if r in overrides.get("prefer", [])]
                if preferred:
                    files = preferred + [r for r in files if r not in preferred]
                else:
                    prints = {r: dx.body_fingerprint(lp(os.path.join(src, r))) for r in files}
                    if len(set(prints.values())) != 1:
                        errors.append("contenus différents pour la même clé %s/%s %s : %s" % (tkey, year, lang, files))
                dups.extend(files[1:])
            chosen[lang] = files[0]
        if set(chosen) != {"ar", "fr"}:
            errors.append("sans paire (%s, %s, %s) : %s" % (tkey, year, pk, chosen))
            continue
        items.append({"type": tkey, "year": year, "pairKey": pk, "src": chosen, "duplicates": dups})

    # Clés d'import lisibles et stables
    used = set()
    for it in items:
        tkey, pk = it["type"], it["pairKey"]
        h = hashlib.sha1(("%s|%s|%s" % (tkey, it["year"], pk)).encode("utf-8")).hexdigest()
        if tkey == "fiches":
            slug = ascii_slug(pk) or h[:10]
            key = "fiches/%d/%s" % (it["year"], slug)
        elif tkey == "recueils":
            m = re.search(r"(19|20)\d\d", pk)
            key = "recueils/%s" % (m.group(0) if m else ascii_slug(pk))
        else:
            slug = ascii_slug(pk, 50)
            if len(re.sub(r"[^a-z]", "", slug)) < 6:
                slug = (slug + "-" if slug else "") + h[:8]
            key = "%s/%s" % (tkey, slug)
        if key in used:
            key = "%s-%s" % (key, h[:6])
        used.add(key)
        it["key"] = key
        it["sha"] = {lang: sha256_file(os.path.join(src, it["src"][lang])) for lang in ("ar", "fr")}

    counts = {}
    for it in items:
        counts[it["type"]] = counts.get(it["type"], 0) + 1
    write_json(os.path.join(args.out, "inventory.json"), {"items": items, "errors": errors, "counts": counts})
    log("scan :", len(items), "documents", counts)
    for e in errors:
        log("  ERREUR", e)
    if errors:
        sys.exit("scan : %d erreur(s), voir ci-dessus" % len(errors))


def load_items(args, stage="inventory"):
    data = read_json(os.path.join(args.out, stage + ".json"))
    if not data:
        sys.exit("lancer d'abord la phase %s" % stage)
    items = data["items"]
    if args.types:
        items = [i for i in items if i["type"] in args.types]
    if args.keys:
        items = [i for i in items if any(i["key"].startswith(k) for k in args.keys)]
    if args.limit:
        items = items[: args.limit]
    return items


# ---------------------------------------------------------------------------
# Phase meta
# ---------------------------------------------------------------------------

FICHE_TITLE_FR = re.compile(r"^(?P<right>.+?)\s+[—–-]\s+Jurisprudence\s+(?P<juris>.+?)\s+(?P<year>(?:19|20)\d\d)\s*$")
FICHE_TITLE_AR = re.compile(r"^(?P<right>.+?)\s+(?P<juris>فقه\s+القضاء.*?)\s+لسنة\s+(?P<year>(?:19|20)\d\d)\s*$")
FR_REF = re.compile(
    r"^(?P<court>[^,]+?),\s*(?:(?P<chamber>[^,]*chambre[^,]*),\s*)?(?P<level>[^,]+?),\s*n°\s*(?P<num>[^,]+?),\s*(?:du\s+)?"
    r"(?P<date>\d{1,2}(?:er)?\s+[A-Za-zéûôÉ]+\s+(?:19|20)\d\d)\s*,\s*(?P<rest>.*)$"
)
AR_DIGITS = str.maketrans("٠١٢٣٤٥٦٧٨٩", "0123456789")


def parse_fr_date(s):
    m = re.match(r"(\d{1,2})(?:er)?\s+([A-Za-zéûôÉ]+)\s+((?:19|20)\d\d)", s or "")
    if not m:
        return None
    month = MONTHS_FR.get(fold(m.group(2)))
    if not month:
        return None
    return "%s-%02d-%02d" % (m.group(3), month, int(m.group(1)))


def parse_fr_reference(ref):
    ref = dx.clean(ref).rstrip(".")
    out = {"full": ref}
    m = FR_REF.match(ref)
    if not m:
        return out
    rest = m.group("rest")
    recueil = re.search(r",?\s*Recueil\s*,?\s*(?P<ry>[\d\s/–-]+?)\s*,\s*p\.\s*(?P<page>[\d\s–-]+)\s*$", rest)
    parties = rest[: recueil.start()] if recueil else rest
    parties = re.sub(r",?\s*in[ée]dit\s*$", "", parties).strip(" ,")
    court = dx.clean(m.group("court"))
    if m.group("chamber"):
        court = "%s, %s" % (court, dx.clean(m.group("chamber")))
    out.update({
        "court": court,
        "level": dx.clean(m.group("level")),
        "number": dx.clean(m.group("num")),
        "date": parse_fr_date(m.group("date")),
        "dateText": dx.clean(m.group("date")),
        "parties": parties,
        "recueil": ("Recueil %s, p. %s" % (dx.clean(recueil.group("ry")), dx.clean(recueil.group("page")))) if recueil else "",
    })
    if " c/ " in parties:
        a, b = parties.split(" c/ ", 1)
        out["plaintiff"], out["defendant"] = a.strip(), b.strip()
    return out


AR_LEVEL_WORDS = ("ابتدائي", "استئناف", "تعقيب", "توقيف", "استعجالي", "مدني", "جزائي", "رأي", "الجلسة العامة", "الدوائر المجتمعة")


def parse_ar_reference(ref):
    ref = dx.clean(ref).rstrip(".")
    parts = [dx.clean(p) for p in re.split(r"[،,]", ref) if dx.clean(p)]
    out = {"full": ref}
    num_idx = None
    for i, p in enumerate(parts):
        m = re.fullmatch(r"(?:عدد\s*)?([\d/]+)", p.translate(AR_DIGITS))
        if m and i >= 1:
            num_idx = i
            out["number"] = m.group(1)
            break
    if num_idx is None or num_idx < 2:
        return out
    middle = parts[1:num_idx]
    level = next((p for p in middle if any(w in fold(p) for w in map(fold, AR_LEVEL_WORDS))), middle[-1])
    others = [p for p in middle if p != level]
    out["court"] = "، ".join([parts[0]] + others)
    out["level"] = level
    out["short"] = "، ".join(parts[: num_idx + 2])
    for p in parts[num_idx + 1:]:
        if "/" in p and not re.search(r"\d", p):
            a, b = p.split("/", 1)
            out["plaintiff"], out["defendant"] = a.strip(), b.strip()
            break
    return out


def apply_reference(m, rf, ra):
    """Champs de la décision : référence FR analysée, et AR quand elle concorde."""
    m["caseNumber"] = rf["number"]
    m["court"] = rf["court"]
    m["courtLevel"] = rf["level"]
    m["decisionDate"] = rf.get("date")
    m["plaintiff"] = rf.get("plaintiff", "")
    m["defendant"] = rf.get("defendant", "")
    m["recueilRef"] = rf.get("recueil", "")
    m["subtitle"] = "%s, %s, n° %s, %s" % (rf["court"], rf["level"], rf["number"], rf["dateText"])
    same = bool(ra.get("number") and ra.get("court")) and ra["number"].replace(" ", "") == rf["number"].replace(" ", "")
    if same:
        m["courtAr"] = ra["court"]
        m["courtLevelAr"] = ra["level"]
        m["plaintiffAr"] = ra.get("plaintiff", "")
        m["defendantAr"] = ra.get("defendant", "")
        m["subtitleAr"] = ra.get("short", "")
    else:
        m["courtAr"] = COURTS_AR.get(fold(rf["court"].split(",")[0]), "")
        m["courtLevelAr"] = LEVELS_AR.get(fold(rf["level"]), "")
        m["subtitleAr"] = ""
        # Référence arabe illisible (ordre des mots inversé dans les anciennes
        # fiches) : on la recompose à partir de la référence française.
        if m["courtAr"] and m["courtLevelAr"] and rf.get("date") and "," not in rf["court"]:
            y, mo, d = rf["date"].split("-")
            m["subtitleAr"] = "%s، %s، عدد %s، %d %s %s" % (
                m["courtAr"], m["courtLevelAr"], rf["number"], int(d), MONTHS_AR[int(mo) - 1], y)
    return same


def first_paragraphs(blocks, skip_ref=True, min_len=60):
    for kind, val in blocks:
        if kind == "p" and len(dx.plain(val)) >= min_len:
            return dx.plain(val)
    return ""


def section_after(blocks, heading_re):
    """Paragraphes qui suivent un titre (ex. « Le problème juridique : »)."""
    out, inside = [], False
    for kind, val in blocks:
        txt = dx.plain(val)
        if kind in ("h2", "h3"):
            if inside:
                break
            inside = bool(re.search(heading_re, fold(txt)))
            continue
        if inside and kind == "p" and txt:
            out.append(txt)
    return " ".join(out)


def name_number_date(name):
    """N° et date de validation à partir d'un nom de fichier
    (« تدوينة عدد 12، … تصديق، 2026.09.07 » ou « Blog n° 1, …, Validé, 30.05.2025 »)."""
    n = nfc(name).translate(AR_DIGITS)
    num = re.search(
        r"(?:تدوينة|تعليق|بريف|Blog|Commentaire|brief|Article|th[ée]matique|num[ée]ro)\s*(?:عدد|n°|no)?\s*(\d+)",
        n, re.I)
    date = None
    m = re.search(r"((?:19|20)\d\d)\.(\d{1,2})\.(\d{1,2})", n)
    if m:
        date = "%s-%02d-%02d" % (m.group(1), int(m.group(2)), int(m.group(3)))
    else:
        m = re.search(r"(\d{1,2})\.(\d{1,2})\.((?:19|20)\d\d)", n)
        if m:
            date = "%s-%02d-%02d" % (m.group(3), int(m.group(2)), int(m.group(1)))
    return (int(num.group(1)) if num else None), date


def fiche_number(stem):
    m = re.search(r"Fiche_?(?:Emna)?_?0*(\d+)", nfc(stem), re.I)
    return int(m.group(1)) if m else None


def phase_meta(args):
    items = load_items(args)
    text_dir = os.path.join(args.out, "text")
    os.makedirs(text_dir, exist_ok=True)
    fiche_index = {}
    for it in items:
        if it["type"] == "fiches":
            n = fiche_number(os.path.basename(it["src"]["fr"]))
            if n is not None:
                fiche_index.setdefault((it["year"], n), []).append(it["key"])
    rights_inv = {}
    review = []
    for idx, it in enumerate(items, 1):
        parsed = {}
        for lang in ("ar", "fr"):
            cv, blocks, marks, fns, ens = dx.read_docx(lp(os.path.join(args.src, it["src"][lang])))
            if lang == "ar":
                cv = {k: (dx.to_arabic_letters(v) if isinstance(v, str) else [dx.to_arabic_letters(x) for x in v]) for k, v in cv.items()}
                blocks = [(k, dx.to_arabic_letters(v) if isinstance(v, str) else [[dx.to_arabic_letters(c) for c in row] for row in v]) for k, v in blocks]
                fns = {k: dx.to_arabic_letters(v) for k, v in fns.items()}
                ens = {k: dx.to_arabic_letters(v) for k, v in ens.items()}
            html_text = dx.blocks_to_html(blocks, marks, fns, ens, lang)
            with open(os.path.join(text_dir, "%s-%s.html" % (flat(it["key"]), lang)), "w", encoding="utf-8") as f:
                f.write(html_text)
            parsed[lang] = {"cover": cv, "blocks": blocks}
        meta = build_meta(it, parsed, fiche_index)
        it["meta"] = meta
        for raw in meta.get("rightsRaw", []):
            r = rights_inv.setdefault(raw, {"count": 0, "ar": set(), "types": set()})
            r["count"] += 1
            r["types"].add(it["type"])
            if meta.get("rightsRawAr"):
                r["ar"].add(meta["rightsRawAr"])
        review.append(meta_review_row(it))
        if idx % 100 == 0:
            log("meta", idx, "/", len(items))

    rights_map = read_json(os.path.join(HERE, "odf_rights_map.json"), {}) or {}
    unresolved = resolve_rights(items, rights_map)
    write_json(os.path.join(args.out, "meta.json"), {"items": items})
    with open(os.path.join(args.out, "rights_inventory.csv"), "w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f, delimiter=";")
        w.writerow(["droit (FR, tel qu'écrit)", "AR", "nombre", "types", "catégories"])
        for raw, r in sorted(rights_inv.items(), key=lambda kv: -kv[1]["count"]):
            w.writerow([raw, " | ".join(sorted(r["ar"]))[:300], r["count"], ",".join(sorted(r["types"])), " | ".join(map_right(raw, rights_map) or [])])
    with open(os.path.join(args.out, "review.csv"), "w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f, delimiter=";")
        w.writerow(list(review[0].keys()) if review else [])
        for row in review:
            w.writerow(list(row.values()))
    log("meta :", len(items), "documents ;", len(rights_inv), "libellés de droits ;", len(unresolved), "non rattachés")
    for raw in sorted(unresolved)[:200]:
        log("  droit non rattaché :", raw)


def build_meta(it, parsed, fiche_index):
    t = it["type"]
    fr, ar = parsed["fr"], parsed["ar"]
    cfr, car = fr["cover"], ar["cover"]
    m = {
        "title": cfr["title"],
        "titleAr": car["title"],
        "subtitle": cfr["subtitle"],
        "subtitleAr": car["subtitle"],
        "author": cfr["author"],
        "authorAr": car["author"],
        "affiliation": cfr["affiliation"],
        "affiliationAr": car["affiliation"],
        "keywords": cfr["keywords"],
        "keywordsAr": car["keywords"],
        "labelFr": cfr["label"],
        "labelAr": car["label"],
        "year": it.get("year"),
        "rightsRaw": [],
    }
    # Le dossier « Observatoire des Droits Fondamentaux » n'est pas une affiliation utile
    for k in ("affiliation", "affiliationAr"):
        if fold(m[k]) in ("observatoire des droits fondamentaux", fold("مرصد الحقوق الأساسية"), fold("مرصد الحقوق الأساسيّة")):
            m[k] = ""
    name_fr = os.path.splitext(os.path.basename(it["src"]["fr"]))[0]
    name_ar = os.path.splitext(os.path.basename(it["src"]["ar"]))[0]

    if t == "fiches":
        mt = FICHE_TITLE_FR.match(m["title"])
        if mt:
            m["rightsRaw"] = [mt.group("right")]
            m["jurisdiction"] = mt.group("juris")
            m["year"] = int(mt.group("year"))
        else:
            m["rightsRaw"] = [m["title"]]
        ma = FICHE_TITLE_AR.match(m["titleAr"])
        if ma:
            m["rightsRawAr"] = ma.group("right")
        ref_fr = next((v for k, v in fr["blocks"] if k == "ref"), "")
        ref_ar = next((v for k, v in ar["blocks"] if k == "ref"), "")
        rf = parse_fr_reference(ref_fr) if ref_fr else {}
        ra = parse_ar_reference(ref_ar) if ref_ar else {}
        m["referenceFr"] = rf.get("full", "")
        m["referenceAr"] = ra.get("full", "")
        if rf.get("number"):
            apply_reference(m, rf, ra)
        else:
            m["subtitle"] = short(rf.get("full", ""), 220)
            m["subtitleAr"] = short(ra.get("full", ""), 220) if ra.get("full") else ""
        m["summary"] = short(section_after(fr["blocks"], r"probleme juridique"), 700)
        m["summaryAr"] = short(section_after(ar["blocks"], r"المشكل القانوني|الإشكال القانوني|المشكلة القانونية"), 700)
        m["number"] = fiche_number(name_fr)
        m["sortOrder"] = m["number"]
    elif t == "recueils":
        my = re.search(r"(19|20)\d\d", m["title"])
        m["year"] = int(my.group(0)) if my else it.get("year")
        text = " ".join(dx.plain(v) for k, v in fr["blocks"] if isinstance(v, str))
        refs = []
        for n in re.findall(r"\(\s*Fiche\s*n°\s*(\d+)\s*\)", text):
            keys = fiche_index.get((m["year"], int(n)), [])
            if len(keys) == 1 and keys[0] not in refs:
                refs.append(keys[0])
            elif not keys:
                m.setdefault("refsMissing", []).append(int(n))
            elif len(keys) > 1:
                m.setdefault("refsAmbiguous", []).append(int(n))
        m["refs"] = refs
        m["summary"] = "Jugements et fiches de jurisprudence de l'année %s." % m["year"] if m["year"] else ""
        m["summaryAr"] = "أحكام وجذاذات فقه القضاء لسنة %s." % m["year"] if m["year"] else ""
        m["sortOrder"] = m["year"]
    else:
        num, date = name_number_date(name_ar)
        if num is None and date is None:
            num, date = name_number_date(name_fr)
        m["number"] = num
        m["validationDate"] = date
        if t in ("blogs", "commentaires"):
            first_fr = next((dx.plain(v) for k, v in fr["blocks"] if k in ("p", "ref") and dx.plain(v)), "")
            first_ar_blocks = [dx.plain(v) for k, v in ar["blocks"] if k in ("p", "ref") and dx.plain(v)][:2]
            first_ar = first_ar_blocks[0] if first_ar_blocks else ""
            if len(first_ar_blocks) > 1:
                second = first_ar_blocks[1]
                # La référence arabe tient parfois sur deux paragraphes
                if (first_ar.rstrip().endswith(("/", "،", ",")) or len(first_ar) < 60
                        or ("منشور" in second and len(second) < 250)):
                    first_ar = first_ar + " " + second
            m["referenceFr"] = first_fr
            m["referenceAr"] = first_ar
            rf = parse_fr_reference(first_fr)
            if rf.get("number"):
                apply_reference(m, rf, parse_ar_reference(first_ar))
            if not m["subtitle"]:
                m["subtitle"] = short(first_fr, 220)
            if not m["subtitleAr"]:
                m["subtitleAr"] = short(first_ar, 220)
        body_fr = [dx.plain(v) for k, v in fr["blocks"] if k == "p"]
        body_ar = [dx.plain(v) for k, v in ar["blocks"] if k == "p"]
        skip = 1 if t in ("blogs", "commentaires") else 0
        m["summary"] = short(next((p for p in body_fr[skip:] if len(p) >= 80), ""), 450)
        m["summaryAr"] = short(next((p for p in body_ar[skip:] if len(p) >= 60), ""), 450)
        m["sortOrder"] = num
        if t in ("analyses", "articles", "economie", "notes", "policy", "blogs", "commentaires"):
            m["rightsRaw"] = [m["title"]]
    return m


def meta_review_row(it):
    m = it["meta"]
    return {
        "cle": it["key"],
        "type": it["type"],
        "annee": m.get("year") or "",
        "titre": m["title"],
        "titre_ar": m["titleAr"],
        "sous_titre": m.get("subtitle", ""),
        "auteur": m["author"],
        "auteur_ar": m["authorAr"],
        "n_affaire": m.get("caseNumber", ""),
        "date_decision": m.get("decisionDate", "") or "",
        "date_validation": m.get("validationDate", "") or "",
        "mots_cles": len(m["keywords"]),
        "mots_cles_ar": len(m["keywordsAr"]),
        "resume": short(m.get("summary", ""), 120),
        "resume_ar": short(m.get("summaryAr", ""), 120),
        "refs": len(m.get("refs", [])),
        "source_fr": it["src"]["fr"],
    }


# --- Droits fondamentaux ---------------------------------------------------

def norm_right(s):
    s = fold(s)
    s = re.sub(r"^(le|la|les)\s+", "", s)
    s = re.sub(r"^l'", "", s)
    return re.sub(r"[^a-z0-9' ]+", " ", s).strip()


def right_index(rights_map):
    idx = {norm_right(c): c for c in rights_map.get("categories", [])}
    for k, v in rights_map.get("aliases", {}).items():
        idx[norm_right(k)] = v
    return idx


def map_right(raw, rights_map):
    """Libellé de droit (titre de fiche) → noms de catégories."""
    explicit = rights_map.get("fiches", {})
    if raw in explicit:
        return explicit[raw]
    idx = right_index(rights_map)
    n = norm_right(raw)
    if n in idx:
        return [idx[n]]
    parts = re.split(r",\s*|\s+et\s+(?=(?:(?:le|la|les)\s+|l')?(?:droit|droits|liberte|libertes)\b)", fold(raw))
    out = []
    for p in parts:
        c = idx.get(norm_right(p))
        if not c:
            return None
        if c not in out:
            out.append(c)
    return out or None


def detect_rights(title, rights_map):
    """Droits cités dans le titre d'une analyse, d'un article…"""
    t = " " + norm_right(title).replace("'", " ") + " "
    phrases = rights_map.get("phrases", {})
    found = []
    for phrase, cat in sorted(phrases.items(), key=lambda kv: -len(kv[0])):
        p = " " + norm_right(phrase).replace("'", " ") + " "
        if p in t and cat not in found:
            found.append(cat)
            t = t.replace(p, " ")
    return found


def resolve_rights(items, rights_map):
    unresolved = set()
    for it in items:
        m = it["meta"]
        if it["type"] == "fiches":
            cats = []
            for raw in m.get("rightsRaw", []):
                got = map_right(raw, rights_map)
                if got is None:
                    unresolved.add(raw)
                else:
                    cats.extend(c for c in got if c not in cats)
            m["rights"] = cats
        else:
            # Articles d'économie : le droit est souvent dans le sous-titre
            text = m["title"] + (" " + (m.get("subtitle") or "") if it["type"] == "economie" else "")
            m["rights"] = detect_rights(text, rights_map) if rights_map else []
    return unresolved


# ---------------------------------------------------------------------------
# Phases normalize / convert / render
# ---------------------------------------------------------------------------

def h10(it, lang):
    return hashlib.sha256((it["sha"][lang] + RENDER_VERSION).encode()).hexdigest()[:10]


def edition_paths(args, it, lang):
    tag = "%s-%s-%s" % (flat(it["key"]), lang, h10(it, lang))
    return (
        os.path.join(args.work, "in", tag + ".docx"),
        os.path.join(args.work, "pdf", tag + ".pdf"),
        "odf/%s/%s-%s" % (it["key"], lang, h10(it, lang)),
    )


def phase_normalize(args):
    items = load_items(args, "meta")
    os.makedirs(os.path.join(args.work, "in"), exist_ok=True)
    stats = {"persian": 0, "fonts": 0, "fixed_parts": 0, "dropped_parts": 0, "files": 0}
    for it in items:
        for lang in ("ar", "fr"):
            dst, _pdf, _dir = edition_paths(args, it, lang)
            if os.path.exists(dst):
                continue
            st = dx.normalize(lp(os.path.join(args.src, it["src"][lang])), dst + ".part")
            os.replace(dst + ".part", dst)
            for k, v in st.items():
                stats[k] += v
            stats["files"] += 1
    log("normalize :", stats)


def word_pids():
    out = subprocess.run(["tasklist", "/FI", "IMAGENAME eq WINWORD.EXE", "/FO", "CSV", "/NH"],
                         capture_output=True, text=True).stdout
    return set(int(m.group(1)) for m in re.finditer(r'"WINWORD\.EXE","(\d+)"', out))


def kill_tree(pid):
    subprocess.run(["taskkill", "/F", "/T", "/PID", str(pid)], capture_output=True)


def clear_word_resiliency():
    subprocess.run(["reg", "delete", r"HKCU\Software\Microsoft\Office\16.0\Word\Resiliency", "/f"], capture_output=True)


def run_word_batch(jobs, ps1, work):
    """Convertit une liste de (docx, pdf) avec une instance de Word.
    Renvoie {index: 'ok'|message d'erreur}."""
    job_file = os.path.join(work, "jobs.tsv")
    with open(job_file, "w", encoding="utf-8") as f:
        for src, dst in jobs:
            f.write("%s\t%s\n" % (src, dst))
    before = word_pids()
    proc = subprocess.Popen(
        ["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", ps1, "-JobFile", job_file],
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT, encoding="utf-8", errors="replace",
    )
    lines = queue.Queue()

    def reader():
        for line in proc.stdout:
            lines.put(line.rstrip("\r\n"))
        lines.put(None)

    threading.Thread(target=reader, daemon=True).start()
    results = {}
    current, started = None, time.time()
    word_pid = None
    while True:
        limit = 240 if current in (None, 0) else 150
        try:
            line = lines.get(timeout=5)
        except queue.Empty:
            line = ""
        if line is None:
            break
        if line.startswith("WORDPID"):
            pids = [int(x) for x in re.findall(r"\d+", line)]
            word_pid = pids[0] if pids else None
        elif line.startswith("START "):
            current, started = int(line.split()[1]), time.time()
        elif line.startswith("OK "):
            results[int(line.split()[1])] = "ok"
            current = None
            started = time.time()
        elif line.startswith("ERR "):
            parts = line.split(" ", 2)
            results[int(parts[1])] = parts[2] if len(parts) > 2 else "erreur"
            current = None
            started = time.time()
        elif line.startswith("FATAL"):
            log("  ", line)
        elif line:
            log("   word:", line[:200])
        if time.time() - started > limit:
            log("  Word bloqué (document %s) : arrêt forcé" % current)
            kill_tree(proc.pid)
            for pid in ([word_pid] if word_pid else []) + list(word_pids() - before):
                kill_tree(pid)
            clear_word_resiliency()
            if current is not None:
                results[current] = "délai dépassé"
            break
    try:
        proc.wait(timeout=30)
    except subprocess.TimeoutExpired:
        kill_tree(proc.pid)
    # Instances orphelines éventuelles
    for pid in word_pids() - before:
        kill_tree(pid)
    return results


def phase_convert(args):
    items = load_items(args, "meta")
    os.makedirs(os.path.join(args.work, "pdf"), exist_ok=True)
    ps1 = os.path.join(HERE, "word_to_pdf.ps1")
    pending = []
    for it in items:
        for lang in ("ar", "fr"):
            src, pdf, _dir = edition_paths(args, it, lang)
            if not os.path.exists(pdf):
                pending.append((src, pdf))
    log("convert :", len(pending), "documents à convertir")
    failed = {}
    attempt = {}
    t0 = time.time()
    done = 0
    while pending:
        batch = pending[: args.batch]
        results = run_word_batch(batch, ps1, args.work)
        rest = []
        for i, (src, pdf) in enumerate(batch):
            r = results.get(i)
            if r == "ok" and os.path.exists(pdf):
                done += 1
                continue
            if r is None:
                rest.append((src, pdf))  # pas encore traité (lot interrompu)
                continue
            attempt[src] = attempt.get(src, 0) + 1
            if attempt[src] < 2:
                rest.append((src, pdf))
            else:
                failed[src] = r
        pending = rest + pending[len(batch):]
        elapsed = time.time() - t0
        log("convert : %d faits, %d restants, %d échecs (%.0f s)" % (done, len(pending), len(failed), elapsed))
    if failed:
        for k, v in failed.items():
            log("  ÉCHEC", os.path.basename(k), v)
        sys.exit("convert : %d échec(s)" % len(failed))


def render_edition(job):
    """Exécuté dans un processus séparé."""
    import fitz
    from PIL import Image

    pdf_in, out_dir, pdf_name, title, subject = job
    tmp_dir = out_dir + ".part"
    if os.path.exists(tmp_dir):
        shutil.rmtree(tmp_dir)
    os.makedirs(tmp_dir)
    doc = fitz.open(pdf_in)
    n = doc.page_count
    keep = n
    while keep > 1:
        pg = doc[keep - 1]
        if pg.get_text("text").strip() or pg.get_images() or len(pg.get_drawings()) > 2:
            break
        keep -= 1
    if keep < n:
        doc.delete_pages(from_page=keep, to_page=n - 1)
    fonts, missing, sizes, empty = set(), set(), set(), []
    files = []
    for i, pg in enumerate(doc, 1):
        for f in pg.get_fonts():
            fam = (f[3] or "").split("+")[-1]
            fonts.add(fam)
            if f[1] == "n/a":
                missing.add(fam)
        sizes.add((round(pg.rect.width), round(pg.rect.height)))
        if not pg.get_text("text").strip() and not pg.get_images():
            empty.append(i)
        z = PAGE_WIDTH / pg.rect.width
        pix = pg.get_pixmap(matrix=fitz.Matrix(z, z), alpha=False)
        img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
        p_name, t_name = "p%d.webp" % i, "t%d.webp" % i
        img.save(os.path.join(tmp_dir, p_name), "WEBP", quality=PAGE_QUALITY, method=4)
        th = img.resize((THUMB_WIDTH, round(pix.height * THUMB_WIDTH / pix.width)), Image.LANCZOS)
        th.save(os.path.join(tmp_dir, t_name), "WEBP", quality=THUMB_QUALITY, method=4)
        w, h = pix.width, pix.height
    doc.set_metadata({
        "title": title, "author": "Observatoire des Droits Fondamentaux", "subject": subject,
        "keywords": "", "creator": "", "producer": "",
    })
    try:
        doc.del_xml_metadata()
    except Exception:
        pass
    doc.save(os.path.join(tmp_dir, pdf_name), garbage=3, deflate=True)
    doc.close()
    for name in sorted(os.listdir(tmp_dir)):
        files.append({"rel": name, "bytes": os.path.getsize(os.path.join(tmp_dir, name))})
    info = {
        "pages": keep, "w": w, "h": h, "pdf": pdf_name,
        "bytes": os.path.getsize(os.path.join(tmp_dir, pdf_name)),
        "files": files,
        "qa": {"fonts": sorted(fonts), "missingFonts": sorted(missing), "sizes": sorted(sizes),
               "emptyPages": empty, "trimmed": n - keep},
    }
    with open(os.path.join(tmp_dir, "done.json"), "w", encoding="utf-8") as f:
        json.dump(info, f, ensure_ascii=False)
    if os.path.exists(out_dir):
        shutil.rmtree(out_dir)
    os.replace(tmp_dir, out_dir)
    return out_dir, info


def phase_render(args):
    items = load_items(args, "meta")
    jobs = []
    for it in items:
        m = it["meta"]
        for lang in ("ar", "fr"):
            _src, pdf, d = edition_paths(args, it, lang)
            out_dir = os.path.join(args.out, "files", *d.split("/"))
            if os.path.exists(os.path.join(out_dir, "done.json")):
                continue
            if not os.path.exists(pdf):
                sys.exit("PDF manquant (lancer convert) : %s" % pdf)
            pdf_name = "odf-%s-%s.pdf" % (it["key"].replace("/", "-"), lang)
            title = m["titleAr"] if lang == "ar" else m["title"]
            subject = TYPE_LABELS[it["type"]][1 if lang == "ar" else 0]
            jobs.append((pdf, out_dir, pdf_name, title, subject))
    log("render :", len(jobs), "éditions à rendre")
    t0 = time.time()
    with ProcessPoolExecutor(max_workers=args.workers) as ex:
        futures = [ex.submit(render_edition, j) for j in jobs]
        for n, fut in enumerate(as_completed(futures), 1):
            fut.result()
            if n % 50 == 0 or n == len(jobs):
                log("render : %d/%d (%.0f s)" % (n, len(jobs), time.time() - t0))


# ---------------------------------------------------------------------------
# Manifest et planches-contact
# ---------------------------------------------------------------------------

def phase_manifest(args):
    items = load_items(args, "meta")
    out_items, problems, qa_rows = [], [], []
    for it in items:
        editions = {}
        for lang in ("ar", "fr"):
            _src, _pdf, d = edition_paths(args, it, lang)
            info = read_json(os.path.join(args.out, "files", *d.split("/"), "done.json"))
            if not info:
                problems.append("%s : édition %s non rendue" % (it["key"], lang))
                continue
            info = dict(info)
            info["dir"] = d
            editions[lang] = info
            qa = info["qa"]
            qa_rows.append([it["key"], lang, info["pages"], "|".join(qa["missingFonts"]),
                            "|".join(qa["fonts"]), "|".join("%dx%d" % tuple(s) for s in qa["sizes"]),
                            ",".join(map(str, qa["emptyPages"])), qa["trimmed"]])
            if qa["missingFonts"]:
                problems.append("%s/%s : polices non intégrées %s" % (it["key"], lang, qa["missingFonts"]))
        if it["type"] == "fiches" and not it["meta"].get("rights"):
            problems.append("%s : aucun droit rattaché (%s)" % (it["key"], it["meta"].get("rightsRaw")))
        rec = {k: it[k] for k in ("key", "type", "year", "src", "sha", "duplicates")}
        rec["meta"] = it["meta"]
        rec["html"] = {lang: "text/%s-%s.html" % (flat(it["key"]), lang) for lang in ("ar", "fr")}
        rec["editions"] = editions
        out_items.append(rec)
    with open(os.path.join(args.out, "qa_report.csv"), "w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f, delimiter=";")
        w.writerow(["cle", "langue", "pages", "polices_non_integrees", "polices", "formats", "pages_vides", "pages_retirees"])
        w.writerows(qa_rows)
    counts = {}
    for r in out_items:
        counts[r["type"]] = counts.get(r["type"], 0) + 1
    manifest = {"version": RENDER_VERSION, "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%S"),
                "counts": counts, "items": out_items, "problems": problems}
    write_json(os.path.join(args.out, "manifest.json"), manifest)
    log("manifest :", len(out_items), "documents", counts, ";", len(problems), "problème(s)")
    for p in problems[:50]:
        log("  ", p)


def phase_contact(args):
    from PIL import Image, ImageDraw

    items = load_items(args, "meta")
    out = os.path.join(args.out, "contact")
    os.makedirs(out, exist_ok=True)
    by_type = {}
    for it in items:
        by_type.setdefault(it["type"], []).append(it)
    cell_w, per_sheet = 200, 8
    for t, its in by_type.items():
        for s in range(0, len(its), per_sheet):
            chunk = its[s: s + per_sheet]
            rows = []
            for it in chunk:
                thumbs = []
                for lang in ("ar", "fr"):
                    _src, _pdf, d = edition_paths(args, it, lang)
                    base = os.path.join(args.out, "files", *d.split("/"))
                    for p in (1, 2):
                        f = os.path.join(base, "t%d.webp" % p)
                        thumbs.append(Image.open(f).convert("RGB") if os.path.exists(f) else None)
                rows.append((it["key"], thumbs))
            cell_h = int(cell_w * 1.42)
            sheet = Image.new("RGB", (cell_w * 4 + 50, (cell_h + 26) * len(rows) + 10), "white")
            draw = ImageDraw.Draw(sheet)
            for r, (key, thumbs) in enumerate(rows):
                y = r * (cell_h + 26) + 5
                draw.text((10, y), key, fill=(200, 0, 0))
                for c, im in enumerate(thumbs):
                    if im is None:
                        continue
                    im = im.resize((cell_w, int(im.height * cell_w / im.width)))
                    sheet.paste(im, (10 + c * (cell_w + 10), y + 18))
            sheet.save(os.path.join(out, "%s-%03d.jpg" % (t, s // per_sheet + 1)), quality=85)
    log("contact :", out)


PHASES = ["scan", "meta", "normalize", "convert", "render", "manifest", "contact"]


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", default=DEFAULT_SRC)
    ap.add_argument("--out", default=DEFAULT_OUT)
    ap.add_argument("--work", default=DEFAULT_WORK)
    ap.add_argument("--phases", default=",".join(PHASES))
    ap.add_argument("--keys", default="")
    ap.add_argument("--types", default="")
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--batch", type=int, default=40)
    ap.add_argument("--workers", type=int, default=3)
    args = ap.parse_args()
    args.keys = [k for k in args.keys.split(",") if k]
    args.types = [t for t in args.types.split(",") if t]
    os.makedirs(args.out, exist_ok=True)
    os.makedirs(args.work, exist_ok=True)
    for ph in [p for p in args.phases.split(",") if p]:
        if ph not in PHASES:
            sys.exit("phase inconnue : " + ph)
        log("== phase", ph)
        globals()["phase_" + ph](args)


if __name__ == "__main__":
    main()
