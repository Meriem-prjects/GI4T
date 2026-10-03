// Supabase-storage compatible shim.
import { API_BASE_URL, api, ApiError } from "./client.js";

interface UploadResult {
  // `path` is the key the server actually saved (it prefixes a UUID), and
  // `url` its absolute public URL built from STORAGE_PUBLIC_URL.
  data: { path: string; url: string } | null;
  error: ApiError | null;
}

interface PublicUrlResult {
  data: { publicUrl: string };
}

interface DownloadResult {
  data: Blob | null;
  error: ApiError | null;
}

class StorageBucket {
  constructor(private readonly bucket: string) {}

  async upload(
    path: string,
    file: File | Blob | ArrayBuffer,
    _opts?: { upsert?: boolean; contentType?: string },
  ): Promise<UploadResult> {
    try {
      const form = new FormData();
      const blob =
        file instanceof Blob ? file : new Blob([file as ArrayBuffer]);
      const filename = path.split("/").pop() ?? "upload";
      form.append("file", blob, filename);
      form.append("owner", path.split("/")[0] ?? "");

      const res = await api.post<{ key: string; url: string }>(
        `/api/storage/${this.bucket}/upload`,
        undefined,
        { formData: form },
      );
      return { data: { path: res.key, url: res.url }, error: null };
    } catch (err) {
      return {
        data: null,
        error: err instanceof ApiError ? err : new ApiError(500, String(err)),
      };
    }
  }

  getPublicUrl(path: string): PublicUrlResult {
    // Storage reads are public (GET /api/storage/:bucket/* has no auth), so
    // no token here: these URLs end up saved in the DB and shown publicly.
    return {
      data: {
        publicUrl: `${API_BASE_URL}/api/storage/${this.bucket}/${path}`,
      },
    };
  }

  async createSignedUrl(
    path: string,
    _expiresIn: number,
  ): Promise<{ data: { signedUrl: string } | null; error: ApiError | null }> {
    return { data: { signedUrl: this.getPublicUrl(path).data.publicUrl }, error: null };
  }

  async remove(paths: string[]): Promise<{ error: ApiError | null }> {
    try {
      for (const p of paths) {
        await api.delete(`/api/storage/${this.bucket}/${p}`);
      }
      return { error: null };
    } catch (err) {
      return { error: err instanceof ApiError ? err : new ApiError(500, String(err)) };
    }
  }

  async download(path: string): Promise<DownloadResult> {
    try {
      const url = this.getPublicUrl(path).data.publicUrl;
      const res = await fetch(url);
      if (!res.ok) throw new ApiError(res.status, res.statusText);
      return { data: await res.blob(), error: null };
    } catch (err) {
      return {
        data: null,
        error: err instanceof ApiError ? err : new ApiError(500, String(err)),
      };
    }
  }

  async list(
    _prefix?: string,
  ): Promise<{ data: Array<{ name: string }> | null; error: ApiError | null }> {
    // Not implemented on backend yet; return empty list to avoid crashes.
    return { data: [], error: null };
  }
}

export const storage = {
  from(bucket: string): StorageBucket {
    return new StorageBucket(bucket);
  },
};
