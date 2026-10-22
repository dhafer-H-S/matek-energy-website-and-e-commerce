"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { BannerView } from "@/lib/queries/shop";

export function HeroSlider({ banners }: { banners: BannerView[] }) {
  const t = useTranslations("common");
  const [i, setI] = useState(0);
  const n = banners.length;

  useEffect(() => {
    if (n < 2) return;
    const id = setInterval(() => setI((v) => (v + 1) % n), 6000);
    return () => clearInterval(id);
  }, [n]);

  if (n === 0) return null;

  return (
    <section className="relative overflow-hidden bg-navy">
      <div className="relative h-[320px] sm:h-[420px] lg:h-[520px]">
        {banners.map((b, idx) => {
          const content = (
            <>
              <picture>
                {b.mobileImage ? <source media="(max-width: 640px)" srcSet={b.mobileImage} /> : null}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.image} alt={b.title ?? ""} className="absolute inset-0 h-full w-full object-cover" />
              </picture>
              {b.title || b.subtitle || b.eyebrow || b.ctaLabel ? (
                <>
                  <div className="absolute inset-0 bg-linear-to-r from-navy-deep/80 via-navy-deep/40 to-transparent" />
                  <div className="container-luxe relative flex h-full flex-col justify-center text-white">
                    <div className="max-w-xl">
                      {b.eyebrow ? <span className="eyebrow text-white/80">{b.eyebrow}</span> : null}
                      {b.title ? <h2 className="mt-2 font-display text-3xl font-semibold leading-tight sm:text-5xl">{b.title}</h2> : null}
                      {b.subtitle ? <p className="mt-3 text-base text-white/85 sm:text-lg">{b.subtitle}</p> : null}
                      {b.ctaLabel ? <span className="mt-6 inline-flex rounded-full bg-brand px-7 py-3 text-sm font-semibold">{b.ctaLabel}</span> : null}
                    </div>
                  </div>
                </>
              ) : null}
            </>
          );
          const cls = `absolute inset-0 transition-opacity duration-700 ${idx === i ? "opacity-100" : "pointer-events-none opacity-0"}`;
          return b.linkUrl ? (
            <Link key={b.id} href={b.linkUrl} aria-label={b.title || b.ctaLabel || t("learnMore")} className={cls}>{content}</Link>
          ) : (
            <div key={b.id} className={cls}>{content}</div>
          );
        })}
      </div>
      {n > 1 ? (
        <>
          <button onClick={() => setI((i - 1 + n) % n)} aria-label="Previous" className="absolute start-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-navy hover:bg-white"><ChevronLeft className="h-5 w-5 rtl:rotate-180" /></button>
          <button onClick={() => setI((i + 1) % n)} aria-label="Next" className="absolute end-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-navy hover:bg-white"><ChevronRight className="h-5 w-5 rtl:rotate-180" /></button>
          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
            {banners.map((b, idx) => (
              <button key={b.id} onClick={() => setI(idx)} aria-label={`Slide ${idx + 1}`} className={`h-2.5 rounded-full transition-all ${idx === i ? "w-8 bg-white" : "w-2.5 bg-white/50"}`} />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
