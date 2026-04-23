// Supabase-compatible query builder that maps to our REST API.
// Not a 100% replica — supports the subset used by this codebase.

import { api, ApiError } from "./client.js";

// Convert snake_case / existing table names to kebab-case REST paths.
const TABLE_TO_PATH: Record<string, string> = {
  documents: "/api/documents",
  categories: "/api/categories",
  document_types: "/api/document-types",
  court_types: "/api/court-types",
  jurisdiction_levels: "/api/jurisdiction-levels",
  languages: "/api/languages",
  governorates: "/api/governorates",
  events: "/api/events",
  event_registrations: "/api/events",
  news: "/api/news",
  faq_items: "/api/faq",
  useful_addresses: "/api/useful-addresses",
  document_comments: "/api/comments",
  document_views: "/api/fn/track-document-view",
  document_statistics: "/api/statistics",
  document_categories: "/api/document-categories",
  activity_logs: "/api/activity-logs",
  processing_jobs: "/api/processing-jobs",
  chatbot_config: "/api/chatbot/config",
  chatbot_training_documents: "/api/chatbot/training-documents",
  user_roles: "/api/users",
  profiles: "/api/users",
  acces_droits_permissions: "/api/users",
  photo_albums: "/api/photo-albums",
  media_items: "/api/media-items",
};

export interface QueryResult<T = unknown> {
  data: T | null;
  error: { message: string; code?: string; details?: unknown } | null;
  count?: number | null;
}

type Filter =
  | { type: "eq"; col: string; value: unknown }
  | { type: "neq"; col: string; value: unknown }
  | { type: "gt"; col: string; value: unknown }
  | { type: "gte"; col: string; value: unknown }
  | { type: "lt"; col: string; value: unknown }
  | { type: "lte"; col: string; value: unknown }
  | { type: "like"; col: string; value: string }
  | { type: "ilike"; col: string; value: string }
  | { type: "in"; col: string; values: unknown[] }
  | { type: "is"; col: string; value: unknown }
  | { type: "or"; expr: string };

type Op = "select" | "insert" | "update" | "delete" | "upsert";

export class QueryBuilder<T = unknown> implements PromiseLike<QueryResult<T>> {
  private filters: Filter[] = [];
  private orderBy: Array<{ col: string; ascending: boolean }> = [];
  private limitValue?: number;
  private offsetValue?: number;
  private op: Op = "select";
  private selectStr = "*";
  private payload?: unknown;
  private singleResult = false;
  private maybeSingle_flag = false;
  private countRequested = false;
  private headOnly = false;
  private rangeFrom?: number;
  private rangeTo?: number;

  constructor(
    private readonly table: string,
    private readonly path = TABLE_TO_PATH[table] ?? `/api/${table.replace(/_/g, "-")}`,
  ) {}

  select(columns = "*", opts?: { count?: "exact" | "planned" | "estimated"; head?: boolean }): this {
    this.op = "select";
    this.selectStr = columns;
    if (opts?.count) this.countRequested = true;
    if (opts?.head) {
      this.headOnly = true;
      // Backend requires limit >= 1; we only need the total count, not the rows.
      this.limitValue = 1;
    }
    return this;
  }

  insert(values: unknown): this {
    this.op = "insert";
    this.payload = Array.isArray(values) ? values[0] : values;
    return this;
  }

  update(values: unknown): this {
    this.op = "update";
    this.payload = values;
    return this;
  }

  delete(): this {
    this.op = "delete";
    return this;
  }

  upsert(values: unknown): this {
    this.op = "upsert";
    this.payload = Array.isArray(values) ? values[0] : values;
    return this;
  }

  eq(col: string, value: unknown): this {
    this.filters.push({ type: "eq", col, value });
    return this;
  }
  neq(col: string, value: unknown): this {
    this.filters.push({ type: "neq", col, value });
    return this;
  }
  gt(col: string, value: unknown): this {
    this.filters.push({ type: "gt", col, value });
    return this;
  }
  gte(col: string, value: unknown): this {
    this.filters.push({ type: "gte", col, value });
    return this;
  }
  lt(col: string, value: unknown): this {
    this.filters.push({ type: "lt", col, value });
    return this;
  }
  lte(col: string, value: unknown): this {
    this.filters.push({ type: "lte", col, value });
    return this;
  }
  like(col: string, value: string): this {
    this.filters.push({ type: "like", col, value });
    return this;
  }
  ilike(col: string, value: string): this {
    this.filters.push({ type: "ilike", col, value });
    return this;
  }
  in(col: string, values: unknown[]): this {
    this.filters.push({ type: "in", col, values });
    return this;
  }
  is(col: string, value: unknown): this {
    this.filters.push({ type: "is", col, value });
    return this;
  }
  or(expr: string): this {
    this.filters.push({ type: "or", expr });
    return this;
  }
  contains(_col: string, _value: unknown): this {
    // Not fully supported — treat as a no-op hint
    return this;
  }
  match(values: Record<string, unknown>): this {
    for (const [col, value] of Object.entries(values)) {
      this.filters.push({ type: "eq", col, value });
    }
    return this;
  }
  order(col: string, opts: { ascending?: boolean } = {}): this {
    this.orderBy.push({ col, ascending: opts.ascending ?? true });
    return this;
  }
  limit(n: number): this {
    this.limitValue = n;
    return this;
  }
  range(from: number, to: number): this {
    this.rangeFrom = from;
    this.rangeTo = to;
    this.offsetValue = from;
    this.limitValue = to - from + 1;
    return this;
  }
  single(): this {
    this.singleResult = true;
    this.limitValue = 1;
    return this;
  }
  maybeSingle(): this {
    this.maybeSingle_flag = true;
    this.singleResult = true;
    this.limitValue = 1;
    return this;
  }

  private buildQuery(): Record<string, string> {
    const q: Record<string, string> = {};
    for (const f of this.filters) {
      if (f.type === "eq") q[f.col] = String(f.value);
      else if (f.type === "in" && f.values.length > 0) q[`${f.col}_in`] = f.values.join(",");
      else if (f.type === "ilike") q.search = String(f.value).replace(/%/g, "");
      else if (f.type === "gte") q[`${f.col}_gte`] = String(f.value);
      else if (f.type === "lte") q[`${f.col}_lte`] = String(f.value);
      else if (f.type === "gt") q[`${f.col}_gt`] = String(f.value);
      else if (f.type === "lt") q[`${f.col}_lt`] = String(f.value);
      else if (f.type === "neq") q[`${f.col}_neq`] = String(f.value);
      else if (f.type === "or") {
        // Supabase .or() syntax like "title.ilike.%x%,summary.ilike.%x%,..."
        // We extract the first ilike value and send it as a generic search term.
        const ilikeMatch = f.expr.match(/\.ilike\.%?([^%,)]+)%?/);
        if (ilikeMatch && ilikeMatch[1]) {
          q.search = ilikeMatch[1];
        }
      }
    }
    if (this.limitValue !== undefined) q.limit = String(this.limitValue);
    if (this.offsetValue !== undefined) q.offset = String(this.offsetValue);
    if (this.orderBy.length > 0) {
      const first = this.orderBy[0]!;
      q.order_by = first.col;
      q.order = first.ascending ? "asc" : "desc";
    }
    return q;
  }

  private getIdFilter(): string | null {
    const idFilter = this.filters.find((f) => f.type === "eq" && f.col === "id");
    return idFilter?.type === "eq" ? String(idFilter.value) : null;
  }

  private wrapResult<R>(data: R | null, error: unknown = null, count: number | null = null): QueryResult<R> {
    if (error) {
      const apiErr = error as ApiError;
      return {
        data: null,
        error: {
          message: apiErr.message ?? String(error),
          code: String(apiErr.status ?? ""),
          details: apiErr.details,
        },
        count: null,
      };
    }
    return { data, error: null, count };
  }

  private async execute(): Promise<QueryResult<T>> {
    try {
      if (this.op === "select") {
        const idFilter = this.getIdFilter();
        if (idFilter && this.singleResult) {
          const data = await api.get(`${this.path}/${idFilter}`);
          return this.wrapResult<T>(data as T);
        }
        const query = this.buildQuery();
        const res = await api.get<{ items?: unknown[]; total?: number } | unknown[]>(
          this.path,
          { query },
        );
        const items: unknown[] = Array.isArray(res)
          ? res
          : (res as { items?: unknown[] }).items ?? [];
        const total =
          !Array.isArray(res) && typeof (res as { total?: number }).total === "number"
            ? (res as { total: number }).total
            : items.length;
        if (this.headOnly) {
          return this.wrapResult<T>([] as unknown as T, null, total);
        }
        if (this.singleResult) {
          const first = items[0] ?? null;
          if (!first && !this.maybeSingle_flag) {
            return this.wrapResult<T>(null, new ApiError(404, "No rows found"));
          }
          return this.wrapResult<T>(first as T, null, this.countRequested ? total : null);
        }
        return this.wrapResult<T>(
          items as unknown as T,
          null,
          this.countRequested ? total : null,
        );
      }

      if (this.op === "insert" || this.op === "upsert") {
        const data = await api.post(this.path, this.payload);
        return this.wrapResult<T>(
          this.singleResult ? (data as T) : ([data] as unknown as T),
        );
      }

      if (this.op === "update") {
        const idFilter = this.getIdFilter();
        if (!idFilter) {
          return this.wrapResult<T>(null, new ApiError(400, "Update requires an id filter"));
        }
        const data = await api.patch(`${this.path}/${idFilter}`, this.payload);
        return this.wrapResult<T>(
          this.singleResult ? (data as T) : ([data] as unknown as T),
        );
      }

      if (this.op === "delete") {
        const idFilter = this.getIdFilter();
        if (!idFilter) {
          return this.wrapResult<T>(null, new ApiError(400, "Delete requires an id filter"));
        }
        await api.delete(`${this.path}/${idFilter}`);
        return this.wrapResult<T>(null as T);
      }

      return this.wrapResult<T>(null, new ApiError(400, `Unknown operation: ${this.op}`));
    } catch (err) {
      return this.wrapResult<T>(null, err);
    }
  }

  then<TResult1 = QueryResult<T>, TResult2 = never>(
    onfulfilled?: ((value: QueryResult<T>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

export function from(table: string): QueryBuilder {
  return new QueryBuilder(table);
}
