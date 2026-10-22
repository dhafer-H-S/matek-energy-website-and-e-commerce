import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { PageHero } from "@/components/site/PageHero";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "appointment" });
  return buildMetadata({ title: t("title"), description: t("subtitle"), path: "/appointment", locale });
}

export default async function AppointmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ service?: string }>;
}) {
  const { locale } = await params;
  const { service } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("appointment");
  const tAbout = await getTranslations("about");
  const items = t.raw("items") as string[];

  return (
    <>
      <PageHero title={t("title")} subtitle={t("subtitle")} />
      <section className="py-16">
        <div className="container-luxe grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <h2 className="font-display text-2xl text-navy">{t("selectService")}</h2>
            <ul className="mt-5 grid gap-2 text-sm text-foreground-soft">
              {items.map((i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand" /> {i}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm font-medium text-navy">{tAbout("founder")}</p>
            <p className="text-sm text-muted">{tAbout("established")}</p>
          </div>
          <div className="rounded-2xl border border-border bg-white p-6 sm:p-8 lg:col-span-3">
            <EnquiryForm sourceType="appointment" services={items} defaultService={service} />
          </div>
        </div>
      </section>
    </>
  );
}
