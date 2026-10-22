import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/site/PageHero";
import { PlainProse } from "@/components/ui/RichText";
import { getProjectBySlug } from "@/lib/queries/shop";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const p = await getProjectBySlug(slug, locale);
  if (!p) return {};
  return buildMetadata({ title: p.title, description: p.subtitle, path: `/projects/${p.slug}`, locale, image: p.image });
}

export default async function ProjectPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const p = await getProjectBySlug(slug, locale);
  if (!p) notFound();
  const t = await getTranslations("projects");
  const images = [...new Set([p.image, ...p.gallery].filter(Boolean) as string[])];
  return (
    <>
      <PageHero eyebrow={p.kind ?? undefined} title={p.title} subtitle={p.subtitle ?? undefined} image={p.image} />
      <section className="py-14">
        <div className="container-luxe max-w-4xl">
          {p.description ? <PlainProse text={p.description} /> : null}
          {images.length > 0 ? (
            <>
              <h2 className="mt-10 font-display text-2xl text-navy">{t("gallery")}</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {images.map((src) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={src} src={src} alt={p.title} className="aspect-4/3 w-full rounded-2xl object-cover" />
                ))}
              </div>
            </>
          ) : null}
          <Link href="/projects" className="mt-10 inline-flex text-sm font-semibold text-brand">← {t("back")}</Link>
        </div>
      </section>
    </>
  );
}
