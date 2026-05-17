// This file used to initialize the Supabase client.
// It now re-exports a drop-in compatible shim backed by our local backend API.
// All existing imports of `supabase` continue to work.

import { from } from "@/api/query-builder";
import { auth } from "@/api/auth-shim";
import { storage } from "@/api/storage-shim";
import { functions } from "@/api/functions-shim";
import { realtime } from "@/api/realtime-shim";

export const supabase = {
  from,
  auth,
  storage,
  functions,
  channel: realtime.channel,
  removeChannel: realtime.removeChannel,
  // Drop-in for supabase.getChannels() — legacy code calls this on
  // unmount to enumerate and clean up open subscriptions. With our
  // socket.io-backed shim there is nothing global to enumerate, so
  // return an empty array (the caller iterates it harmlessly).
  getChannels: () => [] as Array<{ topic: string }>,
  rpc: async (_fn: string, _params?: unknown) => {
    // RPC functions are now REST endpoints under /api/statistics, /api/documents/semantic-search, etc.
    // Any remaining rpc() callers should be migrated.
    console.warn(
      `supabase.rpc('${_fn}') is no longer supported. Call the equivalent REST endpoint instead.`,
    );
    return { data: null, error: { message: `rpc ${_fn} not implemented` } };
  },
};

export default supabase;
