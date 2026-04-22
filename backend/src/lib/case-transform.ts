// Recursively convert object keys between camelCase and snake_case.
// Used to keep the API surface compatible with the existing Supabase-style
// frontend code (which expects snake_case columns).

export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
}

export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

// Aliases applied IN ADDITION to the snake_case key (for backwards compat
// with Supabase's relation naming).
const RELATION_ALIASES: Record<string, string> = {
  documentTypeRel: "document_types",
  // `category` (singular FK) is exposed as `categories` too (Supabase default
  // pluralization for FK → parent table name).
  category: "categories",
};

function isPrismaDecimal(value: unknown): value is { toNumber: () => number } {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { toNumber?: unknown }).toNumber === "function"
  );
}

function isBigInt(value: unknown): value is bigint {
  return typeof value === "bigint";
}

export function transformKeysToSnake<T>(input: T): T {
  if (input === null || input === undefined) return input;
  if (Array.isArray(input)) {
    return input.map(transformKeysToSnake) as unknown as T;
  }
  if (input instanceof Date) return input;
  if (isBigInt(input)) return Number(input) as unknown as T;
  if (isPrismaDecimal(input)) {
    return (input as { toNumber: () => number }).toNumber() as unknown as T;
  }
  if (typeof input !== "object") return input;

  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    const transformedValue = transformKeysToSnake(value);
    const newKey = camelToSnake(key);
    out[newKey] = transformedValue;
    // Add relation alias if needed (so frontend sees `document_types`
    // instead of just `document_type_rel`)
    if (RELATION_ALIASES[key]) {
      out[RELATION_ALIASES[key]] = transformedValue;
    }
  }
  return out as T;
}

export function transformKeysToCamel<T>(input: T): T {
  if (input === null || input === undefined) return input;
  if (Array.isArray(input)) {
    return input.map(transformKeysToCamel) as unknown as T;
  }
  if (input instanceof Date) return input;
  if (typeof input !== "object") return input;

  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    out[snakeToCamel(key)] = transformKeysToCamel(value);
  }
  return out as T;
}
