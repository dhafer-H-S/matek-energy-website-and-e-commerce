import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ArrowRight, Check, Leaf, Wrench, Settings2, Wallet, MessageCircle, Clock } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { HeroSlider } from "@/components/home/HeroSlider";
import { Faq } from "@/components/home/Faq";
import { ProductCard } from "@/components/shop/ProductCard";
import { ServiceIcon } from "@/components/icons/ServiceIcon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatCounter } from "@/components/ui/StatCounter";
import { listBanners, listCategories, listProducts, listProjects } from "@/lib/queries/shop";
import { listServices } from "@/lib/queries/services";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqSchema, itemListSchema } from "@/lib/structured-data";
import { getSettings } from "@/lib/queries/settings";
import { waLink } from "@/lib/whatsapp";
import { formatMoney } from "@/lib/money";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common" });
  return buildMetadata({ title: `${t("brand")} — ${t("tagline")}`, description: t("seoDescription"), path: "/", locale });
}

function Head({ title, text, href, cta }: { title: string; text?: string; href?: string; cta?: string }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-2xl font-semibold text-navy sm:text-3xl">{title}</h2>
        {text ? <p className="mt-1 text-muted">{text}</p> : null}
      </div>
      {href ? (
        <Link href={href} className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:text-navy">
          {cta} <ArrowRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const tc = await getTranslations("common");
  const ts = await getTranslations("services");
  const media = await getTranslations("media");
  const settings = await getSettings();

  const [hero, promo, cats, featured, all, onSale, services, projects] = await Promise.all([
    listBanners(locale, "hero"),
    listBanners(locale, "promo"),
    listCategories(locale),
    listProducts(locale, { featured: true, limit: 8 }),
    listProducts(locale),
    listProducts(locale, { onSale: true, limit: 4 }),
    listServices(locale),
    listProjects(locale, 6),
  ]);
  const fresh = all.filter((p) => p.isNew).slice(0, 4);
  const benefits = t.raw("benefits") as { title: string; text: string }[];
  const points = t.raw("aboutPoints") as string[];
  const faq = t.raw("faq") as { q: string; a: string }[];
  const benefitIcons = [Leaf, Wrench, Settings2, Wallet];
  const serviceSteps = t.raw("serviceSteps") as { title: string; text: string }[];
  const serviceAudiences = t.raw("serviceAudiences") as { title: string; text: string }[];

  return (
    <>
      <JsonLd data={[
        faqSchema(faq),
        itemListSchema(locale, tc("seoCategoriesTitle"), cats.map((c) => ({ name: c.name, path: `/categories/${c.slug}` }))),
      ]} />
      <HeroSlider banners={hero} />

      {services.length > 0 ? (
        <section className="border-b border-border bg-white py-6">
          <div className="container-luxe">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <span className="font-display text-sm font-semibold uppercase tracking-wide text-brand">{t("servicesEyebrow")}</span>
              {services.slice(0, 6).map((sv) => (
                <Link key={sv.id} href={`/services/${sv.slug}`} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-navy transition-colors hover:border-brand hover:bg-brand hover:text-white">
                  <ServiceIcon name={sv.icon} className="h-4 w-4" />{sv.title}
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {services.length > 0 ? (
        <section id="services" className="scroll-mt-40 bg-background-alt py-16 sm:py-20">
          <div className="container-luxe">
            <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-end">
              <div>
                <span className="eyebrow">{t("servicesEyebrow")}</span>
                <h2 className="mt-3 max-w-3xl font-display text-3xl font-semibold leading-tight text-navy sm:text-4xl">{t("servicesTitle")}</h2>
                <p className="mt-4 max-w-3xl leading-relaxed text-muted">{t("servicesText")}</p>
              </div>
              <div className="rounded-2xl bg-navy p-6 text-white">
                <h3 className="font-display text-xl font-semibold">{t("serviceAdviceTitle")}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/80">{t("serviceAdviceText")}</p>
                <Link href="/appointment" className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-navy hover:bg-brand-soft">{ts("freeSurvey")} <ArrowRight className="h-4 w-4" /></Link>
              </div>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {services.map((s) => (
                <article key={s.id} className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <Link href={`/services/${s.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-navy">
                    {s.image ? <Image src={s.image} alt={s.title} fill sizes="(min-width: 1280px) 400px, (min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" /> : null}
                    <span className="absolute bottom-4 start-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-navy text-white shadow-lg"><ServiceIcon name={s.icon} className="h-6 w-6" /></span>
                  </Link>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="font-display text-xl font-semibold text-navy"><Link href={`/services/${s.slug}`} className="hover:text-brand">{s.title}</Link></h3>
                    {s.description ? <p className="mt-3 text-sm leading-relaxed text-muted">{s.description}</p> : null}
                    <ul className="mt-5 space-y-2">
                      {s.highlights.map((h) => <li key={h} className="flex gap-2 text-sm text-navy"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />{h}</li>)}
                    </ul>
                    {s.duration ? <p className="mt-5 flex items-center gap-2 text-xs text-muted"><Clock className="h-4 w-4" />{s.duration}</p> : null}
                    <div className="mt-auto pt-6">
                      <p className="mb-3 text-sm font-semibold text-brand">{s.priceFrom !== null ? `${ts("from")} ${formatMoney(s.priceFrom, s.currency, locale)}` : ts("quoteOnly")}</p>
                      <div className="flex gap-2">
                        <Link href={`/services/${s.slug}#book`} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-brand px-4 py-3 text-sm font-semibold text-white hover:bg-navy">{ts("bookCta")} <ArrowRight className="h-4 w-4" /></Link>
                        <a href={waLink(settings.whatsapp, `${ts("waMessage")} ${s.title}`)} target="_blank" rel="noopener noreferrer" aria-label={`${ts("whatsappCta")}: ${s.title}`} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy text-white hover:bg-brand"><MessageCircle className="h-5 w-5" /></a>
                      </div>
                      <Link href={`/services/${s.slug}`} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-navy hover:text-brand">{tc("learnMore")} <ArrowRight className="h-4 w-4" /></Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-12 rounded-3xl border border-border bg-white p-6 sm:p-10">
              <h3 className="font-display text-2xl font-semibold text-navy">{t("serviceProcessTitle")}</h3>
              <p className="mt-2 max-w-3xl text-muted">{t("serviceProcessText")}</p>
              <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {serviceSteps.map((step, i) => (
                  <li key={step.title}>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/15 font-display font-semibold text-brand">{i + 1}</span>
                    <h4 className="mt-4 font-semibold text-navy">{step.title}</h4>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{step.text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      ) : null}

      <section className="py-14">
        <div className="container-luxe">
          <Head title={t("shopByCategory")} text={t("shopByCategoryText")} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {cats.map((c) => (
              <Link key={c.id} href={`/categories/${c.slug}`} className="group relative aspect-4/3 overflow-hidden rounded-2xl bg-navy">
                {c.image ? <Image src={c.image} alt={c.name} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover opacity-80 transition-transform duration-500 group-hover:scale-105" /> : null}
                <div className="absolute inset-0 bg-linear-to-t from-navy-deep/90 via-navy-deep/20 to-transparent" />
                <h3 className="absolute inset-x-0 bottom-0 p-5 font-display text-lg font-semibold leading-snug text-white">{c.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {featured.length > 0 ? (
        <section className="pb-14">
          <div className="container-luxe">
            <Head title={t("featured")} text={t("featuredText")} href="/shop" cta={tc("viewAll")} />
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {featured.map((p) => <ProductCard key={p.id} product={p} locale={locale} />)}
            </div>
          </div>
        </section>
      ) : null}

      {promo.length > 0 ? (
        <section className="pb-14">
          <div className="container-luxe grid gap-5 lg:grid-cols-3">
            {promo.slice(0, 2).map((b, idx) => {
              const big = idx === 0;
              const inner = (
                <>
                  <picture>
                    {b.mobileImage ? <source media="(max-width: 640px)" srcSet={b.mobileImage} /> : null}
                    <img src={b.image} alt={b.title ?? ""} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                  </picture>
                  {b.title || b.subtitle || b.eyebrow || b.ctaLabel ? (
                    <>
                      <div className="absolute inset-0 bg-linear-to-r from-navy-deep via-navy-deep/70 to-transparent" />
                      <div className={`relative p-8 text-white ${big ? "sm:p-12" : ""}`}>
                        {b.eyebrow ? <span className="eyebrow text-white/70">{b.eyebrow}</span> : null}
                        {b.title ? <h3 className={`mt-2 max-w-md font-display font-semibold leading-tight ${big ? "text-3xl sm:text-4xl" : "text-2xl"}`}>{b.title}</h3> : null}
                        {b.subtitle ? <p className="mt-3 max-w-sm text-sm text-white/80">{b.subtitle}</p> : null}
                        {b.ctaLabel ? <span className="mt-6 inline-flex rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-navy">{b.ctaLabel} →</span> : null}
                      </div>
                    </>
                  ) : null}
                </>
              );
              const cls = `relative flex items-center overflow-hidden rounded-3xl bg-navy ${big ? "min-h-72 lg:col-span-2" : "min-h-72"}`;
              return b.linkUrl ? <Link key={b.id} href={b.linkUrl} aria-label={b.title || b.ctaLabel || tc("learnMore")} className={cls}>{inner}</Link> : <div key={b.id} className={cls}>{inner}</div>;
            })}
          </div>
        </section>
      ) : null}

      {fresh.length > 0 ? (
        <section className="pb-14">
          <div className="container-luxe">
            <Head title={t("newArrivals")} href="/shop" cta={tc("viewAll")} />
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {fresh.map((p) => <ProductCard key={p.id} product={p} locale={locale} />)}
            </div>
          </div>
        </section>
      ) : null}

      {onSale.length > 0 ? (
        <section className="pb-14">
          <div className="container-luxe">
            <Head title={t("onSale")} />
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {onSale.map((p) => <ProductCard key={p.id} product={p} locale={locale} />)}
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-background-alt py-16">
        <div className="container-luxe">
          <SectionHeading eyebrow={t("servicesEyebrow")} title={t("serviceSupportTitle")} subtitle={t("serviceSupportText")} />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {serviceAudiences.map((audience) => (
              <div key={audience.title} className="rounded-2xl border border-border bg-white p-7">
                <h3 className="font-display text-xl font-semibold text-navy">{audience.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{audience.text}</p>
                <Link href="/appointment" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand">{tc("getQuote")} <ArrowRight className="h-4 w-4" /></Link>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/services" className="inline-flex rounded-full border border-navy px-7 py-3 text-sm font-semibold text-navy hover:bg-navy hover:text-white">{tc("viewAll")}</Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-luxe grid items-center gap-10 lg:grid-cols-2">
          <div className="relative aspect-4/3 overflow-hidden rounded-2xl">
            <Image src={media("homeAbout")} alt={t("aboutImageAlt")} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div>
            <span className="eyebrow">{t("aboutEyebrow")}</span>
            <h2 className="mt-2 font-display text-3xl font-semibold text-navy">{t("aboutTitle")}</h2>
            <p className="mt-4 text-muted">{t("aboutText")}</p>
            <ul className="mt-5 space-y-2">
              {points.map((p) => (
                <li key={p} className="flex gap-2 text-sm"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />{p}</li>
              ))}
            </ul>
            <Link href="/about" className="mt-6 inline-flex rounded-full bg-brand px-8 py-3.5 text-sm font-semibold text-white hover:bg-navy">{tc("learnMore")}</Link>
          </div>
        </div>
      </section>

      <section className="bg-navy py-16 text-white">
        <div className="container-luxe">
          <SectionHeading invert eyebrow={t("benefitsEyebrow")} title={t("benefitsTitle")} />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b, i) => {
              const Icon = benefitIcons[i % benefitIcons.length];
              return (
                <div key={b.title} className="rounded-2xl border border-white/15 bg-white/5 p-6">
                  <Icon className="h-8 w-8 text-brand" />
                  <h3 className="mt-4 font-display text-lg">{b.title}</h3>
                  <p className="mt-2 text-sm text-white/75">{b.text}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-12 grid gap-6 text-center sm:grid-cols-3">
            {[[t("statsCustomersValue"), t("statsCustomers")], [t("statsInstallationsValue"), t("statsInstallations")], [t("statsYearsValue"), t("statsYears")]].map(([v, l]) => (
              <div key={l}>
                <StatCounter key={v} value={v} className="font-display text-4xl font-semibold text-brand" />
                <p className="mt-1 text-sm text-white/75">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {projects.length > 0 ? (
        <section className="py-16">
          <div className="container-luxe">
            <Head title={t("projectsTitle")} text={t("projectsText")} href="/projects" cta={tc("viewAll")} />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <Link key={p.id} href={`/projects/${p.slug}`} className="group relative aspect-4/3 overflow-hidden rounded-2xl bg-navy">
                  {p.image ? <Image src={p.image} alt={p.title} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" /> : null}
                  <div className="absolute inset-0 bg-linear-to-t from-navy-deep/90 via-transparent" />
                  <h3 className="absolute inset-x-0 bottom-0 p-5 font-display text-lg text-white">{p.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-background-alt py-16">
        <div className="container-luxe grid gap-10 lg:grid-cols-2">
          <div>
            <span className="eyebrow">{t("faqEyebrow")}</span>
            <h2 className="mt-2 font-display text-3xl font-semibold text-navy">{t("faqTitle")}</h2>
            <div className="mt-6"><Faq items={faq} /></div>
          </div>
          <div className="self-center rounded-2xl bg-brand p-8 text-white">
            <h3 className="font-display text-2xl font-semibold">{t("ctaTitle")}</h3>
            <p className="mt-3 text-white/90">{t("ctaText")}</p>
            <Link href="/appointment" className="mt-6 inline-flex rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-navy hover:bg-navy hover:text-white">{tc("bookAppointment")}</Link>
          </div>
        </div>
      </section>
    </>
  );
}
