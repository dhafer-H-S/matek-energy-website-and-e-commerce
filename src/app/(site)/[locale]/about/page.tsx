import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { PageHero } from "@/components/site/PageHero";
import { Link } from "@/i18n/navigation";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqSchema, breadcrumbSchema } from "@/lib/structured-data";
import { ArrowUpRight, Check, House, Building2, Factory } from "lucide-react";
import { listServices } from "@/lib/queries/services";
import { listProjects } from "@/lib/queries/shop";
import { ServiceIcon } from "@/components/icons/ServiceIcon";
import { ConsultationCta } from "@/components/site/ConsultationCta";
import { ProjectCard } from "@/components/projects/ProjectCard";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return buildMetadata({ title: t("title"), description: t("subtitle"), path: "/about", locale });
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const th = await getTranslations("home");
  const media = await getTranslations("media");
  const tabs = t.raw("tabs") as { title: string; text: string }[];
  const steps = t.raw("steps") as { title: string; text: string }[];
  const audiences = t.raw("audiences") as { title: string; text: string }[];
  const commitments = t.raw("commitments") as { title: string; text: string }[];
  const faqs = t.raw("faqs") as { q: string; a: string }[];
  const icons = [House, Building2, Factory];
  const [services, projects] = await Promise.all([listServices(locale), listProjects(locale, 3)]);
  return (
    <>
      <JsonLd data={[
        faqSchema(faqs),
        breadcrumbSchema(locale, [{ name: t("title"), path: "/about" }]),
      ]} />
      <PageHero eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} image={media("aboutHero")} />
      <nav aria-label={t("sectionNav")} className="border-b border-border bg-white">
        <div className="container-luxe flex flex-wrap gap-x-7 gap-y-3 py-5 text-sm font-semibold text-navy">
          <a href="#our-story" className="hover:text-brand">{t("storyLabel")}</a><a href="#our-services" className="hover:text-brand">{t("servicesLabel")}</a><a href="#our-process" className="hover:text-brand">{t("howTitle")}</a><a href="#about-faq" className="hover:text-brand">{t("faqTitle")}</a>
        </div>
      </nav>
      <section id="our-story" className="scroll-mt-44 py-16 sm:py-20">
        <div className="container-luxe grid items-center gap-10 lg:grid-cols-2">
          <div className="relative aspect-4/3 overflow-hidden rounded-2xl">
            <Image src={media("aboutStory")} alt={th("aboutImageAlt")} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div>
            <span className="eyebrow text-brand">{t("storyLabel")}</span>
            <h2 className="mt-3 font-display text-3xl text-navy">{t("storyTitle")}</h2>
            <p className="mt-4 text-muted">{th("aboutText")}</p>
            <p className="mt-4 leading-relaxed text-muted">{t("storyText")}</p>
            <div className="mt-6 space-y-4">
              {tabs.map((x) => (
                <div key={x.title}>
                  <h3 className="font-semibold text-navy">{x.title}</h3>
                  <p className="text-sm text-muted">{x.text}</p>
                </div>
              ))}
            </div>
            <Link href="/contact" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-brand">{t("talkToUs")}<ArrowUpRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>
      <section className="bg-background-alt py-16">
        <div className="container-luxe">
          <div className="max-w-2xl"><span className="eyebrow text-brand">{t("audienceEyebrow")}</span><h2 className="mt-3 font-display text-3xl text-navy">{t("audienceTitle")}</h2><p className="mt-4 leading-relaxed text-muted">{t("audienceText")}</p></div>
          <div className="mt-9 grid gap-6 md:grid-cols-3">{audiences.map((audience, index) => {
            const Icon = icons[index % icons.length];
            return <div key={audience.title} className="rounded-3xl bg-white p-7"><Icon className="h-8 w-8 text-brand" /><h3 className="mt-5 font-display text-xl text-navy">{audience.title}</h3><p className="mt-3 text-sm leading-relaxed text-muted">{audience.text}</p></div>;
          })}</div>
        </div>
      </section>
      <section id="our-services" className="scroll-mt-44 py-16 sm:py-20">
        <div className="container-luxe">
          <div className="max-w-3xl"><span className="eyebrow text-brand">{t("servicesLabel")}</span><h2 className="mt-3 font-display text-3xl text-navy sm:text-4xl">{t("servicesTitle")}</h2><p className="mt-4 leading-relaxed text-muted">{t("servicesText")}</p></div>
          <div className="mt-9 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{services.map((service) => <Link key={service.id} href={`/services/${service.slug}`} className="group rounded-3xl border border-border p-7 transition-colors hover:border-brand hover:bg-brand/5"><ServiceIcon name={service.icon} className="h-8 w-8 text-brand" /><h3 className="mt-5 font-display text-xl text-navy">{service.title}</h3><p className="mt-3 text-sm leading-relaxed text-muted">{service.description}</p>{service.highlights.length ? <ul className="mt-4 space-y-2">{service.highlights.slice(0, 3).map((item) => <li key={item} className="flex gap-2 text-sm text-muted"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />{item}</li>)}</ul> : null}<span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand">{t("serviceDetails")}<ArrowUpRight className="h-4 w-4" /></span></Link>)}</div>
          <div className="mt-9 grid items-center gap-6 rounded-3xl bg-background-alt p-7 sm:p-10 lg:grid-cols-[1fr_auto]"><div><h3 className="font-display text-2xl text-navy">{t("shopTitle")}</h3><p className="mt-3 max-w-2xl leading-relaxed text-muted">{t("shopText")}</p></div><Link href="/shop" className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-7 py-3.5 text-sm font-semibold text-white hover:bg-brand">{t("shopCta")}<ArrowUpRight className="h-4 w-4" /></Link></div>
        </div>
      </section>
      <section id="our-process" className="scroll-mt-44 bg-navy py-16 text-white">
        <div className="container-luxe">
          <h2 className="text-center font-display text-3xl">{t("howTitle")}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-center leading-relaxed text-white/70">{t("processText")}</p>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.title} className="rounded-2xl border border-white/15 bg-white/5 p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand font-semibold text-white">{i + 1}</span>
                <h3 className="mt-4 font-display text-lg">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-16"><div className="container-luxe grid gap-10 lg:grid-cols-2"><div><span className="eyebrow text-brand">{t("commitmentEyebrow")}</span><h2 className="mt-3 font-display text-3xl text-navy">{t("commitmentTitle")}</h2><p className="mt-4 leading-relaxed text-muted">{t("commitmentText")}</p></div><div className="space-y-6">{commitments.map((item) => <div key={item.title} className="flex gap-4"><Check className="mt-1 h-5 w-5 shrink-0 text-brand" /><div><h3 className="font-semibold text-navy">{item.title}</h3><p className="mt-2 text-sm leading-relaxed text-muted">{item.text}</p></div></div>)}</div></div></section>
      {projects.length ? <section className="bg-background-alt py-16"><div className="container-luxe"><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><h2 className="font-display text-3xl text-navy">{t("projectsTitle")}</h2><Link href="/projects" className="text-sm font-semibold text-brand">{t("projectsCta")} →</Link></div><div className="grid gap-6 md:grid-cols-3">{projects.map((project) => <ProjectCard key={project.id} project={project} locale={locale} />)}</div></div></section> : null}
      <section id="about-faq" className="scroll-mt-44 py-16"><div className="container-luxe max-w-4xl"><h2 className="mb-8 font-display text-3xl text-navy">{t("faqTitle")}</h2><div className="divide-y divide-border">{faqs.map((faq) => <details key={faq.q} className="group py-5"><summary className="cursor-pointer font-semibold text-navy marker:text-brand">{faq.q}</summary><p className="mt-4 leading-relaxed text-muted">{faq.a}</p></details>)}</div></div></section>
      <ConsultationCta locale={locale} />
    </>
  );
}
