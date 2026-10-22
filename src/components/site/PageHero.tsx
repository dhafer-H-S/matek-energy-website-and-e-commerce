import type { ReactNode } from "react";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  image?: string | null;
  meta?: ReactNode;
}

/** Compact page banner used on interior pages. */
export function PageHero({ eyebrow, title, subtitle, image, meta }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-navy text-white">
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
      ) : (
        <div className="absolute inset-0 bg-linear-to-br from-navy via-navy-deep to-brand/60" />
      )}
      <div className="container-luxe relative z-10 py-14 text-center sm:py-20">
        {eyebrow ? <span className="eyebrow text-white/80">{eyebrow}</span> : null}
        <h1 className="mx-auto mt-2 max-w-3xl font-display text-3xl font-semibold leading-tight text-balance sm:text-5xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/80 sm:text-lg">{subtitle}</p>
        ) : null}
        {meta ? <div className="mt-5 flex flex-wrap justify-center gap-3 text-sm text-white/80">{meta}</div> : null}
      </div>
    </section>
  );
}
