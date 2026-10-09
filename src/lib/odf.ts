// Documents de l'Observatoire des droits fondamentaux (ODF) : types, rubriques
// et adresses des pages du lecteur. Les documents « avec page de garde » sont
// publiés par backend/scripts/odf/publish-odf-books.ts : chaque page existe
// en image (p<n>.webp), en miniature (t<n>.webp), plus le PDF, dans
// documents/<book.<langue>.dir>/ du stockage.
import {
  BookOpenText,
  FileText,
  Landmark,
  Library,
  MessageSquare,
  PenSquare,
  Presentation,
  Scale,
  StickyNote,
  type LucideIcon,
} from "lucide-react";
import { API_BASE_URL } from "@/api/client";

export type Lang = "fr" | "ar";
export type OdfTypeKey =
  | "fiches"
  | "recueils"
  | "analyses"
  | "articles"
  | "commentaires"
  | "blogs"
  | "notes"
  | "policy"
  | "presentations";
export type OdfHubKey = "droits" | "analyses" | "publications";
export type OdfSort = "year_desc" | "year_asc" | "recent" | "oldest" | "number" | "title";

type Text = { fr: string; ar: string };

export interface OdfTypeDef {
  key: OdfTypeKey;
  dbName: string;
  path: string;
  hub: OdfHubKey;
  label: Text;
  singular: Text;
  description: Text;
  layout: "list" | "grid";
  sorts: OdfSort[];
  filters: { year?: boolean; right?: boolean };
  icon: LucideIcon;
  color: string;
}

export const ODF_TYPES: OdfTypeDef[] = [
  {
    key: "fiches",
    dbName: "Fiche de jurisprudence",
    path: "/observatoire/fiches-jurisprudence",
    hub: "droits",
    label: { fr: "Fiches de jurisprudence", ar: "جذاذات فقه القضاء" },
    singular: { fr: "Fiche", ar: "جذاذة" },
    description: {
      fr: "Chaque fiche résume une décision de justice : le problème juridique posé et la solution apportée.",
      ar: "تلخّص كلّ جذاذة قرارا قضائيا: المشكل القانوني المطروح والحلّ المقدَّم.",
    },
    layout: "list",
    sorts: ["year_desc", "year_asc", "number"],
    filters: { year: true, right: true },
    icon: Scale,
    color: "#4F46E5",
  },
  {
    key: "analyses",
    dbName: "Analyses juridiques",
    path: "/observatoire/analyses-juridiques",
    hub: "analyses",
    label: { fr: "Analyses juridiques", ar: "التحاليل القانونية" },
    singular: { fr: "Analyse juridique", ar: "تحليل قانوني" },
    description: {
      fr: "Études approfondies d'un droit fondamental dans la jurisprudence tunisienne.",
      ar: "دراسات معمّقة لحقّ أساسي في فقه القضاء التونسي.",
    },
    layout: "grid",
    sorts: ["title", "recent"],
    filters: { right: true },
    icon: FileText,
    color: "#2563EB",
  },
  {
    key: "articles",
    dbName: "Articles",
    path: "/observatoire/articles",
    hub: "analyses",
    label: { fr: "Articles", ar: "المقالات" },
    singular: { fr: "Article", ar: "مقال" },
    description: {
      fr: "Lectures de fond sur l'effectivité des droits et des libertés en Tunisie.",
      ar: "قراءات معمّقة حول فعلية الحقوق والحرّيات في تونس.",
    },
    layout: "grid",
    sorts: ["title", "recent"],
    filters: { right: true },
    icon: BookOpenText,
    color: "#7C3AED",
  },
  {
    key: "commentaires",
    dbName: "Commentaires",
    path: "/observatoire/commentaires",
    hub: "analyses",
    label: { fr: "Commentaires", ar: "التعاليق" },
    singular: { fr: "Commentaire", ar: "تعليق" },
    description: {
      fr: "Commentaires de décisions par des magistrats et des universitaires.",
      ar: "تعاليق على قرارات قضائية بقلم قضاة وجامعيين.",
    },
    layout: "grid",
    sorts: ["recent", "title"],
    filters: { right: true },
    icon: MessageSquare,
    color: "#F59E0B",
  },
  {
    key: "blogs",
    dbName: "Blogs",
    path: "/observatoire/blogs",
    hub: "analyses",
    label: { fr: "Blogs", ar: "التدوينات" },
    singular: { fr: "Blog", ar: "تدوينة" },
    description: {
      fr: "Billets courts sur une décision récente, rédigés par des magistrats.",
      ar: "تدوينات قصيرة حول قرار حديث، بقلم قضاة.",
    },
    layout: "grid",
    sorts: ["recent", "oldest", "title"],
    filters: { right: true },
    icon: PenSquare,
    color: "#DC2626",
  },
  {
    key: "recueils",
    dbName: "Recueils",
    path: "/observatoire/recueils",
    hub: "publications",
    label: { fr: "Recueils", ar: "المجموعات" },
    singular: { fr: "Recueil", ar: "مجموعة" },
    description: {
      fr: "La jurisprudence administrative année par année : les jugements et leurs fiches.",
      ar: "فقه القضاء الإداري سنة بسنة: الأحكام وجذاذاتها.",
    },
    layout: "grid",
    sorts: ["year_desc", "year_asc"],
    filters: {},
    icon: Library,
    color: "#0F766E",
  },
  {
    key: "notes",
    dbName: "Notes thématiques",
    path: "/observatoire/notes-thematiques",
    hub: "publications",
    label: { fr: "Notes thématiques", ar: "الأوراق الموضوعية" },
    singular: { fr: "Note thématique", ar: "ورقة موضوعية" },
    description: {
      fr: "Notes transversales sur le droit, les libertés et leur effectivité.",
      ar: "أوراق تتناول القانون والحرّيات وفعليتها.",
    },
    layout: "grid",
    sorts: ["number", "title"],
    filters: {},
    icon: StickyNote,
    color: "#0891B2",
  },
  {
    key: "policy",
    dbName: "Policy briefs",
    path: "/observatoire/policy-briefs",
    hub: "publications",
    label: { fr: "Policy briefs", ar: "أوراق السياسات" },
    singular: { fr: "Policy brief", ar: "ورقة سياسات" },
    description: {
      fr: "Recommandations de l'Observatoire à l'intention des décideurs.",
      ar: "توصيات المرصد الموجّهة إلى أصحاب القرار.",
    },
    layout: "grid",
    sorts: ["number", "recent"],
    filters: {},
    icon: Landmark,
    color: "#BE185D",
  },
  {
    key: "presentations",
    dbName: "Présentations",
    path: "/observatoire/presentations",
    hub: "publications",
    label: { fr: "Présentations", ar: "التقديمات" },
    singular: { fr: "Présentation", ar: "تقديم" },
    description: {
      fr: "Les juridictions et les instances : histoire, composition, compétences.",
      ar: "الهيئات القضائية والدستورية: تاريخها وتركيبتها واختصاصاتها.",
    },
    layout: "grid",
    sorts: ["title"],
    filters: {},
    icon: Presentation,
    color: "#65A30D",
  },
];

export interface OdfHubDef {
  key: OdfHubKey;
  path: string;
  label: Text;
  description: Text;
  types: OdfTypeKey[];
}

export const ODF_HUBS: Record<OdfHubKey, OdfHubDef> = {
  droits: {
    key: "droits",
    path: "/observatoire/droits-fondamentaux",
    label: { fr: "Droits fondamentaux", ar: "الحقوق الأساسية" },
    description: {
      fr: "La jurisprudence classée par droit fondamental.",
      ar: "فقه القضاء مصنّفا حسب الحقوق الأساسية.",
    },
    types: ["fiches"],
  },
  analyses: {
    key: "analyses",
    path: "/observatoire/analyses-opinions",
    label: { fr: "Analyses & Opinions", ar: "تحليلات وآراء" },
    description: {
      fr: "Analyses, articles, commentaires et billets de magistrats et d'universitaires sur les décisions qui font la jurisprudence.",
      ar: "تحاليل ومقالات وتعاليق وتدوينات لقضاة وجامعيين حول القرارات التي تصنع فقه القضاء.",
    },
    types: ["analyses", "articles", "commentaires", "blogs"],
  },
  publications: {
    key: "publications",
    path: "/observatoire/publications",
    label: { fr: "Publications", ar: "المنشورات" },
    description: {
      fr: "Les publications de l'Observatoire : recueils annuels, notes thématiques, policy briefs et présentations des juridictions.",
      ar: "منشورات المرصد: المجموعات السنوية والأوراق الموضوعية وأوراق السياسات وتقديم الهيئات القضائية.",
    },
    types: ["recueils", "notes", "policy", "presentations"],
  },
};

export const SORT_LABELS: Record<OdfSort, Text> = {
  year_desc: { fr: "Années récentes d'abord", ar: "الأحدث سنةً أوّلا" },
  year_asc: { fr: "Années anciennes d'abord", ar: "الأقدم سنةً أوّلا" },
  recent: { fr: "Plus récents", ar: "الأحدث" },
  oldest: { fr: "Plus anciens", ar: "الأقدم" },
  number: { fr: "Par numéro", ar: "حسب العدد" },
  title: { fr: "Par titre", ar: "حسب العنوان" },
};

export const odfType = (key: OdfTypeKey): OdfTypeDef => ODF_TYPES.find((t) => t.key === key)!;
export const odfTypeByDbName = (name?: string | null): OdfTypeDef | undefined =>
  ODF_TYPES.find((t) => t.dbName === name);

// ── Données ──────────────────────────────────────────────────────────────

export interface BookEdition {
  dir: string;
  pages: number;
  w: number;
  h: number;
  pdf: string;
  bytes?: number;
}

export interface Book {
  v?: number;
  fr?: BookEdition;
  ar?: BookEdition;
  refs?: string[];
  sync?: string;
}

export interface OdfCategoryRef {
  id: string;
  name: string;
  name_ar?: string | null;
  color?: string | null;
}

export interface OdfDoc {
  id: string;
  title: string;
  title_ar?: string | null;
  subtitle?: string | null;
  subtitle_ar?: string | null;
  summary?: string | null;
  summary_ar?: string | null;
  author?: string | null;
  author_ar?: string | null;
  keywords?: string[] | null;
  keywords_ar?: string[] | null;
  language?: string | null;
  year?: number | null;
  validation_date?: string | null;
  case_number?: string | null;
  court?: string | null;
  court_ar?: string | null;
  court_level?: string | null;
  court_level_ar?: string | null;
  plaintiff?: string | null;
  plaintiff_ar?: string | null;
  defendant?: string | null;
  defendant_ar?: string | null;
  legal_references?: string[] | null;
  legal_references_ar?: string[] | null;
  dates?: string[] | null;
  document_type_id?: string | null;
  book?: Book | null;
  import_key?: string | null;
  sort_order?: number | null;
  pdf_url?: string | null;
  page_count?: number | null;
  content?: string | null;
  translated_content?: string | null;
  created_at?: string;
  document_types?: { id: string; name: string; name_ar?: string | null } | null;
  document_categories?: Array<{ id: string; category_id: string; category?: OdfCategoryRef | null }> | null;
}

// ── Adresses des fichiers ────────────────────────────────────────────────

const storageUrl = (key: string) => `${API_BASE_URL}/api/storage/documents/${key}`;
export const odfPageUrl = (ed: BookEdition, page: number) => storageUrl(`${ed.dir}/p${page}.webp`);
export const odfThumbUrl = (ed: BookEdition, page: number) => storageUrl(`${ed.dir}/t${page}.webp`);
export const odfPdfUrl = (ed: BookEdition) => storageUrl(`${ed.dir}/${ed.pdf}`);
export const documentPath = (id: string) => `/observatoire/document/${id}`;

// ── Textes selon la langue ───────────────────────────────────────────────

export function pick(lang: Lang, fr?: string | null, ar?: string | null): string {
  return (lang === "ar" ? ar || fr : fr || ar) ?? "";
}

export function pickList(lang: Lang, fr?: string[] | null, ar?: string[] | null): string[] {
  const a = lang === "ar" ? ar : fr;
  const b = lang === "ar" ? fr : ar;
  return a && a.length ? a : b ?? [];
}

// `content` est rédigé dans `language`, `translated_content` dans l'autre langue.
export function textFor(doc: Pick<OdfDoc, "content" | "translated_content" | "language">, lang: Lang): string {
  const own = (doc.language ?? "fr") === lang;
  return (own ? doc.content || doc.translated_content : doc.translated_content || doc.content) ?? "";
}

export function editionFor(book: Book | null | undefined, lang: Lang): BookEdition | undefined {
  if (!book) return undefined;
  return lang === "ar" ? book.ar ?? book.fr : book.fr ?? book.ar;
}

export function docRights(doc: OdfDoc): OdfCategoryRef[] {
  const out: OdfCategoryRef[] = [];
  for (const link of doc.document_categories ?? []) {
    if (link.category && !out.some((c) => c.id === link.category!.id)) out.push(link.category);
  }
  return out;
}

// « 12 documents » / « 12 وثيقة » (accord du nom avec le nombre en arabe).
export function docCount(n: number, lang: Lang): string {
  if (lang === "fr") return n === 1 ? "1 document" : `${n.toLocaleString("fr-FR")} documents`;
  if (n === 1) return "وثيقة واحدة";
  if (n === 2) return "وثيقتان";
  return n % 100 >= 3 && n % 100 <= 10 ? `${n} وثائق` : `${n} وثيقة`;
}

// Date sans heure (YYYY-MM-DD…) affichée sans décalage de fuseau horaire.
export function formatOdfDate(value: string | null | undefined, lang: Lang): string {
  if (!value) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!m) return "";
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return d.toLocaleDateString(lang === "ar" ? "ar-TN" : "fr-FR", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Date affichée sur une carte : date de validation, sinon année de la jurisprudence.
export function odfDocDate(doc: OdfDoc, lang: Lang): string {
  if (doc.validation_date) return formatOdfDate(doc.validation_date, lang);
  return doc.year ? String(doc.year) : "";
}
