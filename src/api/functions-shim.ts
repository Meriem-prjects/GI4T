// Supabase functions.invoke() compatible shim.
import { api, ApiError } from "./client.js";

export const functions = {
  async invoke<T = unknown>(
    name: string,
    opts: { body?: unknown; headers?: Record<string, string> } = {},
  ): Promise<{ data: T | null; error: ApiError | null }> {
    try {
      const data = await api.post<T>(`/api/fn/${name}`, opts.body, {
        headers: opts.headers,
      });
      return { data, error: null };
    } catch (err) {
      return {
        data: null,
        error: err instanceof ApiError ? err : new ApiError(500, String(err)),
      };
    }
  },
};
