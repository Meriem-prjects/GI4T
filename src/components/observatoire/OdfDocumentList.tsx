import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useOdfDocuments, useOdfFacets } from "@/hooks/useOdf";
import { cn } from "@/lib/utils";
import {
  SORT_LABELS,
  docCount,
  docRights,
  documentPath,
  editionFor,
  odfDocDate,
  odfThumbUrl,
  odfType,
  odfTypeByDbName,
  pick,
  type Lang,
  type OdfDoc,
  type OdfSort,
  type OdfTypeKey,
} from "@/lib/odf";

const L = {
  fr: {
    search: "Rechercher (mots, n° d'affaire…)",
    allYears: "Toutes les années",
    allRights: "Tous les droits",
    allTypes: "Tous les types",
    reset: "Effacer les filtres",
    results: (n: number) => docCount(n, "fr"),
    none: "Aucun document ne correspond à votre recherche.",
    prev: "Précédent",
    next: "Suivant",
    page: (p: number, n: number) => `Page ${p} sur ${n}`,
    sort: "Trier",
    year: "Année",
    right: "Droit fondamental",
    type: "Type",
  },
  ar: {
    search: "ابحث (كلمات، عدد القضية…)",
    allYears: "كلّ السنوات",
    allRights: "كلّ الحقوق",
    allTypes: "كلّ الأنواع",
    reset: "مسح التصفية",
    results: (n: number) => docCount(n, "ar"),
    none: "لا توجد وثيقة مطابقة لبحثك.",
    prev: "السابق",
    next: "التالي",
    page: (p: number, n: number) => `الصفحة ${p} من ${n}`,
    sort: "الترتيب",
    year: "السنة",
    right: "الحق الأساسي",
    type: "النوع",
  },
};

interface Props {
  types: OdfTypeKey[];
  lang: Lang;
  layout: "list" | "grid";
  sorts: OdfSort[];
  filters?: { year?: boolean; right?: boolean; type?: boolean };
  fixedCategoryId?: string;
  pageSize?: number;
  showType?: boolean;
}

const selectClass =
  "h-10 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring max-w-full";

export default function OdfDocumentList({
  types,
  lang,
  layout,
  sorts,
  filters = {},
  fixedCategoryId,
  pageSize = layout === "grid" ? 24 : 15,
  showType = types.length > 1,
}: Props) {
  const t = L[lang];
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const year = Number(params.get("annee")) || undefined;
  const right = fixedCategoryId ?? (params.get("droit") || undefined);
  const sort = (sorts.includes(params.get("tri") as OdfSort) ? params.get("tri") : sorts[0]) as OdfSort;
  const page = Math.max(1, Number(params.get("page")) || 1);
  const typeParam = params.get("type") as OdfTypeKey | null;
  const activeTypes = typeParam && types.includes(typeParam) ? [typeParam] : types;
  const [search, setSearch] = useState(q);
  const topRef = useRef<HTMLDivElement>(null);

  const update = (changes: Record<string, string | null>) => {
    const p = new URLSearchParams(params);
    for (const [k, v] of Object.entries(changes)) {
      if (v === null || v === "") p.delete(k);
      else p.set(k, v);
    }
    setParams(p, { replace: true });
  };

  useEffect(() => setSearch(q), [q]);
  useEffect(() => {
    if (search === q) return;
    const h = setTimeout(() => update({ q: search.trim() || null, page: null }), 350);
    return () => clearTimeout(h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const query = { types: activeTypes, search: q, year, categoryId: right, sort, page, pageSize };
  const { data, isFetching } = useOdfDocuments(query);
  // Pas encore de données (y compris le temps de connaître les types) : squelette
  const isLoading = !data;
  const facets = useOdfFacets(
    { types: activeTypes, search: q, year, categoryId: right },
    !!(filters.year || filters.right || filters.type),
  );
  const typeFacets = useOdfFacets({ types, search: q, year, categoryId: right }, !!filters.type);
  const total = data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const hasFilters = !!(q || year || (!fixedCategoryId && right) || typeParam);

  const goPage = (p: number) => {
    update({ page: p > 1 ? String(p) : null });
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div ref={topRef} className="scroll-mt-24">
      {/* Filtres */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.search}
            aria-label={t.search}
            className="h-10 w-full rounded-md border bg-background ps-9 pe-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        {filters.type && (
          <select
            className={selectClass}
            aria-label={t.type}
            value={typeParam ?? ""}
            onChange={(e) => update({ type: e.target.value || null, page: null })}
          >
            <option value="">{t.allTypes}</option>
            {types.map((k) => {
              const def = odfType(k);
              const n = typeFacets.data?.types.find((x) => x.name === def.dbName)?.count;
              return (
                <option key={k} value={k}>
                  {def.label[lang]}
                  {n !== undefined ? ` (${n})` : ""}
                </option>
              );
            })}
          </select>
        )}
        {filters.year && (
          <select
            className={selectClass}
            aria-label={t.year}
            value={year ?? ""}
            onChange={(e) => update({ annee: e.target.value || null, page: null })}
          >
            <option value="">{t.allYears}</option>
            {(facets.data?.years ?? []).map((y) => (
              <option key={y.year} value={y.year}>
                {y.year} ({y.count})
              </option>
            ))}
          </select>
        )}
        {filters.right && !fixedCategoryId && (
          <select
            className={cn(selectClass, "w-full sm:w-auto sm:max-w-[320px]")}
            aria-label={t.right}
            value={right ?? ""}
            onChange={(e) => update({ droit: e.target.value || null, page: null })}
          >
            <option value="">{t.allRights}</option>
            {(facets.data?.categories ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {pick(lang, c.name, c.name_ar)} ({c.count})
              </option>
            ))}
          </select>
        )}
        {sorts.length > 1 && (
          <select
            className={selectClass}
            aria-label={t.sort}
            value={sort}
            onChange={(e) => update({ tri: e.target.value === sorts[0] ? null : e.target.value, page: null })}
          >
            {sorts.map((s) => (
              <option key={s} value={s}>
                {SORT_LABELS[s][lang]}
              </option>
            ))}
          </select>
        )}
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-10 gap-1"
            onClick={() => {
              setSearch("");
              update({ q: null, annee: null, droit: null, type: null, page: null });
            }}
          >
            <X className="h-4 w-4" />
            {t.reset}
          </Button>
        )}
      </div>

      <p className="mb-4 text-sm text-muted-foreground" aria-live="polite">
        {isLoading ? " " : t.results(total)}
      </p>

      {/* Résultats */}
      {isLoading ? (
        <div className={layout === "grid" ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5" : "space-y-3"}>
          {Array.from({ length: layout === "grid" ? 8 : 5 }, (_, i) =>
            layout === "grid" ? (
              <Skeleton key={i} className="aspect-[1/1.6] rounded-xl" />
            ) : (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ),
          )}
        </div>
      ) : total === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">{t.none}</div>
      ) : (
        <div className={cn("transition-opacity", isFetching && "opacity-60")}>
          {layout === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {data!.items.map((d) => (
                <OdfGridCard key={d.id} doc={d} lang={lang} showType={showType} />
              ))}
            </div>
          ) : (
            <ul className="space-y-3">
              {data!.items.map((d) => (
                <li key={d.id}>
                  <OdfListCard doc={d} lang={lang} showType={showType} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label={t.page(page, pages)}>
          <Button variant="outline" size="sm" className="h-10 gap-1" disabled={page <= 1} onClick={() => goPage(page - 1)}>
            {lang === "ar" ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {t.prev}
          </Button>
          {pageWindow(page, pages).map((p, i) =>
            p === null ? (
              <span key={`gap-${i}`} className="px-1 text-muted-foreground">
                …
              </span>
            ) : (
              <Button
                key={p}
                variant={p === page ? "default" : "ghost"}
                size="sm"
                className="h-10 min-w-10 tabular-nums"
                aria-current={p === page ? "page" : undefined}
                onClick={() => goPage(p)}
              >
                {p}
              </Button>
            ),
          )}
          <Button variant="outline" size="sm" className="h-10 gap-1" disabled={page >= pages} onClick={() => goPage(page + 1)}>
            {t.next}
            {lang === "ar" ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </nav>
      )}
    </div>
  );
}

function pageWindow(page: number, pages: number): Array<number | null> {
  const set = new Set([1, pages, page - 1, page, page + 1].filter((p) => p >= 1 && p <= pages));
  const sorted = [...set].sort((a, b) => a - b);
  const out: Array<number | null> = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) out.push(null);
    out.push(sorted[i]);
  }
  return out;
}

function TypeBadge({ doc, lang }: { doc: OdfDoc; lang: Lang }) {
  const def = odfTypeByDbName(doc.document_types?.name);
  if (!def) return null;
  return (
    <Badge style={{ backgroundColor: def.color }} className="text-white font-medium">
      {def.singular[lang]}
    </Badge>
  );
}

export function OdfListCard({ doc, lang, showType }: { doc: OdfDoc; lang: Lang; showType?: boolean }) {
  const rights = docRights(doc);
  const level = pick(lang, doc.court_level, doc.court_level_ar);
  return (
    <Link
      to={documentPath(doc.id)}
      className="group block rounded-xl border bg-card p-4 transition hover:border-primary/40 hover:shadow-md"
    >
      <div className="mb-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {showType && <TypeBadge doc={doc} lang={lang} />}
        {doc.year && <span className="rounded bg-muted px-1.5 py-0.5 font-semibold text-foreground tabular-nums">{doc.year}</span>}
        {level && <span>{level}</span>}
      </div>
      <h3 className="font-semibold leading-snug group-hover:text-primary">{pick(lang, doc.title, doc.title_ar)}</h3>
      {pick(lang, doc.subtitle, doc.subtitle_ar) && (
        <p className="mt-0.5 text-sm text-muted-foreground">{pick(lang, doc.subtitle, doc.subtitle_ar)}</p>
      )}
      {pick(lang, doc.summary, doc.summary_ar) && (
        <p className="mt-2 text-sm line-clamp-2">{pick(lang, doc.summary, doc.summary_ar)}</p>
      )}
      {rights.length > 1 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {rights.map((r) => (
            <Badge key={r.id} variant="outline" className="font-normal">
              {pick(lang, r.name, r.name_ar)}
            </Badge>
          ))}
        </div>
      )}
    </Link>
  );
}

export function OdfGridCard({ doc, lang, showType }: { doc: OdfDoc; lang: Lang; showType?: boolean }) {
  const ed = editionFor(doc.book, lang);
  const title = pick(lang, doc.title, doc.title_ar);
  const author = pick(lang, doc.author, doc.author_ar);
  const date = odfDocDate(doc, lang);
  return (
    <Link
      to={documentPath(doc.id)}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card transition hover:border-primary/40 hover:shadow-lg"
    >
      <div className="relative aspect-[1/1.414] overflow-hidden bg-muted">
        {ed ? (
          <img
            src={odfThumbUrl(ed, 1)}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : null}
        {showType && (
          <span className="absolute top-2 start-2">
            <TypeBadge doc={doc} lang={lang} />
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="text-sm font-semibold leading-snug line-clamp-3 group-hover:text-primary">{title}</h3>
        {author && <p className="text-xs text-muted-foreground line-clamp-1">{author}</p>}
        {date && <p className="mt-auto pt-1 text-xs text-muted-foreground">{date}</p>}
      </div>
    </Link>
  );
}
