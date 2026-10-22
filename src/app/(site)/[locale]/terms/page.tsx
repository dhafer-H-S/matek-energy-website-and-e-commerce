import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { LegalPage } from "@/components/site/LegalPage";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  return buildMetadata({ title: t("termsTitle"), path: "/terms", locale });
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legal");
  return <LegalPage title={t("termsTitle")} body={t("termsBody")} />;
}
