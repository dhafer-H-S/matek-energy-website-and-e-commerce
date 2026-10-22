"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";

export function ProjectGallery({ images, title }: { images: string[]; title: string }) {
  const t = useTranslations("projects");
  const dialog = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState(0);
  if (!images.length) return null;
  const move = (offset: number) => setActive((index) => (index + offset + images.length) % images.length);
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {images.map((src, index) => (
          <button key={src} type="button" aria-label={t("openImage", { number: index + 1 })} onClick={() => { setActive(index); dialog.current?.showModal(); }} className={`group relative overflow-hidden rounded-2xl bg-background-alt text-left ${index === 0 ? "sm:col-span-2" : ""}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`${title} — ${index + 1}`} loading="lazy" className={`w-full object-cover transition-transform duration-500 group-hover:scale-105 ${index === 0 ? "aspect-16/10" : "aspect-4/3"}`} />
            <span className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-navy/85 px-4 py-2 text-xs font-semibold text-white"><Expand className="h-4 w-4" />{t("enlarge")}</span>
          </button>
        ))}
      </div>
      <dialog ref={dialog} aria-label={t("gallery")} onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }} onKeyDown={(event) => {
        if (event.key === "Escape") { event.preventDefault(); dialog.current?.close(); }
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); move(event.key === "ArrowLeft" ? -1 : 1); }
      }} className="fixed inset-0 m-auto h-[90dvh] w-[94vw] max-w-6xl overflow-hidden rounded-2xl bg-navy p-4 text-white backdrop:bg-black/85 sm:p-6">
        <div className="flex items-center justify-between gap-4 pb-4">
          <p className="truncate text-sm">{title} · {active + 1} / {images.length}</p>
          <button type="button" autoFocus onClick={() => dialog.current?.close()} aria-label={t("closeGallery")} className="shrink-0 rounded-full p-2 hover:bg-white/15"><X className="h-6 w-6" /></button>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[active]} alt={`${title} — ${active + 1}`} className="h-[calc(100%-4rem)] w-full object-contain" />
        {images.length > 1 ? <div className="absolute inset-x-4 top-1/2 flex justify-between">
          <button type="button" onClick={() => move(-1)} aria-label={t("previousImage")} className="rounded-full bg-navy/85 p-3 hover:bg-brand"><ChevronLeft /></button>
          <button type="button" onClick={() => move(1)} aria-label={t("nextImage")} className="rounded-full bg-navy/85 p-3 hover:bg-brand"><ChevronRight /></button>
        </div> : null}
      </dialog>
    </>
  );
}
