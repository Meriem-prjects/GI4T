import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { ODF_TYPES, type OdfDoc, type OdfSort, type OdfTypeKey } from "@/lib/odf";

interface DocumentTypeRow {
  id: string;
  name: string;
  name_ar?: string | null;
}

// Identifiants des types de documents de l'ODF, retrouvés par leur nom.
export function useOdfTypeIds() {
  return useQuery({
    queryKey: ["odf-type-ids"],
    staleTime: 10 * 60_000,
    queryFn: async () => {
      const res = await api.get<{ items: DocumentTypeRow[] }>("/api/document-types", { query: { limit: 100 } });
      const byName = new Map(res.items.map((t) => [t.name.trim(), t.id]));
      const ids: Partial<Record<OdfTypeKey, string>> = {};
      for (const t of ODF_TYPES) {
        const id = byName.get(t.dbName);
        if (id) ids[t.key] = id;
      }
      return ids;
    },
  });
}

export interface OdfQuery {
  types?: OdfTypeKey[];
  search?: string;
  year?: number;
  categoryId?: string;
  sort?: OdfSort;
  page?: number;
  pageSize?: number;
  importKeys?: string[];
  excludeId?: string;
}

function toQuery(q: OdfQuery, typeIds: Partial<Record<OdfTypeKey, string>>) {
  const ids = (q.types ?? []).map((k) => typeIds[k]).filter(Boolean) as string[];
  return {
    document_type_ids: ids.length ? ids.join(",") : undefined,
    search: q.search?.trim() || undefined,
    year: q.year,
    category_any: q.categoryId,
    import_key_in: q.importKeys?.length ? q.importKeys.join(",") : undefined,
  };
}

// Liste paginée (cartes, sans le texte intégral).
export function useOdfDocuments(q: OdfQuery, enabled = true) {
  const { data: typeIds } = useOdfTypeIds();
  const pageSize = q.pageSize ?? 12;
  const page = q.page ?? 1;
  const ready = !!typeIds && (!q.types?.length || q.types.some((k) => typeIds[k]));
  return useQuery({
    queryKey: ["odf-documents", q, typeIds],
    enabled: enabled && ready,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const res = await api.get<{ items: OdfDoc[]; total: number }>("/api/documents", {
        query: {
          fields: "card",
          ...toQuery(q, typeIds!),
          sort: q.sort ?? "recent",
          limit: pageSize + (q.excludeId ? 1 : 0),
          offset: (page - 1) * pageSize,
        },
      });
      const items = q.excludeId ? res.items.filter((d) => d.id !== q.excludeId).slice(0, pageSize) : res.items;
      return { items, total: res.total };
    },
  });
}

export interface OdfFacets {
  total: number;
  types: Array<{ id: string; name: string; name_ar?: string | null; count: number }>;
  categories: Array<{ id: string; name: string; name_ar?: string | null; color?: string | null; count: number }>;
  years: Array<{ year: number; count: number }>;
}

// Compteurs par type, par droit fondamental et par année.
export function useOdfFacets(q: OdfQuery = {}, enabled = true) {
  const { data: typeIds } = useOdfTypeIds();
  return useQuery({
    queryKey: ["odf-facets", q, typeIds],
    enabled: enabled && !!typeIds,
    placeholderData: keepPreviousData,
    queryFn: () => api.get<OdfFacets>("/api/documents/facets", { query: toQuery(q, typeIds!) }),
  });
}

// Nombre de documents par type de l'ODF (pour les rubriques).
export function useOdfTypeCounts() {
  const { data: typeIds } = useOdfTypeIds();
  const facets = useOdfFacets({ types: ODF_TYPES.map((t) => t.key) });
  const counts: Partial<Record<OdfTypeKey, number>> = {};
  if (typeIds && facets.data) {
    for (const t of ODF_TYPES) {
      const id = typeIds[t.key];
      counts[t.key] = facets.data.types.find((x) => x.id === id)?.count ?? 0;
    }
  }
  return { counts, isLoading: facets.isLoading || !typeIds };
}
