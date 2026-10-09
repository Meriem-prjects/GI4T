"""Lecture des documents Word ODF « avec page de garde » (python-docx n'est pas
nécessaire : on lit directement le XML du .docx avec lxml).

- cover(...)     : métadonnées de la page de garde (type, titre, auteur…)
- body(...)      : corps du document → blocs (titres, paragraphes, tableaux,
                   notes de bas de page) puis HTML pour la recherche et le
                   bloc « Texte intégral » du site
- normalize(...) : copie de travail pour la conversion PDF (image mal typée,
                   lettres persanes, police Traditional Arabic absente)
"""
import html
import re
import zipfile

from lxml import etree

W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
W = "{%s}" % W_NS
REL_NS = "http://schemas.openxmlformats.org/package/2006/relationships"
CT_NS = "http://schemas.openxmlformats.org/package/2006/content-types"

# Lettres persanes saisies à la place des lettres arabes (66 fiches et
# 5 recueils arabes) : même dessin à l'écran, mais la recherche les rate.
PERSIAN_TO_ARABIC = {"ی": "ي", "ھ": "ه", "ک": "ك"}
PERSIAN_RE = re.compile("[یھک]")

KEYWORD_PREFIX = re.compile(
    r"^\s*(?:mots?[- ]cl[ée]s|keywords|الكلمات\s+المفاتيح|كلمات\s+مفاتيح|الكلمات\s+المفتاحية|كلمات\s+مفتاحية)\s*[:：]\s*",
    re.I,
)
KEYWORD_SPLIT = re.compile(r"\s+[—–-]\s+|\s*[;؛]\s*")


def clean(s):
    s = (s or "").replace(" ", " ").replace("‏", "").replace("‎", "")
    return re.sub(r"[ \t\r\f\v]+", " ", s).strip()


def to_arabic_letters(s):
    return PERSIAN_RE.sub(lambda m: PERSIAN_TO_ARABIC[m.group(0)], s or "")


# ---------------------------------------------------------------------------
# Lecture du texte
# ---------------------------------------------------------------------------

def para_text(p, footnote_marks=None):
    """Texte d'un paragraphe, dans l'ordre, sans les codes de champ ni le texte
    supprimé. Les appels de note deviennent [[FN:id]] si footnote_marks est
    fourni (liste ordonnée des ids rencontrés)."""
    out = []
    for el in p.iter():
        tag = el.tag
        if tag == W + "t":
            out.append(el.text or "")
        elif tag in (W + "tab", W + "ptab"):
            out.append(" ")
        elif tag in (W + "br", W + "cr"):
            out.append("\n")
        elif tag == W + "noBreakHyphen":
            out.append("-")
        elif tag in (W + "footnoteReference", W + "endnoteReference") and footnote_marks is not None:
            kind = "fn" if tag == W + "footnoteReference" else "en"
            fid = el.get(W + "id")
            footnote_marks.append((kind, fid))
            out.append("[[%s:%s]]" % (kind.upper(), fid))
    return "".join(out)


def run_props(p):
    """(tailles en demi-points, gras partout ?) des segments non vides."""
    sizes, bold_all, has_text = set(), True, False
    ppr_sz = p.find(W + "pPr/" + W + "rPr/" + W + "sz")
    for r in p.iter(W + "r"):
        txt = "".join(t.text or "" for t in r.iter(W + "t")).strip()
        if not txt:
            continue
        has_text = True
        rpr = r.find(W + "rPr")
        sz = rpr.find(W + "sz") if rpr is not None else None
        if sz is None:
            sz = rpr.find(W + "szCs") if rpr is not None else None
        if sz is None:
            sz = ppr_sz
        if sz is not None and sz.get(W + "val", "").isdigit():
            sizes.add(int(sz.get(W + "val")))
        b = rpr.find(W + "b") if rpr is not None else None
        bcs = rpr.find(W + "bCs") if rpr is not None else None
        bold = any(x is not None and x.get(W + "val", "true") not in ("0", "false") for x in (b, bcs))
        if not bold:
            bold_all = False
    return sizes, (bold_all and has_text)


def style_of(p):
    st = p.find(W + "pPr/" + W + "pStyle")
    return st.get(W + "val") if st is not None else ""


# ---------------------------------------------------------------------------
# Page de garde
# ---------------------------------------------------------------------------

def cover(doc_root):
    """Lit le tableau de la page de garde. Renvoie un dict :
    label, title, subtitle, author, affiliation, keywords (liste)."""
    body = doc_root.find(W + "body")
    tbl = body[0] if len(body) and body[0].tag == W + "tbl" else None
    res = {"label": "", "title": "", "subtitle": "", "author": "", "affiliation": "", "keywords": []}
    if tbl is None:
        return res
    rows = tbl.findall(W + "tr")
    titles, authors, subtitles, affils = [], [], [], []
    for ri, tr in enumerate(rows):
        for p in tr.iter(W + "p"):
            txt = clean(para_text(p))
            if not txt:
                continue
            if KEYWORD_PREFIX.match(txt):
                res["keywords"] = split_keywords(txt)
                continue
            if ri == 0:
                continue  # logos
            sizes, bold = run_props(p)
            sz = max(sizes) if sizes else 0
            if "|" in txt and not res["label"]:
                res["label"] = txt
            elif sz >= 38:
                titles.append(txt)
            elif 32 <= sz <= 36 and bold:
                authors.append(txt)
            elif 26 <= sz <= 31:
                subtitles.append(txt)
            elif ri >= 2 and not affils and not titles:
                # Mots-clés sans préfixe reconnu : rare, on les ignore
                continue
            else:
                affils.append(txt)
    res["title"] = clean(" ".join(titles))
    res["author"] = clean(" ; ".join(authors))
    res["subtitle"] = clean(" ".join(subtitles))
    res["affiliation"] = clean(" ".join(affils))
    return res


def split_keywords(txt):
    txt = KEYWORD_PREFIX.sub("", clean(txt))
    parts = [clean(x).strip(" .،,") for x in KEYWORD_SPLIT.split(txt)]
    if len(parts) == 1 and "،" in txt:
        parts = [clean(x).strip(" .") for x in txt.split("،")]
    if len(parts) == 1 and "," in txt and len(txt) > 60:
        parts = [clean(x).strip(" .") for x in txt.split(",")]
    seen, out = set(), []
    for x in parts:
        if x and x.lower() not in seen:
            seen.add(x.lower())
            out.append(x)
    return out


# ---------------------------------------------------------------------------
# Corps du document
# ---------------------------------------------------------------------------

def notes(zf, part):
    """id → texte des notes de bas de page (ou de fin)."""
    try:
        root = etree.fromstring(zf.read(part))
    except KeyError:
        return {}
    out = {}
    tag = W + ("footnote" if "footnote" in part else "endnote")
    for fn in root.iter(tag):
        if fn.get(W + "type") in ("separator", "continuationSeparator", "continuationNotice"):
            continue
        txt = clean(" ".join(clean(para_text(p)) for p in fn.iter(W + "p")))
        if txt:
            out[fn.get(W + "id")] = txt
    return out


def body_blocks(doc_root):
    """Blocs du corps après la page de garde :
    ('h2'|'h3'|'p'|'ref'|'table', texte ou lignes)."""
    body = doc_root.find(W + "body")
    children = list(body)
    start = 0
    for i, el in enumerate(children):
        if el.tag == W + "p" and el.find(W + "pPr/" + W + "sectPr") is not None:
            start = i + 1
            break
    marks = []
    blocks = []
    first_table = True
    for el in children[start:]:
        if el.tag == W + "p":
            raw = para_text(el, marks)
            txt = clean(raw.replace("\n", " "))
            if not txt:
                continue
            sizes, bold = run_props(el)
            sz = max(sizes) if sizes else 24
            st = style_of(el).lower()
            heading_style = st.startswith("heading") or st.startswith("titre") or st.startswith("title")
            plain = re.sub(r"\[\[(FN|EN):[^\]]+\]\]", "", txt)
            if (bold or heading_style) and len(plain) <= 200 and (sz >= 26 or heading_style):
                level = "h2" if (sz >= 28 or st in ("heading1", "titre1")) else "h3"
                blocks.append((level, txt))
            else:
                blocks.append(("p", txt))
        elif el.tag == W + "tbl":
            rows = []
            for tr in el.findall(W + "tr"):
                cells = []
                for tc in tr.findall(W + "tc"):
                    ctext = clean(" ".join(clean(para_text(p, marks)) for p in tc.iter(W + "p")))
                    cells.append(ctext)
                if any(cells):
                    rows.append(cells)
            if not rows:
                continue
            if first_table and len(rows) == 1 and len(rows[0]) == 1 and not blocks:
                blocks.append(("ref", rows[0][0]))
            else:
                blocks.append(("table", rows))
            first_table = False
    return blocks, marks


def plain(txt):
    return clean(re.sub(r"\[\[(FN|EN):[^\]]+\]\]", "", txt or ""))


def blocks_to_html(blocks, marks, footnotes, endnotes, lang):
    """HTML simple (titres, paragraphes, tableaux, notes) pour le site."""
    numbering = {}
    for kind, fid in marks:
        key = (kind, fid)
        if key not in numbering:
            numbering[key] = len(numbering) + 1

    def inline(txt):
        out = html.escape(txt, quote=False)

        def repl(m):
            kind = m.group(1).lower()
            n = numbering.get((kind, m.group(2)))
            return "<sup>%d</sup>" % n if n else ""

        return re.sub(r"\[\[(FN|EN):([^\]]+)\]\]", repl, out)

    parts = []
    for kind, val in blocks:
        if kind in ("h2", "h3"):
            parts.append("<%s>%s</%s>" % (kind, inline(val), kind))
        elif kind == "ref":
            parts.append("<p><strong>%s</strong></p>" % inline(val))
        elif kind == "p":
            parts.append("<p>%s</p>" % inline(val))
        elif kind == "table":
            rows = "".join(
                "<tr>%s</tr>" % "".join("<td>%s</td>" % inline(c) for c in row) for row in val
            )
            parts.append("<table>%s</table>" % rows)
    items = []
    for (kind, fid), n in sorted(numbering.items(), key=lambda kv: kv[1]):
        src = footnotes if kind == "fn" else endnotes
        txt = src.get(fid)
        if txt:
            items.append('<li value="%d">%s</li>' % (n, html.escape(txt, quote=False)))
    if items:
        parts.append("<h3>%s</h3><ol>%s</ol>" % ("الهوامش" if lang == "ar" else "Notes", "".join(items)))
    return "\n".join(parts)


def read_docx(path):
    """Ouvre un .docx et renvoie (cover, blocks, marks, footnotes, endnotes)."""
    with zipfile.ZipFile(path) as zf:
        root = etree.fromstring(zf.read("word/document.xml"))
        cv = cover(root)
        blocks, marks = body_blocks(root)
        fns = notes(zf, "word/footnotes.xml")
        ens = notes(zf, "word/endnotes.xml")
    return cv, blocks, marks, fns, ens


def body_fingerprint(path):
    """Texte brut du document (pour repérer les doublons)."""
    with zipfile.ZipFile(path) as zf:
        root = etree.fromstring(zf.read("word/document.xml"))
    return clean(" ".join(t.text or "" for t in root.iter(W + "t")))


# ---------------------------------------------------------------------------
# Copie de travail pour Word
# ---------------------------------------------------------------------------

def normalize(src_path, dst_path):
    """Écrit une copie corrigée pour la conversion PDF. Renvoie un dict de
    compteurs (persan, polices, parties renommées/supprimées)."""
    stats = {"persian": 0, "fonts": 0, "fixed_parts": 0, "dropped_parts": 0}
    with zipfile.ZipFile(src_path) as zin:
        names = zin.namelist()
        # Toutes les cibles référencées par un .rels
        referenced = set()
        rels = {}
        for n in names:
            if n.endswith(".rels"):
                rels[n] = zin.read(n)
                base = n.replace("_rels/", "").rsplit(".rels", 1)[0]
                folder = base.rsplit("/", 1)[0] + "/" if "/" in base else ""
                for m in re.finditer(rb'Target="([^"]+)"', rels[n]):
                    t = m.group(1).decode("utf-8")
                    if t.startswith("/"):
                        referenced.add(t.lstrip("/"))
                    else:
                        referenced.add(_join(folder, t))
        renames = {}
        drops = set()
        for n in names:
            if n.lower().endswith(".undefined"):
                data = zin.read(n)
                if n in referenced and data[:8] == b"\x89PNG\r\n\x1a\n":
                    renames[n] = n[: -len(".undefined")] + ".png"
                elif n not in referenced:
                    drops.add(n)
        undefined_left = any(
            n.lower().endswith(".undefined") and n not in renames and n not in drops for n in names
        )
        with zipfile.ZipFile(dst_path, "w", zipfile.ZIP_DEFLATED) as zout:
            for info in zin.infolist():
                n = info.filename
                if n in drops:
                    stats["dropped_parts"] += 1
                    continue
                data = zin.read(n)
                out_name = renames.get(n, n)
                if n in renames:
                    stats["fixed_parts"] += 1
                if n.endswith(".rels") and renames:
                    for old, new in renames.items():
                        data = data.replace(
                            old.rsplit("/", 1)[-1].encode("utf-8"), new.rsplit("/", 1)[-1].encode("utf-8")
                        )
                if n == "[Content_Types].xml":
                    data = _fix_content_types(data, bool(renames), not undefined_left)
                if n.startswith("word/") and n.endswith(".xml"):
                    txt = data.decode("utf-8")
                    c = len(PERSIAN_RE.findall(txt))
                    if c:
                        txt = to_arabic_letters(txt)
                        stats["persian"] += c
                    f = txt.count('"Traditional Arabic"')
                    if f:
                        txt = txt.replace('"Traditional Arabic"', '"Amiri"')
                        stats["fonts"] += f
                    data = txt.encode("utf-8")
                zi = zipfile.ZipInfo(out_name, date_time=info.date_time)
                zi.compress_type = zipfile.ZIP_DEFLATED
                zi.external_attr = info.external_attr
                zout.writestr(zi, data)
    return stats


def _join(folder, target):
    parts = (folder + target).split("/")
    out = []
    for p in parts:
        if p == "..":
            if out:
                out.pop()
        elif p and p != ".":
            out.append(p)
    return "/".join(out)


def _fix_content_types(data, need_png, drop_undefined):
    root = etree.fromstring(data)
    ns = "{%s}" % CT_NS
    exts = {d.get("Extension", "").lower(): d for d in root.findall(ns + "Default")}
    changed = False
    if need_png and "png" not in exts:
        el = etree.SubElement(root, ns + "Default")
        el.set("Extension", "png")
        el.set("ContentType", "image/png")
        changed = True
    if drop_undefined and "undefined" in exts:
        root.remove(exts["undefined"])
        changed = True
    if not changed:
        return data
    return etree.tostring(root, xml_declaration=True, encoding="UTF-8", standalone=True)
