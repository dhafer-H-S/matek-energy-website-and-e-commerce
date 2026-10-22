import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ArrowRight, CheckCircle2, Clock, MessageCircle, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/site/PageHero";
import { ServiceIcon } from "@/components/icons/ServiceIcon";
import { listServices } from "@/lib/queries/services";
import { getSettings } from "@/lib/queries/settings";
import { waLink } from "@/lib/whatsapp";
import { formatMoney } from "@/lib/money";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "services" });
  return buildMetadata({ title: t("title"), description: t("subtitle"), path: "/services", locale });
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("services");
  const items = await listServices(locale);
  const settings = await getSettings();
  const highlights = t.raw("highlights") as { title: string; text: string }[];
  const tel = `tel:${(settings.contactPhone ?? "").replace(/\s+/g, "")}`;
  return (
    <>
      <PageHero title={t("title")} subtitle={t("subtitle")} />
      <section className="py-16">
        <div className="container-luxe grid gap-7 md:grid-cols-2 xl:grid-cols-3">
          {items.map((s) => (
            <article key={s.id} className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
              <Link href={`/services/${s.slug}`} className="relative block aspect-16/10 overflow-hidden bg-background-alt">
                {s.image ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={s.image} alt={s.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" /> : null}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/70 to-transparent" />
                <span className="absolute start-4 top-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-white shadow-lg"><ServiceIcon name={s.icon} className="h-6 w-6" /></span>
                <span className="absolute bottom-4 start-4 rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-navy">
                  {s.priceFrom !== null ? `${t("from")} ${formatMoney(s.priceFrom, s.currency, locale)}` : t("quoteOnly")}
                </span>
              </Link>
              <div className="flex flex-1 flex-col p-6">
                <h2 className="font-display text-xl font-semibold text-navy"><Link href={`/services/${s.slug}`} className="hover:text-brand">{s.title}</Link></h2>
                {s.description ? <p className="mt-2 line-clamp-3 text-sm text-muted">{s.description}</p> : null}
                {s.highlights.length > 0 ? (
                  <ul className="mt-4 space-y-1.5">
                    {s.highlights.slice(0, 3).map((h) => (
                      <li key={h} className="flex items-start gap-2 text-sm text-navy"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />{h}</li>
                    ))}
                  </ul>
                ) : null}
                {s.duration ? <p className="mt-4 inline-flex items-center gap-2 text-xs text-muted"><Clock className="h-4 w-4" />{s.duration}</p> : null}
                <div className="mt-auto grid grid-cols-[1fr_auto_auto] gap-2 pt-5">
                  <Link href={`/services/${s.slug}#book`} className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-navy">{t("bookCta")} <ArrowRight className="h-4 w-4" /></Link>
                  <a href={waLink(settings.whatsapp, `${t("waMessage")} ${s.title}`)} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white hover:brightness-95"><MessageCircle className="h-5 w-5" /></a>
                  <a href={tel} aria-label={t("callCta")} className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-navy text-navy hover:bg-navy hover:text-white"><Phone className="h-5 w-5" /></a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="bg-background-alt py-14">
        <div className="container-luxe grid gap-6 md:grid-cols-3">
          {highlights.map((h, i) => (
            <div key={h.title} className="rounded-2xl bg-white p-6 shadow-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy font-display text-white">{i + 1}</span>
              <h3 className="mt-4 font-display text-lg text-navy">{h.title}</h3>
              <p className="mt-2 text-sm text-muted">{h.text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="py-16">
        <div className="container-luxe rounded-3xl bg-navy-deep px-6 py-12 text-center text-white sm:px-12">
          <h2 className="font-display text-3xl font-semibold">{t("ctaTitle")}</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/80">{t("ctaText")}</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/appointment" className="rounded-full bg-brand px-8 py-4 font-semibold text-white hover:bg-white hover:text-navy">{t("freeSurvey")}</Link>
            <a href={tel} className="inline-flex items-center gap-2 rounded-full border border-white/40 px-8 py-4 font-semibold hover:bg-white/10"><Phone className="h-5 w-5" />{settings.contactPhone}</a>
          </div>
        </div>
      </section>
    </>
  );
}
