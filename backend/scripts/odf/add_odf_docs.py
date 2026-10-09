"""Ajout de nouveaux documents ODF à partir de fichiers Word « bruts » :
mise en page et page de garde ODF (build_odf_docx.py), et pour les articles
qui n'existent qu'en français, traduction arabe paragraphe par paragraphe.

  py -I add_odf_docs.py extract   → _traduction/<clé>.units.json (textes à traduire)
  py -I add_odf_docs.py build     → documents mis en forme, rangés dans
                                    « Documents avec page de garde/<type>/<langue>/ »
                                    (versions arabes : _traduction/<clé>.ar.NNN.json
                                    et, pour corriger à la main, <clé>.ar.json)

Ensuite : prepare_odf_books.py puis publish-odf-books.ts, comme pour les autres.
"""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import build_odf_docx as bx  # noqa: E402

ROOT = r"C:\Users\wassim.ayari\Desktop\ODF_Mise_en_forme_fiches"
SRC = os.path.join(ROOT, "Documents avec page de garde")
TRAD = os.path.join(ROOT, "_traduction")

TEMPLATES = {
    ("analyses", "fr"): r"Analyses juridiques\Français\Analyse_Juridique_ODF_Droit_a_l_eau_FR.docx",
    ("analyses", "ar"): r"Analyses juridiques\Arabe\Analyse_Juridique_ODF_Droit_a_l_eau.docx",
    ("articles", "fr"): r"Articles\Français\Article 3 Jaballah droit à la propriété et intéret collectif .docx",
    ("articles", "ar"): r"Articles\Arabe\Article 3 Jaballah droit à la propriété et intéret collectif _AR.docx",
}
LABELS = {
    "analyses": {"fr": "Analyse juridique   |   تحليل قانوني", "ar": "تحليل قانوني   |   Analyse juridique"},
    "articles": {"fr": "Article   |   مقال", "ar": "مقال   |   Article"},
}
FOLDERS = {"analyses": "Analyses juridiques", "articles": "Approche économique"}

DOCS = [
    {
        "key": "ferchichi-juge-garant",
        "family": "analyses",
        "stem": "Analyse_Juridique_ODF_Juge_garant_droits_libertes_Wahid_Ferchichi",
        "src": {"fr": "Le juge et les DH par W. FERCHICHI 4 oct 26 (2).docx", "ar": "حامي الحقوق والحرّيات (1).docx"},
        "cover": {
            "fr": {"title": "« Le juge garant des droits et libertés »",
                   "subtitle": "Les juridictions et l’appropriation de leur rôle constitutionnel",
                   "author": "Wahid Ferchichi",
                   "affiliation": "Professeur en droit public à l’Université de Carthage, doyen de la Faculté des sciences juridiques, politiques et sociales de Tunis"},
            "ar": {"title": "« حامي الحقوق والحرّيات »",
                   "subtitle": "هل استبطن القاضي دوره الدستوري؟",
                   "author": "وحيد الفرشيشي",
                   "affiliation": "أستاذ القانون العام بجامعة قرطاج، عميد كلية العلوم القانونية والسياسية والاجتماعية بتونس"},
        },
        "drop": {
            "fr": [r"^« Le juge garant des droits et libertés » :?$", r"^Les juridictions et l.appropriation de leur rôle constitutionnel$",
                   r"^Wahid Ferchichi$", r"^Professeur en Droit public, Université de Carthage,?$", r"^Doyen de la Faculté des sciences juridiques"],
            "ar": [r"^\"حامي الحقوق والحرّيات\":?$", r"^هل استبطن القاضي دوره الدستوري؟$", r"^د\.\s*وحيد الفرشيشي$",
                   r"^أستاذ القانون العام بجامعة قرطاج$", r"^عميد كلية العلوم القانونية والسياسية والاجتماعية بتونس$"],
        },
    },
    {
        "key": "krichene-eau-irrigation",
        "family": "articles",
        "stem": "Krichene_Transmission_dette_acces_eau_irrigation_Borj_Touil",
        "src": {"fr": r"Hazem Krichene\Hazem Krichene\Article_droit_eau_HK.docx"},
        "cover": {
            "fr": {"title": "Transmission de la dette et accès à l’eau d’irrigation : cas du Borj Touil",
                   "author": "Hazem Krichene",
                   "keywords": ["droit à l’eau", "irrigation", "dette contractuelle", "indivision", "analyse économique du droit", "Tunisie"]},
            "ar": {"title": "انتقال الدَّين والنفاذ إلى مياه الريّ: حالة برج الطويل",
                   "author": "حازم كريشان",
                   "keywords": ["الحق في الماء", "الريّ", "الدَّين التعاقدي", "الشيوع", "التحليل الاقتصادي للقانون", "تونس"]},
        },
        "drop": {"fr": [r"^Transmission de la dette et accès à l.eau d.irrigation", r"^Hazem Krichene$", r"^Mots-clés\s*:"]},
    },
    {
        "key": "krichene-poursuite-etudes",
        "family": "articles",
        "stem": "Krichene_Economie_droit_poursuite_etudes",
        "src": {"fr": r"Hazem Krichene\Hazem Krichene\droit_education_HK.docx"},
        "cover": {
            "fr": {"title": "L’économie du droit à la poursuite des études",
                   "author": "Hazem Krichene",
                   "keywords": ["droit à l’éducation", "poursuite des études", "analyse coût-bénéfice", "rendement de l’éducation"]},
            "ar": {"title": "اقتصاد الحقّ في مواصلة الدراسة",
                   "author": "حازم كريشان",
                   "keywords": ["الحق في التعليم", "مواصلة الدراسة", "تحليل الكلفة والمنفعة", "مردودية التعليم"]},
        },
        "drop": {"fr": [r"^L.économie du droit à la poursuite des études$", r"^Hazem Krichene$", r"^Mots-clés\s*:?$",
                        r"^Droit à l.éducation ; poursuite des études"]},
    },
    {
        "key": "ben-hassine-travail",
        "family": "articles",
        "stem": "Ben_Hassine_Analyse_economique_droit_au_travail",
        "src": {"fr": r"Hela Ben Hassine\Hela Ben Hassine\Analyse Economique Droit au Travail 06 Août 2026 V1.docx"},
        "cover": {
            "fr": {"title": "Analyse économique du droit au travail",
                   "subtitle": "Jurisprudence du Tribunal administratif tunisien (1970–2024)",
                   "author": "Hela Ben Hassine"},
            "ar": {"title": "التحليل الاقتصادي للحقّ في العمل",
                   "subtitle": "فقه قضاء المحكمة الإدارية التونسية (1970–2024)",
                   "author": "هالة بن حسين"},
        },
        # Le document contient un courriel collé (« Veuillez trouver ci-joint… Bien cordialement, Hela »)
        "drop": {"fr": [r"^ANALYSE ÉCONOMIQUE DU DROIT AU TRAVAIL$", r"^Jurisprudence du Tribunal administratif tunisien \(1970",
                        r"^Droits Fondamentaux et Économie Publique$", r"^Cette section couvre", r"^Il s.agit d.une version de travail",
                        r"^Bien cordialement"]},
        "replace": {"fr": {r"^Références internationales\s*Veuillez trouver": "Références internationales"}},
    },
    {
        "key": "ben-hassine-sante",
        "family": "articles",
        "stem": "Ben_Hassine_Analyse_economique_droit_a_la_sante",
        "src": {"fr": r"Hela Ben Hassine\Hela Ben Hassine\Analyse Economique Droit à la Santé Septembre 2026.docx"},
        "cover": {
            "fr": {"title": "Droit à la santé",
                   "subtitle": "Analyse économique de la jurisprudence du Tribunal administratif tunisien (1970-2024)",
                   "author": "Hela Ben Hassine"},
            "ar": {"title": "الحقّ في الصحّة",
                   "subtitle": "تحليل اقتصادي لفقه قضاء المحكمة الإدارية التونسية (1970-2024)",
                   "author": "هالة بن حسين"},
        },
        "drop": {"fr": [r"^DROIT À LA SANTÉ$", r"^Analyse économique de la jurisprudence du Tribunal administratif tunisien \(1970-2024\)$"]},
    },
    {
        "key": "ben-hassine-securite-juridique",
        "family": "articles",
        "stem": "Ben_Hassine_Analyse_economique_securite_juridique",
        "src": {"fr": r"Hela Ben Hassine\Hela Ben Hassine\Analyse Economique Securite Juridique 30 Août2026.docx"},
        "cover": {
            "fr": {"title": "Analyse économique du droit à la sécurité juridique",
                   "subtitle": "Jurisprudence du Tribunal administratif tunisien (1975–2018)",
                   "author": "Hela Ben Hassine"},
            "ar": {"title": "التحليل الاقتصادي للحقّ في الأمان القانوني",
                   "subtitle": "فقه قضاء المحكمة الإدارية التونسية (1975–2018)",
                   "author": "هالة بن حسين"},
        },
        "drop": {"fr": [r"^ANALYSE ÉCONOMIQUE DU DROIT À LA SÉCURITÉ JURIDIQUE$", r"^Jurisprudence du Tribunal administratif tunisien \(1975",
                        r"^\.$"]},
    },
    {
        "key": "ben-hassine-propriete",
        "family": "articles",
        "stem": "Ben_Hassine_Analyse_economique_droit_de_propriete",
        "src": {"fr": r"Hela Ben Hassine\Hela Ben Hassine\Analyse économique du droit à la propriété 30 Septembre 2026.docx"},
        "cover": {
            "fr": {"title": "Droit à la propriété",
                   "subtitle": "Analyse économique de la jurisprudence tunisienne (1976-2014)",
                   "author": "Hela Ben Hassine"},
            "ar": {"title": "الحقّ في الملكية",
                   "subtitle": "تحليل اقتصادي لفقه القضاء التونسي (1976-2014)",
                   "author": "هالة بن حسين"},
        },
        "drop": {"fr": [r"^Droit à la propriété$", r"^Analyse économique de la jurisprudence tunisienne$"]},
    },
    {
        "key": "gafsi-cout-iniquite",
        "family": "articles",
        "stem": "Gafsi_Cout_economique_iniquite_egalite_successorale",
        "src": {"fr": r"Islam Gafsi\Islam Gafsi\Le cout économique de l'iniquité.docx"},
        "cover": {
            "fr": {"title": "Le coût économique de l’iniquité",
                   "subtitle": "L’égalité successorale en Tunisie comme levier de croissance inclusive",
                   "author": "Islem Gafsi"},
            "ar": {"title": "الكلفة الاقتصادية لغياب الإنصاف",
                   "subtitle": "المساواة في الميراث في تونس رافعةً لنموّ إدماجيّ",
                   "author": "إسلام القفصي"},
        },
        "drop": {"fr": [r"^Le coût économique de l.iniquité", r"^Islem GAFSI$"]},
    },
]


def src_path(rel):
    return "\\\\?\\" + os.path.join(SRC, rel)


def cmd_extract():
    os.makedirs(TRAD, exist_ok=True)
    total = 0
    for d in DOCS:
        if "ar" in d["src"]:
            continue
        units = bx.extract_units(src_path(d["src"]["fr"]), d.get("drop", {}).get("fr"), d.get("replace", {}).get("fr"))
        words = sum(len(u["text"].split()) for u in units)
        total += words
        path = os.path.join(TRAD, d["key"] + ".units.json")
        with open(path, "w", encoding="utf-8") as f:
            json.dump({"key": d["key"], "title_fr": d["cover"]["fr"]["title"], "units": units}, f, ensure_ascii=False, indent=1)
        print("%-32s %4d unités  %6d mots" % (d["key"], len(units), words))
    print("total", total, "mots")


def check_translation(units, tr):
    """Jetons [[…]] identiques et aucune unité manquante."""
    problems = []
    for u in units:
        t = tr.get(u["id"])
        if not t:
            problems.append("%s : manquante" % u["id"])
            continue
        a = sorted(re.findall(r"\[\[[A-Z]+(?::[^\]]+)?\]\]", u["text"]))
        b = sorted(re.findall(r"\[\[[A-Z]+(?::[^\]]+)?\]\]", t))
        if a != b:
            problems.append("%s : jetons %s ≠ %s" % (u["id"], a, b))
    return problems


def load_translation(key):
    """Réunit les fichiers <clé>.ar.001.json, .002… ; <clé>.ar.json, s'il
    existe, s'y ajoute en dernier (corrections à la main)."""
    tr = {}
    parts = sorted(n for n in os.listdir(TRAD) if re.match(re.escape(key) + r"\.ar\.\d+\.json$", n))
    for n in parts + ([key + ".ar.json"] if os.path.exists(os.path.join(TRAD, key + ".ar.json")) else []):
        with open(os.path.join(TRAD, n), encoding="utf-8") as f:
            tr.update(json.load(f))
    return tr


def cmd_build(only=None):
    for d in DOCS:
        if only and d["key"] not in only:
            continue
        folder = os.path.join(SRC, FOLDERS[d["family"]])
        for lang in ("fr", "ar"):
            sub = os.path.join(folder, "Français" if lang == "fr" else "Arabe")
            os.makedirs("\\\\?\\" + sub, exist_ok=True)
            out = os.path.join(sub, d["stem"] + ("_FR" if lang == "fr" else "") + ".docx")
            cover = dict(d["cover"][lang])
            cover["label"] = LABELS[d["family"]][lang]
            template = src_path(TEMPLATES[(d["family"], lang)])
            if lang in d["src"]:
                bx.build(src_path(d["src"][lang]), template, "\\\\?\\" + out, lang, d["family"], cover,
                         drop=d.get("drop", {}).get(lang), replace=d.get("replace", {}).get(lang))
            else:
                tr = load_translation(d["key"])
                if not tr:
                    print("  (traduction absente : %s)" % d["key"])
                    continue
                with open(os.path.join(TRAD, d["key"] + ".units.json"), encoding="utf-8") as f:
                    units = json.load(f)["units"]
                problems = check_translation(units, tr)
                if problems:
                    print("  ✗ %s : %d problème(s) de traduction, ex. %s" % (d["key"], len(problems), problems[:3]))
                    continue
                figure_map = {u["text"]: tr[u["id"]] for u in units if u.get("figure")}
                bx.build(src_path(d["src"]["fr"]), template, "\\\\?\\" + out, "ar", d["family"], cover,
                         drop=d.get("drop", {}).get("fr"), replace=d.get("replace", {}).get("fr"),
                         translations=tr, figure_map=figure_map)
            print("  ✓", os.path.relpath(out, SRC))


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    what = sys.argv[1] if len(sys.argv) > 1 else ""
    if what == "extract":
        cmd_extract()
    elif what == "build":
        cmd_build(sys.argv[2:] or None)
    else:
        sys.exit(__doc__)
