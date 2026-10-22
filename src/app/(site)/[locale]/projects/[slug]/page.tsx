import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/site/PageHero";
import { PlainProse, RichText } from "@/components/ui/RichText";
import { getProjectBySlug, listProjects } from "@/lib/queries/shop";
import { buildMetadata } from "@/lib/seo";
import { ProjectGallery } from "@/components/projects/ProjectGallery";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ConsultationCta } from "@/components/site/ConsultationCta";
import { listServices } from "@/lib/queries/services";

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
  const typeLabels = t.raw("types") as Record<string, string>;
  const images = [...new Set([p.image, ...p.gallery].filter(Boolean) as string[])];
  const [projects, services] = await Promise.all([listProjects(locale), listServices(locale)]);
  const related = projects.filter((project) => project.id !== p.id).sort((a, b) => Number(b.kind === p.kind) - Number(a.kind === p.kind)).slice(0, 3);
  const steps = t.raw("planningSteps") as { title: string; text: string }[];
  return (
    <>
      <PageHero eyebrow={p.kind ? typeLabels[p.kind] || p.kind : undefined} title={p.title} subtitle={p.subtitle ?? undefined} image={p.image} />
      <section className="py-14">
        <div className="container-luxe">
          <Link href="/projects" className="mb-8 inline-flex text-sm font-semibold text-brand">← {t("back")}</Link>
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
          <span className="eyebrow text-brand">{t("introEyebrow")}</span>
          <h2 className="mb-5 mt-3 font-display text-3xl text-navy">{t("overview")}</h2>
          {p.description ? (/<[a-z][\s\S]*>/i.test(p.description) ? <RichText html={p.description} /> : <PlainProse text={p.description} className="text-muted" />) : <p className="leading-relaxed text-muted">{t("overviewFallback")}</p>}
          {images.length > 0 ? (
            <>
              <h2 className="mt-10 font-display text-2xl text-navy">{t("gallery")}</h2>
              <p className="mb-5 mt-2 text-sm text-muted">{t("galleryHint")}</p>
              <ProjectGallery images={images} title={p.title} />
            </>
          ) : null}
          <div className="mt-10 rounded-3xl bg-background-alt p-6 sm:p-8">
            <h2 className="font-display text-2xl text-navy">{t("planningTitle")}</h2>
            <p className="mt-3 leading-relaxed text-muted">{t("planningText")}</p>
            <div className="mt-6 space-y-5">{steps.map((step, index) => <div key={step.title} className="flex gap-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-brand">{index + 1}</span><div><h3 className="font-semibold text-navy">{step.title}</h3><p className="mt-1 text-sm leading-relaxed text-muted">{step.text}</p></div></div>)}</div>
          </div>
          </div>
          <aside className="space-y-6 lg:sticky lg:top-44">
            <div className="rounded-3xl bg-navy p-7 text-white"><h2 className="font-display text-2xl">{t("similarTitle")}</h2><p className="mt-3 text-sm leading-relaxed text-white/75">{t("similarText")}</p><Link href={{ pathname: "/contact", query: { subject: p.title } }} className="mt-6 flex justify-center rounded-full bg-brand px-5 py-3 text-sm font-semibold hover:bg-white hover:text-navy">{t("discussProject")}</Link></div>
            {services.length ? <div className="rounded-3xl border border-border p-7"><h2 className="font-display text-xl text-navy">{t("exploreServices")}</h2><div className="mt-4 divide-y divide-border">{services.map((service) => <Link key={service.id} href={`/services/${service.slug}`} className="flex justify-between gap-3 py-3 text-sm text-navy hover:text-brand">{service.title}<span aria-hidden="true">↗</span></Link>)}</div></div> : null}
          </aside>
          </div>
        </div>
      </section>
      {related.length ? <section className="bg-background-alt py-14"><div className="container-luxe"><h2 className="mb-8 font-display text-3xl text-navy">{t("moreProjects")}</h2><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{related.map((project) => <ProjectCard key={project.id} project={project} locale={locale} />)}</div></div></section> : null}
      <ConsultationCta locale={locale} />
    </>
  );
}
