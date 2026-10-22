import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/site/PageHero";
import { listProjects } from "@/lib/queries/shop";
import { buildMetadata } from "@/lib/seo";
import { ArrowUpRight, Camera, Wrench } from "lucide-react";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ConsultationCta } from "@/components/site/ConsultationCta";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "projects" });
  return buildMetadata({ title: t("title"), description: t("subtitle"), path: "/projects", locale });
}

export default async function ProjectsPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ type?: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("projects");
  const typeLabels = t.raw("types") as Record<string, string>;
  const items = await listProjects(locale);
  const { type } = await searchParams;
  const kinds = [...new Set(items.map((p) => p.kind).filter((kind): kind is string => Boolean(kind)))];
  const selected = type && kinds.includes(type) ? type : null;
  const filtered = selected ? items.filter((p) => p.kind === selected) : items;
  const featured = !selected ? items[0] : undefined;
  const cards = featured ? filtered.slice(1) : filtered;
  return (
    <>
      <PageHero title={t("title")} subtitle={t("subtitle")} />
      <section className="py-16">
        <div className="container-luxe">
          <div className="mb-10 grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div><span className="eyebrow text-brand">{t("introEyebrow")}</span><h2 className="mt-3 font-display text-3xl text-navy sm:text-4xl">{t("introTitle")}</h2></div>
            <p className="leading-relaxed text-muted">{t("introText")}</p>
          </div>
          <nav aria-label={t("filterLabel")} className="mb-8 flex flex-wrap gap-2">
            <Link href="/projects" aria-current={!selected ? "page" : undefined} className={`rounded-full border px-5 py-2.5 text-sm font-semibold ${!selected ? "border-navy bg-navy text-white" : "border-border text-navy hover:border-brand"}`}>{t("allTypes")} ({items.length})</Link>
            {kinds.map((kind) => <Link key={kind} href={{ pathname: "/projects", query: { type: kind } }} aria-current={selected === kind ? "page" : undefined} className={`rounded-full border px-5 py-2.5 text-sm font-semibold ${selected === kind ? "border-navy bg-navy text-white" : "border-border text-navy hover:border-brand"}`}>{typeLabels[kind] || kind} ({items.filter((p) => p.kind === kind).length})</Link>)}
          </nav>
          {featured ? <div className="mb-8 grid overflow-hidden rounded-3xl bg-navy text-white lg:grid-cols-2">
            <Link href={`/projects/${featured.slug}`} aria-label={featured.title} className="relative block min-h-64 overflow-hidden">
              {featured.image ? <Image src={featured.image} alt={featured.title} fill unoptimized loading="eager" className="object-cover" /> : null}
            </Link>
            <div className="flex flex-col justify-center p-8 sm:p-12"><span className="eyebrow text-white/65">{t("featured")}</span><h2 className="mt-3 font-display text-3xl">{featured.title}</h2><p className="mt-4 leading-relaxed text-white/75">{t("featuredText")}</p><Link href={`/projects/${featured.slug}`} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold">{t("viewProject")}<ArrowUpRight className="h-4 w-4" /></Link></div>
          </div> : null}
          {items.length ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{cards.map((project) => <ProjectCard key={project.id} project={project} locale={locale} />)}</div> : <p className="rounded-3xl bg-background-alt p-10 text-center text-muted">{t("empty")}</p>}
        </div>
      </section>
      <section className="bg-background-alt py-14">
        <div className="container-luxe grid gap-8 md:grid-cols-2">
          <div className="flex gap-4"><Camera className="h-7 w-7 shrink-0 text-brand" /><div><h2 className="font-display text-xl text-navy">{t("authenticTitle")}</h2><p className="mt-3 leading-relaxed text-muted">{t("authenticText")}</p></div></div>
          <div className="flex gap-4"><Wrench className="h-7 w-7 shrink-0 text-brand" /><div><h2 className="font-display text-xl text-navy">{t("planningTitle")}</h2><p className="mt-3 leading-relaxed text-muted">{t("planningText")}</p><Link href="/services" className="mt-4 inline-flex text-sm font-semibold text-brand">{t("exploreServices")} →</Link></div></div>
        </div>
      </section>
      <ConsultationCta locale={locale} />
    </>
  );
}
