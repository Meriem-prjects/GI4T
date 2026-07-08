import type { Request } from "express";
import { refreshAadEmbeddings } from "../../services/aad-embed.js";

/**
 * Admin-only helper: rebuilds embeddings for every Accès-aux-droits row
 * whose text has changed since the last embed. Idempotent — running it
 * twice in a row does nothing on the second pass. Used to seed the
 * corpus after the initial migration, and as a safety net if the eager
 * on-save hooks ever miss a row (e.g. a direct DB import).
 */
export async function refreshAadEmbeddingsFn(_req: Request) {
  const summary = await refreshAadEmbeddings();
  return { ok: true, summary };
}
