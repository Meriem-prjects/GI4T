"""
arabic_pdf_transcribe.py — extraction texte de PDFs numériques (FR/AR)
avec gestion 2-colonnes JORT et réordonnancement Arabic visual-to-logical.

Usage:
    python arabic_pdf_transcribe.py input.pdf [output.txt] [lang]

Dépendances:
    pip install pymupdf

Couvre:
- PyMuPDF rawdict pour récupérer les bbox au niveau caractère
- Détection des PDF stockant l'arabe en ordre visuel (glyph-stream LTR)
  et reconstruction de l'ordre logique RTL
- Normalisation NFKC (Arabic Presentation Forms → lettres de base)
- Détection 2-colonnes par histogramme + reading order RTL/LTR
- Filtrage footers (numéros de page + ligne horizontale géométrique en bas)
"""

import re
import sys
import unicodedata
from dataclasses import dataclass
from pathlib import Path
from typing import List, Optional, Tuple

import fitz  # PyMuPDF

ARABIC_RANGE = re.compile(r"[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]")
ARABIC_PRESENTATION = re.compile(r"[ﭐ-﷿ﹰ-﻿]")

PAGE_NUMBER_PATTERNS = [
    re.compile(r"^[—–\s]*\d{1,5}[—–\s]*$"),
    re.compile(r"^(صفحة|Page)\s*\d+$", re.IGNORECASE),
    re.compile(r"^N\s*[°ᵒoO]\s*\d{1,5}$", re.IGNORECASE),
]


def normalize_ar(text: str) -> str:
    if not text:
        return text
    s = unicodedata.normalize("NFKC", text)
    s = re.sub(r"[ \t ‎‏‪-‮]+", " ", s)
    s = "\n".join(line.strip() for line in s.split("\n"))
    return s.strip("\n")


def visual_to_logical_arabic(text: str) -> str:
    if not text:
        return text
    reversed_text = text[::-1]
    return re.sub(
        r"[0-9A-Za-zÀ-ÿ]+(?:[.,:/-][0-9A-Za-zÀ-ÿ]+)*",
        lambda m: m.group(0)[::-1],
        reversed_text,
    )


def is_page_number_line(text: str) -> bool:
    t = text.strip()
    if not t or len(t) > 100:
        return False
    return any(p.match(t) for p in PAGE_NUMBER_PATTERNS)


@dataclass
class Block:
    bbox: Tuple[float, float, float, float]
    text: str

    @property
    def x0(self): return self.bbox[0]
    @property
    def y0(self): return self.bbox[1]
    @property
    def x1(self): return self.bbox[2]
    @property
    def y1(self): return self.bbox[3]
    @property
    def cx(self): return (self.x0 + self.x1) / 2
    @property
    def width(self): return self.x1 - self.x0


def detect_footer_separator_y(page) -> Optional[float]:
    h, w = page.rect.height, page.rect.width
    if h <= 0 or w <= 0:
        return None
    min_y = 0.85 * h
    min_w = 0.60 * w
    candidates: List[float] = []
    try:
        drawings = page.get_drawings()
    except Exception:
        return None
    for d in drawings:
        for item in d.get("items", []) or []:
            if not item:
                continue
            op = item[0]
            if op == "l" and len(item) >= 3:
                p0, p1 = item[1], item[2]
                x0, y0, x1, y1 = float(p0.x), float(p0.y), float(p1.x), float(p1.y)
            elif op == "re" and len(item) >= 2:
                r = item[1]
                x0, y0, x1, y1 = float(r.x0), float(r.y0), float(r.x1), float(r.y1)
                if abs(y1 - y0) > 2.0:
                    continue
            else:
                continue
            if abs(y1 - y0) > 1.0 or abs(x1 - x0) < min_w:
                continue
            ly = (y0 + y1) / 2.0
            if ly >= min_y:
                candidates.append(ly)
    return max(candidates) if candidates else None


def extract_blocks(page) -> List[Block]:
    raw = page.get_text("rawdict")
    plain = page.get_text("text")
    needs_visual_fix = bool(ARABIC_PRESENTATION.search(plain))
    footer_y = detect_footer_separator_y(page)

    def build_span_text(sp: dict) -> str:
        chars = sp.get("chars") or []
        if not chars:
            return sp.get("text", "")
        ordered = sorted(
            ((float(c.get("bbox", [0])[0] or 0.0), c.get("c", "")) for c in chars),
            key=lambda t: t[0],
        )
        s = "".join(c for _, c in ordered)
        s = unicodedata.normalize("NFKC", s)
        if needs_visual_fix and ARABIC_RANGE.search(s):
            s = visual_to_logical_arabic(s)
        return s

    blocks: List[Block] = []
    for b in raw.get("blocks", []):
        if b.get("type") != 0:
            continue
        bbox = tuple(b.get("bbox", [0, 0, 0, 0]))
        if footer_y is not None and float(bbox[1]) >= footer_y:
            continue
        line_texts: List[str] = []
        for line in b.get("lines", []):
            ldir = line.get("dir", [1, 0])
            if abs(ldir[1]) > 0.2:
                continue
            line_text = "".join(build_span_text(sp) for sp in line.get("spans", []))
            if not line_text.strip() or is_page_number_line(line_text):
                continue
            line_texts.append(line_text)
        if not line_texts:
            continue
        text = "\n".join(line_texts).strip()
        if text:
            blocks.append(Block(bbox=bbox, text=normalize_ar(text)))
    return blocks


def detect_gutter_x(blocks: List[Block], page_width: float) -> float:
    if len(blocks) < 4:
        return page_width / 2
    centers = sorted(b.cx for b in blocks)
    mid = len(centers) // 2
    low_max, high_min = centers[mid - 1], centers[mid]
    if (high_min - low_max) > page_width * 0.05:
        return (low_max + high_min) / 2
    return page_width / 2


def classify_side(b: Block, page_width: float, gutter: float) -> str:
    if b.width > page_width * 0.55:
        return "full"
    return "left" if b.cx <= gutter else "right"


def order_blocks(blocks: List[Block], page_width: float, language: str) -> List[Block]:
    if not blocks:
        return []
    gutter = detect_gutter_x(blocks, page_width)
    classified = [(b, classify_side(b, page_width, gutter)) for b in blocks]
    left = [b for b, c in classified if c == "left"]
    right = [b for b, c in classified if c == "right"]
    lh = sum((b.y1 - b.y0) for b in left)
    rh = sum((b.y1 - b.y0) for b in right)
    is_two_col = (
        len(left) + len(right) >= 2
        and len(left) >= 1 and len(right) >= 1
        and lh >= 200 and rh >= 200
    )
    if not is_two_col:
        return sorted(blocks, key=lambda b: (b.y0, -b.cx if language == "ar" else b.cx))

    full_items = sorted([b for b, c in classified if c == "full"], key=lambda b: b.y0)
    col_items = [b for b, c in classified if c != "full"]
    bands: List[Tuple[float, float]] = []
    cursor = 0.0
    for fi in full_items:
        if fi.y0 > cursor:
            bands.append((cursor, fi.y0))
        cursor = max(cursor, fi.y1)
    bands.append((cursor, float("inf")))

    ordered: List[Block] = []
    bi = fi_idx = 0
    while bi < len(bands) or fi_idx < len(full_items):
        if bi < len(bands):
            yt, yb = bands[bi]
            items = [b for b in col_items if yt <= b.y0 < yb]
            l_col = sorted([b for b in items if classify_side(b, page_width, gutter) == "left"], key=lambda b: b.y0)
            r_col = sorted([b for b in items if classify_side(b, page_width, gutter) == "right"], key=lambda b: b.y0)
            if language == "ar":
                ordered.extend(r_col)
                ordered.extend(l_col)
            else:
                ordered.extend(l_col)
                ordered.extend(r_col)
            bi += 1
        if fi_idx < len(full_items):
            ordered.append(full_items[fi_idx])
            fi_idx += 1
    return ordered


def transcribe_pdf(pdf_path: str, language: str = "ar") -> str:
    parts: List[str] = []
    with fitz.open(pdf_path) as doc:
        for page in doc:
            blocks = extract_blocks(page)
            blocks = order_blocks(blocks, page.rect.width, language)
            page_text = "\n\n".join(b.text for b in blocks if b.text.strip())
            if page_text:
                parts.append(page_text)
    return "\n\n".join(parts)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python arabic_pdf_transcribe.py input.pdf [output.txt] [lang=ar|fr]", file=sys.stderr)
        sys.exit(1)
    src = sys.argv[1]
    dst = sys.argv[2] if len(sys.argv) > 2 and not sys.argv[2].startswith("lang=") else None
    lang = "ar"
    for a in sys.argv[2:]:
        if a in ("ar", "fr", "auto"):
            lang = a
        elif a.startswith("lang="):
            lang = a.split("=", 1)[1]
    text = transcribe_pdf(src, lang)
    if dst:
        Path(dst).write_text(text, encoding="utf-8")
        print(f"OK {len(text)} chars -> {dst}", file=sys.stderr)
    else:
        sys.stdout.buffer.write(text.encode("utf-8"))
