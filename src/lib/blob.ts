/**
 * Resolve the Vercel Blob read-write token regardless of its environment-variable
 * name. The standard name is BLOB_READ_WRITE_TOKEN, but connecting a Blob store
 * with a custom prefix produces names like `mystore_READ_WRITE_TOKEN`. Vercel
 * Blob tokens always start with `vercel_blob_rw_`, so fall back to any env value
 * with that prefix. Returns undefined when no Blob store is configured (the
 * uploader then stores files locally in development).
 */
export function blobToken(): string | undefined {
  const explicit = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (explicit) return explicit;
  for (const value of Object.values(process.env)) {
    if (typeof value === "string" && value.startsWith("vercel_blob_rw_")) return value.trim();
  }
  return undefined;
}
