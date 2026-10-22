"use client";

import { useState } from "react";
import { ImagePlus, X, Plus } from "lucide-react";
import { MediaPicker, type PickedItem } from "../MediaPicker";
import { FieldShell } from "./fields";
import { cn } from "@/lib/utils";

export function ImageField({
  label,
  name,
  defaultValue,
  accept = "image",
  hint,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  accept?: "image" | "video";
  hint?: string;
  required?: boolean;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [open, setOpen] = useState(false);

  return (
    <FieldShell label={label} hint={hint} required={required}>
      <input type="hidden" name={name} value={url} />
      {url ? (
        <div className="relative w-full max-w-xs overflow-hidden rounded-sm border border-border">
          {accept === "video" ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video src={url} className="aspect-video w-full object-cover" muted />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="aspect-video w-full object-cover" />
          )}
          <div className="absolute inset-e-1.5 top-1.5 flex gap-1.5">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded-xs bg-ink/70 px-2 py-1 text-[11px] font-medium text-white hover:bg-ink"
            >
              Change
            </button>
            <button
              type="button"
              onClick={() => setUrl("")}
              aria-label="Remove"
              className="flex h-7 w-7 items-center justify-center rounded-xs bg-ink/70 text-white hover:bg-red-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex aspect-video w-full max-w-xs flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-border bg-background text-muted transition-colors hover:border-gold hover:text-gold"
        >
          <ImagePlus className="h-7 w-7" strokeWidth={1.5} />
          <span className="text-sm">Choose {accept}</span>
        </button>
      )}
      <MediaPicker
        open={open}
        onClose={() => setOpen(false)}
        multiple={false}
        accept={accept}
        onSelect={(items: PickedItem[]) => setUrl(items[0]?.url ?? "")}
      />
    </FieldShell>
  );
}

export function GalleryField({
  label,
  name,
  defaultValue,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string[] | null;
  hint?: string;
}) {
  const [urls, setUrls] = useState<string[]>(defaultValue ?? []);
  const [open, setOpen] = useState(false);

  function remove(u: string) {
    setUrls((prev) => prev.filter((x) => x !== u));
  }

  return (
    <FieldShell label={label} hint={hint}>
      <input type="hidden" name={name} value={JSON.stringify(urls)} />
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
        {urls.map((u) => (
          <div
            key={u}
            className="group relative aspect-square overflow-hidden rounded-sm border border-border"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={u} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => remove(u)}
              aria-label="Remove"
              className="absolute inset-e-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink/70 text-white opacity-0 transition-opacity hover:bg-red-500 group-hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            "flex aspect-square flex-col items-center justify-center gap-1 rounded-sm border border-dashed border-border text-muted transition-colors hover:border-gold hover:text-gold",
          )}
        >
          <Plus className="h-6 w-6" strokeWidth={1.5} />
          <span className="text-[11px]">Add</span>
        </button>
      </div>
      <MediaPicker
        open={open}
        onClose={() => setOpen(false)}
        multiple
        accept="image"
        onSelect={(items: PickedItem[]) =>
          setUrls((prev) => [
            ...prev,
            ...items.map((i) => i.url).filter((u) => !prev.includes(u)),
          ])
        }
      />
    </FieldShell>
  );
}
