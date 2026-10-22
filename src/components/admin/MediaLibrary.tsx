"use client";

import { useEffect, useState, useCallback } from "react";
import { UploadCloud, Trash2, Copy, Check, Loader2 } from "lucide-react";
import { deleteMedia } from "@/lib/actions/media";
import { EmptyState } from "@/components/admin/ui";

interface MediaRow {
  id: string;
  url: string;
  alt: string | null;
  type: "image" | "video";
  source: string;
}

export function MediaLibrary() {
  const [items, setItems] = useState<MediaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/media");
      const data = await res.json();
      setItems(data.media ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
      if (!res.ok) {
        setError(data.error ?? "Upload failed");
      } else {
        await load();
      }
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function copy(url: string, id: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* ignore */
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this media item?")) return;
    await deleteMedia(id);
    setItems((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted">{items.length} items</p>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xs bg-foreground px-5 py-2.5 text-xs font-semibold uppercase tracking-luxe text-background transition-colors hover:bg-gold hover:text-ink">
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UploadCloud className="h-4 w-4" />
          )}
          {uploading ? "Uploading…" : "Upload"}
          <input
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {error ? (
        <p className="mb-4 rounded-sm border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No media yet"
          description="Upload images or pick from Pexels inside any content form."
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {items.map((m) => (
            <div
              key={m.id}
              className="group relative overflow-hidden rounded-sm border border-border bg-surface"
            >
              <div className="aspect-square overflow-hidden bg-background-alt">
                {m.type === "video" ? (
                  // eslint-disable-next-line jsx-a11y/media-has-caption
                  <video src={m.url} className="h-full w-full object-cover" muted />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.url}
                    alt={m.alt ?? ""}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                )}
              </div>
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-ink/70 px-2 py-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => copy(m.url, m.id)}
                  className="inline-flex items-center gap-1 text-[11px] text-white hover:text-gold"
                >
                  {copied === m.id ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied === m.id ? "Copied" : "Copy URL"}
                </button>
                <button
                  type="button"
                  onClick={() => remove(m.id)}
                  aria-label="Delete"
                  className="text-white hover:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
