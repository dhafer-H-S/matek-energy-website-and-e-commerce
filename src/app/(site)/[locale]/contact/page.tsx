import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { SocialLinks } from "@/components/site/SocialLinks";
import { getSettings } from "@/lib/queries/settings";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return buildMetadata({ title: t("title"), description: t("subtitle"), path: "/contact", locale });
}

export default async function ContactPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ subject?: string }>;
}) {
  const { locale } = await params;
  const { subject } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("contact");
  const s = await getSettings(locale);

  const items = [
    { icon: MapPin, label: t("address"), value: s.addressText },
    { icon: Phone, label: t("callUs"), value: s.contactPhone, href: s.contactPhone ? `tel:${s.contactPhone.replace(/\s/g, "")}` : undefined },
    { icon: Mail, label: t("writeUs"), value: s.contactEmail, href: s.contactEmail ? `mailto:${s.contactEmail}` : undefined },
    { icon: Clock, label: t("hours"), value: s.openingHours },
  ];

  return (
    <>
      <PageHero title={t("title")} subtitle={t("subtitle")} />
      <section className="py-16">
        <div className="container-luxe grid gap-10 lg:grid-cols-5">
          <div className="space-y-5 lg:col-span-2">
            {items.map(({ icon: Icon, label, value, href }) =>
              value ? (
                <div key={label} className="flex gap-4 rounded-2xl border border-border bg-white p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
                    {href ? (
                      <a href={href} className="font-medium text-navy hover:text-brand">{value}</a>
                    ) : (
                      <p className="font-medium text-navy">{value}</p>
                    )}
                  </div>
                </div>
              ) : null,
            )}
            <div className="rounded-2xl border border-border bg-white p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">{t("followUs")}</p>
              <SocialLinks variant="dark" />
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-white p-6 sm:p-8 lg:col-span-3">
            <EnquiryForm defaultMessage={subject} />
          </div>
        </div>
      </section>
    </>
  );
}
