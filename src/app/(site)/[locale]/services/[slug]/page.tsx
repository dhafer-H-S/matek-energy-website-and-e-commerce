import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ArrowRight, CheckCircle2, Clock, MessageCircle, Phone, ShieldCheck, UserCheck, Zap, ClipboardCheck } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { RichText, PlainProse } from "@/components/ui/RichText";
import { ServiceIcon } from "@/components/icons/ServiceIcon";
import { ServiceBooking } from "@/components/forms/ServiceBooking";
import { ProductCard } from "@/components/shop/ProductCard";
import { Faq } from "@/components/home/Faq";
import { getServiceBySlug, listServices } from "@/lib/queries/services";
import { listCategories, listProducts } from "@/lib/queries/shop";
import { getSettings } from "@/lib/queries/settings";
import { waLink } from "@/lib/whatsapp";
import { formatMoney } from "@/lib/money";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const s = await getServiceBySlug(slug, locale);
  if (!s) return {};
  return buildMetadata({ title: s.seoTitle || s.title, description: s.seoDescription || s.description, path: `/services/${s.slug}`, locale, image: s.image });
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const s = await getServiceBySlug(slug, locale);
  if (!s) notFound();
  const t = await getTranslations("services");
  const settings = await getSettings();
  const all = await listServices(locale);
  const others = all.filter((x) => x.id !== s.id).slice(0, 3);
  const categories = s.categoryId ? await listCategories(locale) : [];
  const cat = categories.find((c) => c.id === s.categoryId);
  const related = cat ? await listProducts(locale, { categorySlug: cat.slug, limit: 4 }) : [];
  const wa = waLink(settings.whatsapp, `${t("waMessage")} ${s.title}`);
  const tel = `tel:${(settings.contactPhone ?? "").replace(/\s+/g, "")}`;
  const price = s.priceFrom !== null ? `${t("from")} ${formatMoney(s.priceFrom, s.currency, locale)}` : t("quoteOnly");
  const trust = [
    { Icon: ClipboardCheck, label: t("freeSurvey") },
    { Icon: UserCheck, label: t("certified") },
    { Icon: ShieldCheck, label: t("warranty") },
    { Icon: Zap, label: t("fastResponse") },
  ];

  return (
    <>
      <section className="relative isolate overflow-hidden bg-navy-deep text-white">
        {s.image ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={s.image} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-40" /> : null}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-deep via-navy-deep/85 to-navy-deep/30" />
        <div className="container-luxe py-14 sm:py-20">
          <nav className="mb-5 text-sm text-white/70">
            <Link href="/services" className="hover:text-white">{t("title")}</Link> / <span className="text-white">{s.title}</span>
          </nav>
          <div className="grid items-end gap-8 lg:grid-cols-[1.5fr_1fr]">
            <div>
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-white shadow-lg"><ServiceIcon name={s.icon} className="h-7 w-7" /></span>
              <h1 className="mt-5 font-display text-4xl font-semibold leading-tight sm:text-5xl">{s.title}</h1>
              {s.description ? <p className="mt-4 max-w-2xl text-lg text-white/85">{s.description}</p> : null}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-white px-5 py-2 font-display text-lg font-semibold text-navy">{price}</span>
                {s.duration ? <span className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-sm"><Clock className="h-4 w-4" />{s.duration}</span> : null}
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#book" className="inline-flex items-center gap-2 rounded-full bg-brand px-7 py-4 text-base font-semibold text-white shadow-lg shadow-black/30 transition hover:-translate-y-0.5 hover:bg-white hover:text-navy">{t("bookCta")} <ArrowRight className="h-5 w-5" /></a>
                <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-4 text-base font-semibold text-white transition hover:brightness-95"><MessageCircle className="h-5 w-5" />{t("whatsappCta")}</a>
                <a href={tel} className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-4 text-base font-semibold hover:bg-white/10"><Phone className="h-5 w-5" />{t("callCta")}</a>
              </div>
            </div>
          </div>
          <ul className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {trust.map(({ Icon, label }) => (
              <li key={label} className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-sm font-medium backdrop-blur"><Icon className="h-5 w-5 shrink-0 text-brand-soft" /> {label}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-luxe grid gap-10 py-14 pb-28 lg:grid-cols-[1fr_380px] lg:pb-14">
        <div className="min-w-0 space-y-14">
          {s.highlights.length > 0 ? (
            <div>
              <h2 className="mb-5 font-display text-2xl text-navy sm:text-3xl">{t("included")}</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {s.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-3 rounded-2xl border border-border bg-white p-4 shadow-sm">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                    <span className="text-sm font-medium text-navy">{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {s.content ? (
            <div className="rounded-2xl bg-background-alt/70 p-6 sm:p-8">
              {s.content.includes("<") ? <RichText html={s.content} /> : <PlainProse text={s.content} className="leading-relaxed text-muted" />}
            </div>
          ) : null}

          {s.steps.length > 0 ? (
            <div>
              <h2 className="mb-6 font-display text-2xl text-navy sm:text-3xl">{t("process")}</h2>
              <ol className="relative space-y-4 border-s-2 border-brand/25 ps-8">
                {s.steps.map((st, i) => (
                  <li key={st.title} className="relative rounded-2xl border border-border bg-white p-5 shadow-sm">
                    <span className="absolute -start-[2.9rem] top-4 flex h-9 w-9 items-center justify-center rounded-full bg-navy font-display text-white ring-4 ring-white">{i + 1}</span>
                    <h3 className="font-semibold text-navy">{st.title}</h3>
                    {st.text ? <p className="mt-1 text-sm text-muted">{st.text}</p> : null}
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          {s.gallery.length > 0 ? (
            <div>
              <h2 className="mb-5 font-display text-2xl text-navy sm:text-3xl">{t("gallery")}</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {s.gallery.map((g, i) => (
                  <div key={g} className={`overflow-hidden rounded-2xl ${i === 0 ? "col-span-2 row-span-2" : ""}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={g} alt={s.title} className="h-full min-h-40 w-full object-cover transition-transform duration-500 hover:scale-105" />
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {s.faqs.length > 0 ? (
            <div>
              <h2 className="mb-5 font-display text-2xl text-navy sm:text-3xl">{t("faqTitle")}</h2>
              <Faq items={s.faqs} />
            </div>
          ) : null}
        </div>

        <aside id="book" className="scroll-mt-44 lg:sticky lg:top-44 lg:self-start">
          <div className="rounded-3xl border border-border bg-white p-6 shadow-lg">
            <p className="text-sm text-muted">{price}</p>
            <h2 className="font-display text-2xl font-semibold text-navy">{t("bookTitle")}</h2>
            <p className="mb-5 mt-1 text-sm text-muted">{t("bookSubtitle")}</p>
            <ServiceBooking serviceId={s.id} serviceTitle={s.title} />
            <div className="mt-5 grid gap-2 border-t border-border pt-5">
              <a href={wa} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white hover:brightness-95"><MessageCircle className="h-4 w-4" />{t("whatsappCta")}</a>
              <a href={tel} className="flex items-center justify-center gap-2 rounded-full border border-navy px-5 py-3 text-sm font-semibold text-navy hover:bg-navy hover:text-white"><Phone className="h-4 w-4" />{settings.contactPhone}</a>
            </div>
          </div>
        </aside>
      </section>

      {related.length > 0 ? (
        <section className="bg-background-alt py-14">
          <div className="container-luxe">
            <div className="mb-6 flex items-end justify-between gap-4">
              <h2 className="font-display text-2xl text-navy sm:text-3xl">{t("relatedProducts")}</h2>
              {cat ? <Link href={`/categories/${cat.slug}`} className="text-sm font-semibold text-brand">{cat.name} →</Link> : null}
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {related.map((r) => <ProductCard key={r.id} product={r} locale={locale} />)}
            </div>
          </div>
        </section>
      ) : null}

      <section className="py-14">
        <div className="container-luxe">
          <h2 className="mb-6 font-display text-2xl text-navy sm:text-3xl">{t("otherServices")}</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {others.map((o) => (
              <Link key={o.id} href={`/services/${o.slug}`} className="group flex items-center gap-4 rounded-2xl border border-border bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand"><ServiceIcon name={o.icon} className="h-6 w-6" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-navy">{o.title}</span>
                  <span className="block text-xs text-muted">{o.priceFrom !== null ? `${t("from")} ${formatMoney(o.priceFrom, o.currency, locale)}` : t("quoteOnly")}</span>
                </span>
                <ArrowRight className="h-5 w-5 text-brand transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div data-mobile-action-bar className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-border bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-muted">{s.title}</p>
          <p className="font-display text-lg font-semibold text-navy">{price}</p>
        </div>
        <a href="#book" className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white">{t("orderService")}</a>
      </div>
    </>
  );
}
