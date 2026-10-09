"""Met en forme un document Word « brut » selon le modèle des documents ODF.

Le document produit reprend tout du modèle (page de garde avec les logos,
styles, marges, pied de page numéroté) et y verse le contenu de la source :
  - chaque paragraphe est classé (titre de niveau 1 à 3, légende, source,
    liste, référence bibliographique, texte) et reçoit la mise en forme ODF ;
  - les tableaux, les notes de bas de page, les listes numérotées, les
    formules et les images sont conservés ;
  - pour une version traduite, le texte de chaque paragraphe est remplacé
    par sa traduction (extract_units / translations), les notes, formules
    et images restant à leur place.

Utilisé par add_odf_docs.py. Python 3.7, lxml.
"""
import copy
import re
import zipfile

from lxml import etree

W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
R_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
M_NS = "http://schemas.openxmlformats.org/officeDocument/2006/math"
PR_NS = "http://schemas.openxmlformats.org/package/2006/relationships"
CT_NS = "http://schemas.openxmlformats.org/package/2006/content-types"
W, R, M, PR = "{%s}" % W_NS, "{%s}" % R_NS, "{%s}" % M_NS, "{%s}" % PR_NS
XML_SPACE = "{http://www.w3.org/XML/1998/namespace}space"

ARABIC_RE = re.compile("[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]")

# Mise en forme ODF (relevée sur les documents déjà publiés)
COLORS = {"text": "1F2430", "h1": "4A61E5", "h2": "23325F", "h3": "23325F", "caption": "23325F",
          "source": "5B6475", "rule": "FFD94D", "th_bg": "23325F", "row_line": "D7DCE8"}


def fonts(lang, family):
    if lang == "ar":
        return {"body": "Amiri", "head": "Cairo"}
    return {"body": "EB Garamond", "head": "Cairo" if family == "analyses" else "EB Garamond"}


# classe → (pPr, rPr) ; tailles en demi-points
SPEC = {
    "h1": dict(keep=True, rule=True, before=420, after=200, size=28, bold=True, color="h1", font="head"),
    "h2": dict(keep=True, before=320, after=140, size=26, bold=True, color="h2", font="head"),
    "h3": dict(keep=True, before=240, after=110, size=24, bold=True, color="h3", font="body"),
    "caption": dict(keep=True, before=240, after=120, size=22, bold=True, color="caption", font="head", jc="center"),
    "source": dict(before=40, after=160, size=19, italic=True, color="source", font="body"),
    "body": dict(after=150, line=320, size=24, color="text", font="body", jc="both", first=340),
    "list": dict(after=100, line=300, size=24, color="text", font="body", jc="both"),
    "ref": dict(after=110, line=280, size=21, color="text", font="body", jc="both"),
    "cell": dict(before=40, after=40, line=252, size=18, color="text", font="body"),
    "th": dict(before=40, after=40, line=252, size=18, bold=True, color="FFFFFF", font="body"),
    "note": dict(after=40, line=240, size=18, color="text", font="body", jc="both"),
    "formula": dict(before=120, after=120, size=24, color="text", font="body", jc="center"),
}

HEADING_STYLES = {
    "heading1": "h1", "titre1": "h1", "heading2": "h2", "titre2": "h2",
    "heading3": "h3", "titre3": "h3", "heading4": "h3", "titre4": "h3",
}
REF_HEADING_RE = re.compile(
    r"^(r[ée]f[ée]rences|bibliographie|renvois bibliographiques|sources juridiques|textes juridiques|"
    r"textes internationaux|internationales|tunisiennes|المراجع|مراجع|بعض المراجع|قائمة المراجع)",
    re.I)
CAPTION_RE = re.compile(r"^(tableau|figure|graphique|encadr[ée]|جدول|رسم|شكل)\s*\d", re.I)
SOURCE_RE = re.compile(r"^(source|sources|المصدر)\s*[:：]", re.I)
LOOKS_LIKE_REF = re.compile(r"\((19|20)\d\d[a-z]?\)|\b(19|20)\d\d\.\s|https?://|doi\.org", re.I)


def q(tag):
    p, n = tag.split(":")
    return "{%s}%s" % ({"w": W_NS, "r": R_NS, "m": M_NS}[p], n)


def el(tag, attrs=None, children=()):
    e = etree.Element(q(tag))
    for k, v in (attrs or {}).items():
        e.set(q(k), str(v))
    for c in children:
        e.append(c)
    return e


# ---------------------------------------------------------------------------
# Lecture de la source
# ---------------------------------------------------------------------------

def text_of(p):
    out = []
    for e in p.iter():
        if e.tag == W + "t":
            out.append(e.text or "")
        elif e.tag in (W + "tab",):
            out.append(" ")
        elif e.tag in (W + "br", W + "cr"):
            out.append("\n")
    return "".join(out)


def style_id(p):
    s = p.find(W + "pPr/" + W + "pStyle")
    return (s.get(W + "val") if s is not None else "").lower()


def all_bold(p):
    runs = [r for r in p.iter(W + "r") if "".join(t.text or "" for t in r.iter(W + "t")).strip()]
    if not runs:
        return False
    for r in runs:
        b = r.find(W + "rPr/" + W + "b")
        if b is None or b.get(W + "val", "true") in ("0", "false"):
            return False
    return True


def numbering_level(p):
    il = p.find(W + "pPr/" + W + "numPr/" + W + "ilvl")
    if p.find(W + "pPr/" + W + "numPr") is None:
        return None
    return int(il.get(W + "val", "0")) if il is not None else 0


def heading_level_from_text(t):
    t = t.strip()
    if re.match(r"^\d+\.\d+\.\d+", t):
        return "h3"
    if re.match(r"^(\d+\.\d+\.?|[A-Z]\d+\s*[-–—:.])\s", t):
        return "h2"
    if re.match(r"^([IVXLC]+\.|\d+\.|\d+\s*[-–—])\s", t):
        return "h1"
    return None


def classify(p, in_refs):
    t = text_of(p).strip()
    plain = re.sub(r"\s+", " ", t)
    st = style_id(p)
    has_math = p.find(".//" + M + "oMath") is not None or p.find(".//" + M + "oMathPara") is not None
    if not plain and has_math:
        return "formula"
    if not plain:
        return "empty"
    short = len(plain) <= 140 and not LOOKS_LIKE_REF.search(plain)
    if CAPTION_RE.match(plain) and len(plain) <= 200:
        return "caption"
    if SOURCE_RE.match(plain) and len(plain) <= 220:
        return "source"
    if st in HEADING_STYLES and short:
        return HEADING_STYLES[st]
    lvl = numbering_level(p)
    if short and all_bold(p) and not plain.endswith((".", ";", ",")):
        if lvl is not None:
            return "h1" if lvl == 0 else ("h2" if lvl == 1 else "h3")
        return heading_level_from_text(plain) or "h2"
    if in_refs:
        return "ref"
    if lvl is not None:
        return "list"
    return "body"


def content_paragraphs(body):
    """Paragraphes du corps dans l'ordre (y compris ceux des tableaux),
    contenus d'éventuels contrôles (w:sdt) compris."""
    for child in body:
        yield from _walk(child)


def _walk(node):
    if node.tag == W + "p":
        yield node
    elif node.tag == W + "tbl":
        for p in node.iter(W + "p"):
            yield p
    elif node.tag == W + "sdt":
        content = node.find(W + "sdtContent")
        if content is not None:
            for c in content:
                yield from _walk(c)


# ---------------------------------------------------------------------------
# Unités de traduction
# ---------------------------------------------------------------------------

def unit_text(p):
    """Texte d'un paragraphe avec des jetons pour ce qui n'est pas du texte :
    [[FN:n]] appel de note, [[MATH:k]] formule, [[IMG:k]] image, [[BR]] saut de ligne."""
    out, k_math, k_img = [], 0, 0
    for e in p.iter():
        tag = e.tag
        if tag == W + "t":
            parent_math = False
            out.append(e.text or "")
        elif tag == W + "tab":
            out.append(" ")
        elif tag in (W + "br", W + "cr"):
            out.append("[[BR]]")
        elif tag == W + "footnoteReference":
            out.append("[[FN:%s]]" % e.get(W + "id"))
        elif tag in (M + "oMath",) and e.getparent().tag != M + "oMathPara":
            out.append("[[MATH:%d]]" % k_math)
            k_math += 1
        elif tag == M + "oMathPara":
            out.append("[[MATH:%d]]" % k_math)
            k_math += 1
        elif tag == W + "drawing" or tag == W + "pict":
            out.append("[[IMG:%d]]" % k_img)
            k_img += 1
    txt = "".join(out)
    # le texte des formules est dans m:t, pas dans w:t : rien à retirer
    return re.sub(r"[ \t]+", " ", txt).strip()


A_NS = "http://schemas.openxmlformats.org/drawingml/2006/main"
C_NS = "http://schemas.openxmlformats.org/drawingml/2006/chart"
FIGURE_PART_RE = re.compile(r"^word/(charts/chart\d+|diagrams/(data|drawing)\d+)\.xml$")


def figure_texts(root):
    """Textes visibles d'un graphique ou d'un SmartArt (a:t, et c:v des
    libellés de catégories / séries)."""
    out = []
    for e in root.iter("{%s}t" % A_NS, "{%s}v" % C_NS):
        if e.tag == "{%s}v" % C_NS:
            # seulement les libellés (pas les valeurs numériques)
            anc = e.getparent()
            while anc is not None and anc.tag not in ("{%s}strCache" % C_NS, "{%s}numCache" % C_NS, "{%s}tx" % C_NS):
                anc = anc.getparent()
            if anc is None or anc.tag == "{%s}numCache" % C_NS:
                continue
        if (e.text or "").strip() and re.search(r"[A-Za-zÀ-ÿ]", e.text):
            out.append(e)
    return out


def extract_units(src_path, drop=None, replace=None):
    """Unités à traduire : corps (b<n>), notes (f<id>.<k>), textes des
    graphiques et SmartArt (g<n>, une fois chaque texte)."""
    drop = [re.compile(x, re.S) for x in (drop or [])]
    replace = [(re.compile(k, re.S), v) for k, v in (replace or {}).items()]
    with zipfile.ZipFile(src_path) as z:
        doc = etree.fromstring(z.read("word/document.xml"))
        notes = etree.fromstring(z.read("word/footnotes.xml")) if "word/footnotes.xml" in z.namelist() else None
        figures = [etree.fromstring(z.read(n)) for n in z.namelist() if FIGURE_PART_RE.match(n)]
    units = []
    body = doc.find(W + "body")
    for i, p in enumerate(content_paragraphs(body)):
        flat = re.sub(r"\s+", " ", text_of(p)).strip()
        if any(rx.search(flat) for rx in drop):
            continue
        t = unit_text(p)
        for rx, val in replace:
            if rx.search(flat):
                t = val
        # Rien à traduire dans une cellule faite de chiffres (montants, années…)
        if re.search(r"[A-Za-zÀ-ÿ؀-ۿ]", re.sub(r"\[\[[A-Z]+(:[^\]]+)?\]\]", "", t)):
            units.append({"id": "b%d" % i, "text": t, "in_table": _in_table(p)})
    if notes is not None:
        for fn in notes.iter(W + "footnote"):
            if fn.get(W + "type"):
                continue
            for k, p in enumerate(fn.iter(W + "p")):
                t = unit_text(p)
                if t.strip():
                    units.append({"id": "f%s.%d" % (fn.get(W + "id"), k), "text": t, "note": True})
    seen = {}
    for root in figures:
        for e in figure_texts(root):
            s = e.text.strip()
            if s not in seen:
                seen[s] = "g%d" % len(seen)
                units.append({"id": seen[s], "text": s, "figure": True})
    return units


def _in_table(p):
    a = p.getparent()
    while a is not None:
        if a.tag == W + "tbl":
            return True
        a = a.getparent()
    return False


# ---------------------------------------------------------------------------
# Mise en forme
# ---------------------------------------------------------------------------

def make_ppr(old_ppr, cls, lang, keep_num=True):
    spec = SPEC[cls]
    ppr = el("w:pPr")
    if spec.get("keep"):
        ppr.append(el("w:keepNext"))
    if keep_num and old_ppr is not None and cls in ("list", "ref", "h1", "h2", "h3"):
        num = old_ppr.find(W + "numPr")
        if num is not None:
            ppr.append(copy.deepcopy(num))
    if spec.get("rule"):
        ppr.append(el("w:pBdr", children=[el("w:bottom", {"w:val": "single", "w:sz": 14, "w:space": 1, "w:color": COLORS["rule"]})]))
    if lang == "ar":
        ppr.append(el("w:bidi"))
    sp = {"w:before": spec.get("before", 0), "w:after": spec.get("after", 0)}
    if spec.get("line"):
        sp.update({"w:line": spec["line"], "w:lineRule": "auto"})
    ppr.append(el("w:spacing", sp))
    if cls in ("list", "ref") and old_ppr is not None and old_ppr.find(W + "numPr") is not None:
        ind = old_ppr.find(W + "ind")
        if ind is not None:
            ppr.append(copy.deepcopy(ind))
    elif spec.get("first"):
        ppr.append(el("w:ind", {"w:firstLine": spec["first"]}))
    jc = spec.get("jc")
    if cls == "source":
        jc = "left" if lang == "ar" else "right"
    if jc:
        ppr.append(el("w:jc", {"w:val": jc}))
    return ppr


# Ordre imposé par le schéma OOXML (Word refuse un document mal ordonné)
RPR_ORDER = ["rStyle", "rFonts", "b", "bCs", "i", "iCs", "caps", "smallCaps", "strike", "dstrike", "outline",
             "shadow", "emboss", "imprint", "noProof", "snapToGrid", "vanish", "webHidden", "color", "spacing",
             "w", "kern", "position", "sz", "szCs", "highlight", "u", "effect", "bdr", "shd", "fitText",
             "vertAlign", "rtl", "cs", "em", "lang", "eastAsianLayout", "specVanish", "oMath"]


def sort_rpr(rpr):
    kids = list(rpr)
    for k in kids:
        rpr.remove(k)
    kids.sort(key=lambda e: RPR_ORDER.index(e.tag.split("}")[1]) if e.tag.split("}")[1] in RPR_ORDER else 99)
    seen = set()
    for k in kids:
        name = k.tag.split("}")[1]
        if name in seen:
            continue
        seen.add(name)
        rpr.append(k)
    return rpr


def make_rpr(cls, lang, family, old_rpr=None, text="", plain=False):
    """plain : ne pas reprendre le gras / l'italique de la source."""
    spec = SPEC[cls]
    f = fonts(lang, family)[spec["font"]]
    rpr = el("w:rPr")
    rpr.append(el("w:rFonts", {"w:ascii": f, "w:eastAsia": f, "w:hAnsi": f, "w:cs": f}))
    keep = old_rpr is not None and not plain
    bold = spec.get("bold") or (keep and _on(old_rpr, "b"))
    italic = spec.get("italic") or (keep and _on(old_rpr, "i"))
    if bold:
        rpr.append(el("w:b"))
        rpr.append(el("w:bCs"))
    if italic:
        rpr.append(el("w:i"))
        rpr.append(el("w:iCs"))
    color = COLORS.get(spec["color"], spec["color"])
    rpr.append(el("w:color", {"w:val": color}))
    size = spec["size"] + (2 if lang == "ar" and cls in ("body", "list", "ref", "cell", "th", "note") else 0)
    rpr.append(el("w:sz", {"w:val": size}))
    rpr.append(el("w:szCs", {"w:val": size}))
    if keep and _on(old_rpr, "u"):
        rpr.append(el("w:u", {"w:val": "single"}))
    if old_rpr is not None:
        va = old_rpr.find(W + "vertAlign")
        if va is not None:
            rpr.append(copy.deepcopy(va))
    if lang == "ar":
        rpr.append(el("w:rtl"))
    return sort_rpr(rpr)


def _on(rpr, name):
    e = rpr.find(W + name)
    if e is None:
        return False
    return e.get(W + "val", "true") not in ("0", "false", "none")


CAPTION_STYLES = ("lgende", "legende", "légende", "caption")


def restyle_paragraph(p, cls, lang, family, new_text=None, note_style=None):
    """Applique la mise en forme ODF à p (en place). new_text : texte traduit
    (jetons [[FN]], [[MATH]], [[IMG]], [[BR]] remis à leur place)."""
    # Un style « Légende » appliqué à de longs paragraphes les met en gras :
    # c'est un accident de mise en forme, on n'en garde pas le gras.
    plain = style_id(p) in CAPTION_STYLES and cls in ("body", "list", "ref")
    bold_all = all_bold(p)
    # Dans la version arabe, une entrée restée en langue d'origine (références)
    # s'écrit de gauche à droite, sinon ses parenthèses s'inversent.
    if lang == "ar" and cls in ("body", "list", "ref", "note"):
        t = new_text if new_text is not None else text_of(p)
        if re.search(r"[A-Za-zÀ-ÿ]{3}", t) and not re.search(r"[؀-ۿ]", t):
            lang = "fr"
    old_ppr = p.find(W + "pPr")
    if old_ppr is not None:
        p.remove(old_ppr)
    ppr = make_ppr(old_ppr, cls, lang)
    # Marque de paragraphe : donne aussi sa police aux numéros de liste/titre
    ppr.append(make_rpr(cls, lang, family, plain=True))
    p.insert(0, ppr)
    if new_text is None:
        _restyle_runs(p, cls, lang, family, note_style, plain)
    else:
        _replace_text(p, cls, lang, family, new_text, note_style, bold_all and not plain)


def _ref_rpr(cls, lang, family, note_style):
    rpr = make_rpr(cls, lang, family)
    if note_style:
        rpr.insert(0, el("w:rStyle", {"w:val": note_style}))
    if rpr.find(W + "vertAlign") is None:
        rpr.append(el("w:vertAlign", {"w:val": "superscript"}))
    return sort_rpr(rpr)


def _restyle_runs(p, cls, lang, family, note_style, plain=False):
    for r in list(p.iter(W + "r")):
        if r.getparent() is not None and r.getparent().tag.startswith(M):
            continue
        old = r.find(W + "rPr")
        is_ref = r.find(W + "footnoteReference") is not None or r.find(W + "footnoteRef") is not None
        if old is not None:
            r.remove(old)
        if is_ref:
            rpr = _ref_rpr(cls, lang, family, note_style)
        else:
            rpr = make_rpr(cls, lang, family, old, plain=plain)
        r.insert(0, rpr)
    # commentaires et marques de relecture : retirés
    for tag in ("commentRangeStart", "commentRangeEnd", "proofErr"):
        for e in list(p.iter(W + tag)):
            e.getparent().remove(e)
    for e in list(p.iter(W + "r")):
        if e.find(W + "commentReference") is not None:
            e.getparent().remove(e)


def _replace_text(p, cls, lang, family, new_text, note_style, bold_all=False):
    keep = {}
    k_math = k_img = 0
    for e in list(p.iter()):
        if e.tag == W + "footnoteReference":
            keep["FN:%s" % e.get(W + "id")] = e.getparent()
        elif e.tag == M + "oMathPara" or (e.tag == M + "oMath" and e.getparent().tag != M + "oMathPara"):
            keep["MATH:%d" % k_math] = e
            k_math += 1
        elif e.tag in (W + "drawing", W + "pict"):
            keep["IMG:%d" % k_img] = e.getparent() if e.getparent().tag == W + "r" else e
            k_img += 1
    for child in list(p):
        if child.tag != W + "pPr":
            p.remove(child)
    # Gras de la source repris seulement si tout le paragraphe l'était
    text_rpr = make_rpr(cls, lang, family)
    if bold_all and text_rpr.find(W + "b") is None:
        text_rpr.append(el("w:b"))
        text_rpr.append(el("w:bCs"))
        sort_rpr(text_rpr)
    for piece in re.split(r"(\[\[[A-Z]+(?::[^\]]+)?\]\])", new_text):
        if not piece:
            continue
        m = re.fullmatch(r"\[\[([A-Z]+)(?::([^\]]+))?\]\]", piece)
        if m and m.group(1) == "BR":
            p.append(el("w:r", children=[el("w:br")]))
            continue
        if m:
            key = "%s:%s" % (m.group(1), m.group(2))
            node = keep.pop(key, None)
            if node is None:
                continue
            if node.tag == W + "r":
                old = node.find(W + "rPr")
                if old is not None:
                    node.remove(old)
                rpr = _ref_rpr(cls, lang, family, note_style) if m.group(1) == "FN" else make_rpr(cls, lang, family)
                node.insert(0, rpr)
            p.append(node)
            continue
        r = el("w:r", children=[copy.deepcopy(text_rpr)])
        t = el("w:t")
        t.text = piece
        t.set(XML_SPACE, "preserve")
        r.append(t)
        p.append(r)
    # Jetons oubliés par la traduction : on remet les éléments en fin de paragraphe
    for node in keep.values():
        p.append(node)


def restyle_table(tbl, lang, family, translations, index_of, note_style):
    tpr = tbl.find(W + "tblPr")
    if tpr is None:
        tpr = el("w:tblPr")
        tbl.insert(0, tpr)
    for name in ("tblStyle", "tblBorders", "bidiVisual", "tblLook", "shd"):
        for e in tpr.findall(W + name):
            tpr.remove(e)
    if lang == "ar":
        tpr.insert(0, el("w:bidiVisual"))
    borders = el("w:tblBorders", children=[
        el("w:top", {"w:val": "single", "w:sz": 8, "w:space": 0, "w:color": COLORS["th_bg"]}),
        el("w:left", {"w:val": "nil"}),
        el("w:bottom", {"w:val": "single", "w:sz": 8, "w:space": 0, "w:color": COLORS["th_bg"]}),
        el("w:right", {"w:val": "nil"}),
        el("w:insideH", {"w:val": "single", "w:sz": 4, "w:space": 0, "w:color": COLORS["row_line"]}),
        el("w:insideV", {"w:val": "single", "w:sz": 4, "w:space": 0, "w:color": COLORS["row_line"]}),
    ])
    _insert_in_order(tpr, borders, ["tblStyle", "tblpPr", "tblOverlap", "bidiVisual", "tblStyleRowBandSize",
                                    "tblStyleColBandSize", "tblW", "jc", "tblCellSpacing", "tblInd", "tblBorders"])
    rows = tbl.findall(W + "tr")
    for ri, tr in enumerate(rows):
        header = ri == 0 and len(rows) > 1
        for tc in tr.findall(W + "tc"):
            tcpr = tc.find(W + "tcPr")
            if tcpr is None:
                tcpr = el("w:tcPr")
                tc.insert(0, tcpr)
            for e in tcpr.findall(W + "shd"):
                tcpr.remove(e)
            for e in tcpr.findall(W + "tcBorders"):
                tcpr.remove(e)
            if header:
                _insert_in_order(tcpr, el("w:shd", {"w:val": "clear", "w:color": "auto", "w:fill": COLORS["th_bg"]}),
                                 ["cnfStyle", "tcW", "gridSpan", "hMerge", "vMerge", "tcBorders", "shd"])
            for p in tc.iter(W + "p"):
                if p.getparent().tag != W + "tc":
                    continue
                uid = index_of.get(id(p))
                new_text = translations.get(uid) if translations and uid else None
                restyle_paragraph(p, "th" if header else "cell", lang, family, new_text, note_style)


def _insert_in_order(parent, new, order):
    """Insère new dans parent en respectant l'ordre du schéma (approximatif)."""
    name = new.tag.split("}")[1]
    idx = order.index(name) if name in order else len(order)
    pos = 0
    for i, child in enumerate(parent):
        cname = child.tag.split("}")[1]
        if cname in order and order.index(cname) < idx:
            pos = i + 1
    parent.insert(pos, new)


# ---------------------------------------------------------------------------
# Page de garde
# ---------------------------------------------------------------------------

def _set_par_text(p, text, size=None, bold=None):
    runs = [r for r in p.findall(W + "r") if r.find(W + "t") is not None]
    if not runs:
        return
    first = runs[0]
    for r in runs[1:]:
        p.remove(r)
    ts = first.findall(W + "t")
    for t in ts[1:]:
        first.remove(t)
    ts[0].text = text
    ts[0].set(XML_SPACE, "preserve")
    rpr = first.find(W + "rPr")
    if rpr is not None and size:
        for tag in ("sz", "szCs"):
            e = rpr.find(W + tag)
            if e is not None:
                e.set(W + "val", str(size))
    if rpr is not None and bold is False:
        for tag in ("b", "bCs"):
            e = rpr.find(W + tag)
            if e is not None:
                rpr.remove(e)


def fill_cover(tbl, cover, lang):
    """cover : label, title, subtitle, author, affiliation, keywords (liste)."""
    rows = tbl.findall(W + "tr")
    roles = {}
    for ri, tr in enumerate(rows):
        for p in tr.iter(W + "p"):
            t = text_of(p).strip()
            if not t:
                continue
            sizes = [int(s.get(W + "val")) for s in p.iter(W + "sz") if s.get(W + "val", "").isdigit()]
            sz = max(sizes) if sizes else 0
            if ri >= 2 or re.match(r"^\s*(mots?[- ]cl|الكلمات|كلمات)", t, re.I):
                roles.setdefault("keywords", p)
            elif "|" in t:
                roles.setdefault("label", p)
            elif sz >= 38:
                roles.setdefault("title", p)
            elif 26 <= sz <= 31:
                roles.setdefault("subtitle", p)
            elif 32 <= sz <= 36:
                roles.setdefault("author", p)
            else:
                roles.setdefault("affiliation", p)
    title = cover["title"]
    n = len(title)
    size = 54 if n <= 45 else (46 if n <= 90 else 40)
    _set_par_text(roles["label"], cover["label"])
    _set_par_text(roles["title"], title, size=size)
    # Sous-titre : paragraphe existant ou copie du titre en plus petit
    if cover.get("subtitle"):
        sub = roles.get("subtitle")
        if sub is None:
            sub = copy.deepcopy(roles["title"])
            roles["title"].addnext(sub)
        _set_par_text(sub, cover["subtitle"], size=30, bold=False)
    elif roles.get("subtitle") is not None:
        roles["subtitle"].getparent().remove(roles["subtitle"])
    for key in ("author", "affiliation"):
        p = roles.get(key)
        if p is None:
            continue
        if cover.get(key):
            _set_par_text(p, cover[key])
        else:
            _set_par_text(p, "")
    kp = roles.get("keywords")
    if kp is not None:
        runs = [r for r in kp.findall(W + "r") if r.find(W + "t") is not None]
        kws = cover.get("keywords") or []
        if not kws:
            for r in runs:
                kp.remove(r)
        else:
            sep = " ؛ " if lang == "ar" else " ; "
            label = "كلمات مفاتيح: " if lang == "ar" else "Mots-clés : "
            if len(runs) >= 2:
                _first_text(runs[0], label)
                _first_text(runs[1], sep.join(kws))
                for r in runs[2:]:
                    kp.remove(r)
            elif runs:
                _first_text(runs[0], label + sep.join(kws))


def _first_text(r, text):
    ts = r.findall(W + "t")
    for t in ts[1:]:
        r.remove(t)
    ts[0].text = text
    ts[0].set(XML_SPACE, "preserve")


# ---------------------------------------------------------------------------
# Construction du .docx
# ---------------------------------------------------------------------------

def _style_id_by_name(styles_xml, name):
    root = etree.fromstring(styles_xml)
    for s in root.iter(W + "style"):
        n = s.find(W + "name")
        if n is not None and n.get(W + "val", "").lower() == name:
            return s.get(W + "styleId")
    return None


def _join_path(folder, target):
    if target.startswith("/"):
        return target.lstrip("/")
    parts = (folder + "/" + target).split("/")
    out = []
    for p in parts:
        if p == "..":
            if out:
                out.pop()
        elif p and p != ".":
            out.append(p)
    return "/".join(out)


def _relative(src_folder, dest_part, dest_folder):
    """Chemin de dest_part relatif au dossier dest_folder (pour un .rels)."""
    a = dest_folder.split("/")
    b = dest_part.split("/")
    i = 0
    while i < min(len(a), len(b) - 1) and a[i] == b[i]:
        i += 1
    return "/".join([".."] * (len(a) - i) + b[i:])


def _translate_figure(data, figure_map, diagram=False):
    root = etree.fromstring(data)
    for e in figure_texts(root):
        s = e.text.strip()
        if s in figure_map:
            lead = e.text[: len(e.text) - len(e.text.lstrip())]
            trail = e.text[len(e.text.rstrip()):]
            e.text = lead + figure_map[s] + trail
    # Texte arabe : sens de lecture de droite à gauche dans les zones de texte
    for bp in root.iter("{%s}bodyPr" % A_NS):
        bp.set("rtlCol", "1")
    for p in root.iter("{%s}p" % A_NS):
        pp = p.find("{%s}pPr" % A_NS)
        if pp is None:
            pp = etree.Element("{%s}pPr" % A_NS)
            p.insert(0, pp)
        pp.set("rtl", "1")
        if diagram and pp.get("algn") in (None, "l"):
            pp.set("algn", "r")
    # Word place les parenthèses selon la langue des segments : arabe partout
    for rp in root.iter("{%s}rPr" % A_NS, "{%s}endParaRPr" % A_NS, "{%s}defRPr" % A_NS):
        if rp.tag != "{%s}defRPr" % A_NS or rp.get("lang"):
            rp.set("lang", "ar-SA")
    return etree.tostring(root, xml_declaration=True, encoding="UTF-8", standalone=True)


class _Tracked(dict):
    """Traductions : retient les unités effectivement utilisées."""
    def __init__(self, d):
        super().__init__(d)
        self.used = set()

    def get(self, k, default=None):
        self.used.add(k)
        return super().get(k, default)


def build(src_path, template_path, out_path, lang, family, cover, drop=None, replace=None,
          translations=None, figure_map=None):
    """drop : liste de regex — paragraphes à retirer (titre, auteur, mots-clés
    repris sur la page de garde, texte parasite). replace : {regex: texte}."""
    drop = [re.compile(x, re.S) for x in (drop or [])]
    replace = [(re.compile(k, re.S), v) for k, v in (replace or {}).items()]
    if translations:
        translations = _Tracked(translations)
    zs = zipfile.ZipFile(src_path)
    zt = zipfile.ZipFile(template_path)
    s_doc = etree.fromstring(zs.read("word/document.xml"))
    t_doc = etree.fromstring(zt.read("word/document.xml"))
    s_body = s_doc.find(W + "body")
    t_body = t_doc.find(W + "body")

    note_style = (_style_id_by_name(zt.read("word/styles.xml"), "footnote reference")
                  or _style_id_by_name(zt.read("word/styles.xml"), "appel note de bas de p."))

    # Identifiants des paragraphes (mêmes numéros que extract_units)
    # (la liste garde les objets lxml en vie : sinon leur id() change)
    s_paras = list(content_paragraphs(s_body))
    index_of = {}
    for i, p in enumerate(s_paras):
        index_of[id(p)] = "b%d" % i

    # 1. Page de garde du modèle
    cover_tbl = copy.deepcopy(t_body[0])
    fill_cover(cover_tbl, cover, lang)
    cover_break = None
    for child in t_body:
        if child.tag == W + "p" and child.find(W + "pPr/" + W + "sectPr") is not None:
            cover_break = copy.deepcopy(child)
            break
    final_sect = copy.deepcopy(t_body.find(W + "sectPr"))

    # 2. Corps de la source, mis en forme. Sans aucun titre de niveau 1
    #    (titres tous en gras simple), on remonte chaque niveau d'un cran.
    has_h1 = False
    for p in content_paragraphs(s_body):
        if p.getparent().tag == W + "tc":
            continue
        t = re.sub(r"\s+", " ", text_of(p)).strip()
        if t and not any(rx.search(t) for rx in drop) and classify(p, False) == "h1":
            has_h1 = True
            break
    promote = {"h2": "h1", "h3": "h2"} if not has_h1 else {}
    new_children = []
    in_refs = False
    for child in list(s_body):
        if child.tag == W + "sectPr":
            continue
        if child.tag == W + "sdt":
            content = child.find(W + "sdtContent")
            items = list(content) if content is not None else []
        else:
            items = [child]
        for node in items:
            if node.tag == W + "p":
                t = re.sub(r"\s+", " ", text_of(node)).strip()
                if any(rx.search(t) for rx in drop):
                    continue
                for rx, val in replace:
                    if rx.search(t):
                        uid = index_of.get(id(node))
                        if translations is None:
                            _collapse_text(node, val)
                        break
                sect = node.find(W + "pPr/" + W + "sectPr")
                if sect is not None:
                    sect.getparent().remove(sect)
                cls = classify(node, in_refs)
                cls = promote.get(cls, cls)
                if cls == "empty":
                    if node.find(".//" + W + "drawing") is None and node.find(".//" + W + "pict") is None:
                        continue
                    cls = "body"
                if cls in ("h1", "h2"):
                    in_refs = bool(REF_HEADING_RE.match(t)) or (in_refs and cls == "h2" and len(t) < 60)
                if cls == "body" and node.find(".//" + W + "drawing") is not None:
                    cls = "formula"  # paragraphe d'image : centré
                uid = index_of.get(id(node))
                new_text = translations.get(uid) if translations and uid else None
                restyle_paragraph(node, cls, lang, family, new_text, note_style)
                new_children.append(node)
            elif node.tag == W + "tbl":
                restyle_table(node, lang, family, translations, index_of, note_style)
                new_children.append(node)
                # Un paragraphe vide après un tableau évite deux tableaux collés
                spacer = el("w:p", children=[make_ppr(None, "source", lang)])
                new_children.append(spacer)
            elif node.tag in (W + "bookmarkStart", W + "bookmarkEnd"):
                new_children.append(node)

    # 3. Assemblage du document
    for child in list(t_body):
        t_body.remove(child)
    t_body.append(cover_tbl)
    t_body.append(cover_break)
    for c in new_children:
        t_body.append(c)
    t_body.append(final_sect)

    # 4. Relations du corps importé (liens, images, graphiques, SmartArt) :
    #    nouvelles relations et copie des parties liées (et de leurs dépendances)
    t_rels = etree.fromstring(zt.read("word/_rels/document.xml.rels"))
    s_rels = etree.fromstring(zs.read("word/_rels/document.xml.rels"))
    rel_attrs = [R + "id", R + "embed", R + "link", R + "dm", R + "lo", R + "qs", R + "cs"]
    used = set()
    for c in new_children:
        for e in c.iter():
            for attr in rel_attrs:
                if e.get(attr):
                    used.add(e.get(attr))
    # Les SmartArt désignent leur dessin par une relation du document citée
    # dans la partie de données (dataModelExt relId="…")
    s_rel_by_id = {r.get("Id"): r for r in s_rels}
    for rid in list(used):
        r = s_rel_by_id.get(rid)
        if r is not None and r.get("Type", "").endswith("/diagramData"):
            part = _join_path("word", r.get("Target"))
            if part in zs.namelist():
                used.update(re.findall(r'relId="([^"]+)"', zs.read(part).decode("utf-8")))
    t_ids = {r.get("Id") for r in t_rels}
    t_names = set(zt.namelist())
    remap, media = {}, {}
    copied = {}  # partie source → partie destination

    def part_target(base_dir, target):
        return _join_path(base_dir, target)

    def copy_part(src_part):
        """Copie une partie et, récursivement, les parties qu'elle référence."""
        if src_part in copied:
            return copied[src_part]
        dest = src_part
        if dest in t_names:  # collision avec le modèle (ex. word/media/image1.png)
            folder, name = dest.rsplit("/", 1)
            dest = "%s/odf_%s" % (folder, name)
        copied[src_part] = dest
        data = zs.read(src_part)
        if figure_map and FIGURE_PART_RE.match(src_part):
            data = _translate_figure(data, figure_map, diagram="/diagrams/" in "/" + src_part)
        media[dest] = data
        folder, name = src_part.rsplit("/", 1)
        rels_name = "%s/_rels/%s.rels" % (folder, name)
        if rels_name in zs.namelist():
            rels = etree.fromstring(zs.read(rels_name))
            for rel in rels:
                if rel.get("TargetMode") == "External":
                    continue
                sub = part_target(folder, rel.get("Target"))
                if sub in zs.namelist():
                    new_sub = copy_part(sub)
                    rel.set("Target", _relative(folder, new_sub, dest.rsplit("/", 1)[0]))
            dfolder, dname = dest.rsplit("/", 1)
            media["%s/_rels/%s.rels" % (dfolder, dname)] = etree.tostring(rels, xml_declaration=True, encoding="UTF-8", standalone=True)
        return dest

    for r in s_rels:
        rid = r.get("Id")
        if rid not in used:
            continue
        new_id = "rIdOdf%d" % (len(remap) + 1)
        while new_id in t_ids:
            new_id += "x"
        nr = copy.deepcopy(r)
        nr.set("Id", new_id)
        if r.get("TargetMode") != "External":
            src_part = part_target("word", r.get("Target"))
            if src_part not in zs.namelist():
                continue
            dest = copy_part(src_part)
            nr.set("Target", dest[len("word/"):] if dest.startswith("word/") else "/" + dest)
        t_rels.append(nr)
        remap[rid] = new_id
    # Les identifiants de la page de garde viennent du modèle : on ne remappe
    # que dans le corps importé.
    for c in new_children:
        for e in c.iter():
            for attr in rel_attrs:
                v = e.get(attr)
                if v and v in remap:
                    e.set(attr, remap[v])
    for dest in list(media):
        if re.match(r"^word/diagrams/(odf_)?data\d+\.xml$", dest):
            txt = media[dest].decode("utf-8")
            txt = re.sub(r'relId="([^"]+)"', lambda m: 'relId="%s"' % remap.get(m.group(1), m.group(1)), txt)
            media[dest] = txt.encode("utf-8")
    # Identifiants de dessins uniques (docPr id)
    max_id = 1000
    for d in t_body.iter("{http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing}docPr"):
        max_id += 1
        d.set("id", str(max_id))

    # 5. Notes de bas de page
    files = {}
    if "word/footnotes.xml" in zs.namelist():
        s_notes = etree.fromstring(zs.read("word/footnotes.xml"))
        t_notes = etree.fromstring(zt.read("word/footnotes.xml")) if "word/footnotes.xml" in zt.namelist() else None
        if t_notes is not None:
            for fn in list(t_notes.iter(W + "footnote")):
                if not fn.get(W + "type"):
                    t_notes.remove(fn)
            for fn in s_notes.iter(W + "footnote"):
                if fn.get(W + "type"):
                    continue
                fn = copy.deepcopy(fn)
                for k, p in enumerate(fn.iter(W + "p")):
                    uid = "f%s.%d" % (fn.get(W + "id"), k)
                    new_text = translations.get(uid) if translations else None
                    restyle_paragraph(p, "note", lang, family, new_text, note_style)
                t_notes.append(fn)
            files["word/footnotes.xml"] = etree.tostring(t_notes, xml_declaration=True, encoding="UTF-8", standalone=True)
            if "word/_rels/footnotes.xml.rels" in zs.namelist():
                files["word/_rels/footnotes.xml.rels"] = zs.read("word/_rels/footnotes.xml.rels")

    # 6. Numérotation des listes : celle de la source
    if "word/numbering.xml" in zs.namelist():
        files["word/numbering.xml"] = zs.read("word/numbering.xml")

    files["word/document.xml"] = etree.tostring(t_doc, xml_declaration=True, encoding="UTF-8", standalone=True)
    files["word/_rels/document.xml.rels"] = etree.tostring(t_rels, xml_declaration=True, encoding="UTF-8", standalone=True)
    files.update(media)

    # 7. Écriture : le modèle, avec les parties remplacées
    ct = etree.fromstring(zt.read("[Content_Types].xml"))
    s_ct = etree.fromstring(zs.read("[Content_Types].xml"))
    s_over = {o.get("PartName"): o.get("ContentType") for o in s_ct.findall("{%s}Override" % CT_NS)}
    s_def = {d.get("Extension", "").lower(): d.get("ContentType") for d in s_ct.findall("{%s}Default" % CT_NS)}
    t_over = {o.get("PartName") for o in ct.findall("{%s}Override" % CT_NS)}
    exts = {d.get("Extension", "").lower() for d in ct.findall("{%s}Default" % CT_NS)}
    for src_part, dest in copied.items():
        ctype = s_over.get("/" + src_part)
        if ctype and "/" + dest not in t_over:
            o = etree.SubElement(ct, "{%s}Override" % CT_NS)
            o.set("PartName", "/" + dest)
            o.set("ContentType", ctype)
            t_over.add("/" + dest)
        ext = dest.rsplit(".", 1)[-1].lower()
        if not ctype and ext not in exts:
            d = etree.SubElement(ct, "{%s}Default" % CT_NS)
            d.set("Extension", ext)
            d.set("ContentType", s_def.get(ext) or {"png": "image/png", "jpg": "image/jpeg", "jpeg": "image/jpeg",
                                                     "emf": "image/x-emf", "wmf": "image/x-wmf", "gif": "image/gif",
                                                     "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                                     }.get(ext, "application/octet-stream"))
            exts.add(ext)
    if "word/numbering.xml" in files and not any(o.get("PartName") == "/word/numbering.xml" for o in ct):
        o = etree.SubElement(ct, "{%s}Override" % CT_NS)
        o.set("PartName", "/word/numbering.xml")
        o.set("ContentType", "application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml")
    files["[Content_Types].xml"] = etree.tostring(ct, xml_declaration=True, encoding="UTF-8", standalone=True)

    if translations:
        unused = sorted(k for k in translations if k[:1] in ("b", "f") and k not in translations.used)
        if unused:
            raise RuntimeError("%d traduction(s) non appliquée(s), ex. %s" % (len(unused), unused[:5]))

    with zipfile.ZipFile(out_path + ".part", "w", zipfile.ZIP_DEFLATED) as zout:
        written = set()
        for info in zt.infolist():
            name = info.filename
            if name in files:
                zout.writestr(name, files[name])
            else:
                zout.writestr(info, zt.read(name))
            written.add(name)
        for name, data in files.items():
            if name not in written:
                zout.writestr(name, data)
    import os
    os.replace(out_path + ".part", out_path)


def _collapse_text(p, text):
    runs = [r for r in p.iter(W + "r") if r.find(W + "t") is not None]
    if not runs:
        return
    for r in runs[1:]:
        r.getparent().remove(r)
    ts = runs[0].findall(W + "t")
    for t in ts[1:]:
        runs[0].remove(t)
    ts[0].text = text
    for br in list(p.iter(W + "br")):
        br.getparent().remove(br)
