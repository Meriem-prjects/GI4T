// HTTP client that replaces the Supabase client.
// All backend calls go through here.

// `||` (not `??`) so an empty-string `VITE_API_URL` — the intended production
// default, meaning "use relative URLs" — also triggers the fallback. With `??`
// an empty string would slip through and produce broken URLs like `"/api/…"`
// that fail `new URL()` parsing.
const API_URL = (import.meta.env.VITE_API_URL as string | undefined) || "";
const TOKEN_KEY = "jc_auth_token";

type AuthListener = (token: string | null) => void;
const listeners = new Set<AuthListener>();

export function getToken(): string | null {
  return typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
  listeners.forEach((fn) => fn(token));
}

export function onAuthChange(fn: AuthListener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public override message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | undefined | null>;
  formData?: FormData;
  signal?: AbortSignal;
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const base = path.startsWith("http") ? path : `${API_URL}${path}`;
  if (!query) return base;
  // Provide a base so `new URL()` accepts relative paths (`/api/…`) when
  // `API_URL` is empty. Absolute `base` values ignore the second arg.
  const url = new URL(
    base,
    typeof window !== "undefined" ? window.location.origin : "http://localhost",
  );
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

export async function apiFetch<T = unknown>(path: string, opts: RequestOptions = {}): Promise<T> {
  const url = buildUrl(path, opts.query);
  const headers: Record<string, string> = { ...(opts.headers ?? {}) };

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let body: BodyInit | undefined;
  if (opts.formData) {
    body = opts.formData;
  } else if (opts.body instanceof FormData) {
    // Don't set Content-Type — browser will add the multipart boundary.
    body = opts.body;
  } else if (opts.body !== undefined) {
    headers["Content-Type"] ??= "application/json";
    body = JSON.stringify(opts.body);
  }

  const res = await fetch(url, {
    method: opts.method ?? (body ? "POST" : "GET"),
    headers,
    body,
    signal: opts.signal,
    credentials: "include",
  });

  if (res.status === 401) {
    setToken(null);
  }

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const message =
      (isJson && (data as { error?: string })?.error) || res.statusText || "Request failed";
    throw new ApiError(res.status, message, data);
  }

  return data as T;
}

export const api = {
  get: <T>(path: string, opts?: Omit<RequestOptions, "method" | "body">) =>
    apiFetch<T>(path, { ...opts, method: "GET" }),
  post: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, "method" | "body">) =>
    apiFetch<T>(path, { ...opts, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, "method" | "body">) =>
    apiFetch<T>(path, { ...opts, method: "PATCH", body }),
  put: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, "method" | "body">) =>
    apiFetch<T>(path, { ...opts, method: "PUT", body }),
  delete: <T>(path: string, opts?: Omit<RequestOptions, "method" | "body">) =>
    apiFetch<T>(path, { ...opts, method: "DELETE" }),
};

export const API_BASE_URL = API_URL;
