import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { PageHero } from "@/components/site/PageHero";
import { ShopListing } from "@/components/shop/ShopListing";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "shop" });
  return buildMetadata({ title: t("title"), description: t("subtitle"), path: "/shop", locale });
}

export default async function ShopPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; sort?: string }>;
}) {
  const { locale } = await params;
  const { q, sort } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("shop");
  return (
    <>
      <PageHero title={t("title")} subtitle={t("subtitle")} />
      <ShopListing locale={locale} basePath="/shop" q={q} sort={sort} />
    </>
  );
}
