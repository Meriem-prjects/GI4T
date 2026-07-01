import { useEffect, useState } from "react";

/**
 * Returns `value` after it has stayed unchanged for `delayMs`. Used to
 * avoid firing an expensive query on every keystroke — the AI search
 * takes 3–5 s per call and typing "administration" (14 chars) would
 * otherwise fire 14 in-flight embeddings requests in a row.
 */
export function useDebouncedValue<T>(value: T, delayMs = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}
