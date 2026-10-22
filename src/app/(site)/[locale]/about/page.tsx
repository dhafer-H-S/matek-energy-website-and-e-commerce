import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { PageHero } from "@/components/site/PageHero";
import { Link } from "@/i18n/navigation";
import { buildMetadata } from "@/lib/seo";

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
  const tabs = t.raw("tabs") as { title: string; text: string }[];
  const steps = t.raw("steps") as { title: string; text: string }[];
  return (
    <>
      <PageHero title={t("title")} subtitle={t("subtitle")} />
      <section className="py-16">
        <div className="container-luxe grid items-center gap-10 lg:grid-cols-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/matek/about/21.jpg" alt="" className="aspect-4/3 w-full rounded-2xl object-cover" />
          <div>
            <h2 className="font-display text-3xl text-navy">{th("aboutTitle")}</h2>
            <p className="mt-4 text-muted">{th("aboutText")}</p>
            <div className="mt-6 space-y-4">
              {tabs.map((x) => (
                <div key={x.title}>
                  <h3 className="font-semibold text-navy">{x.title}</h3>
                  <p className="text-sm text-muted">{x.text}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm font-medium text-navy">{t("founder")} · {t("established")}</p>
          </div>
        </div>
      </section>
      <section className="bg-background-alt py-16">
        <div className="container-luxe">
          <h2 className="text-center font-display text-3xl text-navy">{t("howTitle")}</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.title} className="rounded-2xl bg-white p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand font-semibold text-white">{i + 1}</span>
                <h3 className="mt-4 font-display text-lg text-navy">{s.title}</h3>
                <p className="mt-2 text-sm text-muted">{s.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/contact" className="inline-flex rounded-full bg-brand px-8 py-3.5 text-sm font-semibold text-white hover:bg-navy">{th("ctaTitle")}</Link>
          </div>
        </div>
      </section>
    </>
  );
}
