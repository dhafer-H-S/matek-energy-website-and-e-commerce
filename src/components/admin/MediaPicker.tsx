"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Search, UploadCloud, Check, Loader2 } from "lucide-react";
import { addMediaFromUrl } from "@/lib/actions/media";
import { cn } from "@/lib/utils";

export interface PickedItem {
  url: string;
  alt?: string;
  type?: "image" | "video";
}

interface MediaRow {
  id: string;
  url: string;
  alt: string | null;
  type: "image" | "video";
}

interface PexelsResult {
  id: string;
  url: string;
  thumb: string;
  photographer: string;
  width: number;
  height: number;
  alt?: string;
}

interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (items: PickedItem[]) => void;
  multiple?: boolean;
  accept?: "image" | "video";
}

type Tab = "library" | "pexels" | "upload";

export function MediaPicker({
  open,
  onClose,
  onSelect,
  multiple = false,
  accept = "image",
}: MediaPickerProps) {
  const [tab, setTab] = useState<Tab>("pexels");
  const [selected, setSelected] = useState<Record<string, PickedItem>>({});

  // Library
  const [library, setLibrary] = useState<MediaRow[]>([]);
  const [libLoading, setLibLoading] = useState(false);

  // Pexels
  const [query, setQuery] = useState("");
  const [pexels, setPexels] = useState<PexelsResult[]>([]);
  const [pexLoading, setPexLoading] = useState(false);

  // Upload
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const loadLibrary = useCallback(async () => {
    setLibLoading(true);
    try {
      const res = await fetch("/api/media");
      const data = await res.json();
      setLibrary(
        (data.media ?? []).filter((m: MediaRow) => m.type === accept),
      );
    } catch {
      setLibrary([]);
    } finally {
      setLibLoading(false);
    }
  }, [accept]);

  useEffect(() => {
    if (open) {
      setSelected({});
      if (tab === "library") loadLibrary();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (open && tab === "library") loadLibrary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function runPexels() {
    if (!query.trim()) return;
    setPexLoading(true);
    try {
      const res = await fetch(
        `/api/pexels?query=${encodeURIComponent(query)}&type=${
          accept === "video" ? "video" : "photo"
        }`,
      );
      const data = await res.json();
      setPexels(data.results ?? []);
    } catch {
      setPexels([]);
    } finally {
      setPexLoading(false);
    }
  }

  function toggle(item: PickedItem) {
    setSelected((prev) => {
      if (multiple) {
        const next = { ...prev };
        if (next[item.url]) delete next[item.url];
        else next[item.url] = item;
        return next;
      }
      return { [item.url]: item };
    });
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error ?? "Upload failed");
        return;
      }
      const item: PickedItem = {
        url: data.url,
        alt: file.name,
        type: accept,
      };
      setSelected((prev) => (multiple ? { ...prev, [item.url]: item } : { [item.url]: item }));
      await loadLibrary();
      setTab("library");
    } catch {
      setUploadError("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function confirm() {
    const items = Object.values(selected);
    // Persist Pexels selections into the media library for reuse.
    await Promise.all(
      items.map((it) => {
        const fromPexels = pexels.find((p) => p.url === it.url);
        if (fromPexels) {
          return addMediaFromUrl({
            url: it.url,
            alt: fromPexels.alt,
            type: accept,
            source: "pexels",
            width: fromPexels.width,
            height: fromPexels.height,
            pexelsId: fromPexels.id,
            photographer: fromPexels.photographer,
          }).catch(() => null);
        }
        return Promise.resolve(null);
      }),
    );
    onSelect(items);
    onClose();
  }

  if (!open) return null;

  const count = Object.keys(selected).length;
  const tabs: { id: Tab; label: string }[] = [
    { id: "pexels", label: "Pexels" },
    { id: "library", label: "Library" },
    { id: "upload", label: "Upload" },
  ];

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-md border border-border bg-surface shadow-lift">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-1">
            {tabs.map((tb) => (
              <button
                key={tb.id}
                type="button"
                onClick={() => setTab(tb.id)}
                className={cn(
                  "rounded-sm px-4 py-2 text-sm font-medium transition-colors",
                  tab === tb.id
                    ? "bg-gold/15 text-gold"
                    : "text-muted hover:text-foreground",
                )}
              >
                {tb.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === "pexels" && (
            <div>
              <div
                className="mb-5 flex gap-2"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    if (!pexLoading) void runPexels();
                  }
                }}
              >
                <div className="relative flex-1">
                  <Search className="absolute inset-s-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search luxury interiors, architecture, city skyline…"
                    className="w-full rounded-sm border border-border bg-background px-4 py-2.5 ps-10 text-sm outline-none focus:border-gold"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => void runPexels()}
                  disabled={pexLoading}
                  className="rounded-sm bg-foreground px-5 py-2.5 text-xs font-semibold uppercase tracking-luxe text-background hover:bg-gold hover:text-ink disabled:opacity-60"
                >
                  {pexLoading ? "Searching…" : "Search"}
                </button>
              </div>
              {pexLoading ? (
                <Loader pexels />
              ) : pexels.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted">
                  Search Pexels for high-quality imagery to use across the site.
                </p>
              ) : (
                <Grid>
                  {pexels.map((p) => (
                    <Thumb
                      key={p.id}
                      src={p.thumb}
                      selected={!!selected[p.url]}
                      onClick={() =>
                        toggle({ url: p.url, alt: p.alt, type: accept })
                      }
                      caption={p.photographer}
                    />
                  ))}
                </Grid>
              )}
            </div>
          )}

          {tab === "library" && (
            <div>
              {libLoading ? (
                <Loader />
              ) : library.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted">
                  Your media library is empty. Upload files or pick from Pexels.
                </p>
              ) : (
                <Grid>
                  {library.map((m) => (
                    <Thumb
                      key={m.id}
                      src={m.url}
                      selected={!!selected[m.url]}
                      onClick={() =>
                        toggle({
                          url: m.url,
                          alt: m.alt ?? undefined,
                          type: m.type,
                        })
                      }
                    />
                  ))}
                </Grid>
              )}
            </div>
          )}

          {tab === "upload" && (
            <div className="flex flex-col items-center justify-center py-10">
              <label className="flex w-full max-w-md cursor-pointer flex-col items-center gap-3 rounded-md border border-dashed border-border bg-background px-6 py-12 text-center transition-colors hover:border-gold">
                {uploading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-gold" />
                ) : (
                  <UploadCloud className="h-8 w-8 text-gold" strokeWidth={1.5} />
                )}
                <span className="text-sm font-medium text-foreground">
                  {uploading ? "Uploading…" : "Click to upload a file"}
                </span>
                <span className="text-xs text-muted">
                  {accept === "video" ? "MP4 video" : "JPG, PNG, WebP"} · stored on
                  Vercel Blob
                </span>
                <input
                  type="file"
                  accept={accept === "video" ? "video/*" : "image/*"}
                  className="hidden"
                  onChange={handleUpload}
                  disabled={uploading}
                />
              </label>
              {uploadError ? (
                <p className="mt-4 max-w-md text-center text-sm text-red-500">
                  {uploadError}
                </p>
              ) : null}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <span className="text-sm text-muted">
            {count > 0
              ? `${count} selected`
              : multiple
                ? "Select one or more"
                : "Select an item"}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-sm border border-border px-5 py-2.5 text-sm text-foreground hover:bg-background-alt"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirm}
              disabled={count === 0}
              className="inline-flex items-center gap-2 rounded-sm bg-gold px-5 py-2.5 text-sm font-medium text-ink hover:bg-gold-strong disabled:opacity-50"
            >
              <Check className="h-4 w-4" /> Use {multiple && count > 1 ? `${count} items` : "selection"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {children}
    </div>
  );
}

function Thumb({
  src,
  selected,
  onClick,
  caption,
}: {
  src: string;
  selected: boolean;
  onClick: () => void;
  caption?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative aspect-4/3 overflow-hidden rounded-sm border-2 transition-all",
        selected ? "border-gold" : "border-transparent hover:border-border-strong",
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={caption ?? ""}
        className="h-full w-full object-cover transition-transform group-hover:scale-105"
        loading="lazy"
      />
      {selected ? (
        <span className="absolute inset-e-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-gold text-ink">
          <Check className="h-4 w-4" />
        </span>
      ) : null}
      {caption ? (
        <span className="absolute inset-x-0 bottom-0 truncate bg-ink/60 px-2 py-1 text-[10px] text-white/80">
          {caption}
        </span>
      ) : null}
    </button>
  );
}

function Loader({ pexels }: { pexels?: boolean }) {
  return (
    <div className="flex items-center justify-center py-16 text-muted">
      <Loader2 className="h-6 w-6 animate-spin" />
      <span className="ms-2 text-sm">{pexels ? "Searching Pexels…" : "Loading…"}</span>
    </div>
  );
}
