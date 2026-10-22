"use client";

import { useState } from "react";
import { FileText, UploadCloud, X, Loader2 } from "lucide-react";
import { FieldShell } from "./fields";

/** Uploads any file (e.g. a PDF brochure) to Blob and stores the resulting URL. */
export function FileField({
  label,
  name,
  defaultValue,
  hint,
  accept = ".pdf,application/pdf",
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  hint?: string;
  accept?: string;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Upload failed");
      else setUrl(data.url);
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  const filename = url ? decodeURIComponent(url.split("/").pop() ?? url) : "";

  return (
    <FieldShell label={label} hint={hint}>
      <input type="hidden" name={name} value={url} />
      {url ? (
        <div className="flex items-center gap-3 rounded-sm border border-border bg-background px-4 py-3">
          <FileText className="h-5 w-5 shrink-0 text-gold" strokeWidth={1.5} />
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-0 flex-1 truncate text-sm text-foreground hover:text-gold"
          >
            {filename}
          </a>
          <button
            type="button"
            onClick={() => setUrl("")}
            aria-label="Remove"
            className="text-muted hover:text-red-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label className="flex cursor-pointer items-center gap-2 rounded-sm border border-dashed border-border bg-background px-4 py-3 text-sm text-muted transition-colors hover:border-gold hover:text-gold">
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <UploadCloud className="h-5 w-5" strokeWidth={1.5} />
          )}
          {uploading ? "Uploading…" : "Upload file"}
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      )}
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </FieldShell>
  );
}
