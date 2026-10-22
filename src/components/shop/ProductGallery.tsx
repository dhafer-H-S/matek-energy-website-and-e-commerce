"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ProductGallery({
  images,
  alt,
  badges,
}: {
  images: string[];
  alt: string;
  badges?: React.ReactNode;
}) {
  const t = useTranslations("shop");
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  if (images.length === 0) return <div className="aspect-square rounded-3xl bg-background-alt" />;
  const go = (d: number) => setI((v) => (v + d + images.length) % images.length);

  return (
    <div className="lg:sticky lg:top-44">
      <div
        className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-3xl border border-border bg-white shadow-sm"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
        }}
        onMouseLeave={() => setZoom(null)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[i]}
          alt={alt}
          className="h-full w-full object-cover transition-transform duration-200 ease-out"
          style={zoom ? { transform: "scale(1.8)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
        />
        {badges ? <div className="pointer-events-none absolute start-4 top-4 flex flex-col gap-2">{badges}</div> : null}
        {images.length > 1 ? (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Previous" className="absolute start-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-navy opacity-0 shadow transition-opacity group-hover:opacity-100 rtl:rotate-180"><ChevronLeft className="h-5 w-5" /></button>
            <button type="button" onClick={() => go(1)} aria-label="Next" className="absolute end-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-navy opacity-0 shadow transition-opacity group-hover:opacity-100 rtl:rotate-180"><ChevronRight className="h-5 w-5" /></button>
            <span className="absolute bottom-3 end-3 rounded-full bg-navy/70 px-3 py-1 text-xs font-medium text-white">{i + 1} / {images.length}</span>
          </>
        ) : null}
      </div>
      {images[i].startsWith("/seed/pexels/") ? <p className="mt-3 text-xs leading-relaxed text-muted">{t("illustrativeImage")}</p> : null}
      {images.length > 1 ? (
        <div className="mt-4 grid grid-cols-5 gap-3">
          {images.map((src, idx) => (
            <button key={src} type="button" onClick={() => setI(idx)} aria-label={`${alt} ${idx + 1}`} className={`aspect-square overflow-hidden rounded-xl border-2 transition ${idx === i ? "border-brand ring-2 ring-brand/20" : "border-border opacity-80 hover:opacity-100"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
