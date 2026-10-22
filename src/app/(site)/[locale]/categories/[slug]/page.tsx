import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/site/PageHero";
import { ShopListing } from "@/components/shop/ShopListing";
import { getCategoryBySlug, listProducts } from "@/lib/queries/shop";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { itemListSchema, breadcrumbSchema } from "@/lib/structured-data";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const c = await getCategoryBySlug(slug, locale);
  if (!c) return {};
  return buildMetadata({ title: c.name, description: c.description, path: `/categories/${slug}`, locale, image: c.image });
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ q?: string; sort?: string }>;
}) {
  const { locale, slug } = await params;
  const { q, sort } = await searchParams;
  setRequestLocale(locale);
  const c = await getCategoryBySlug(slug, locale);
  if (!c) notFound();
  const [t, products] = await Promise.all([
    getTranslations({ locale, namespace: "shop" }),
    listProducts(locale, { categorySlug: slug, limit: 50 }),
  ]);
  return (
    <>
      <JsonLd data={[
        itemListSchema(locale, c.name, products.map((p) => ({ name: p.name, path: `/products/${p.slug}` }))),
        breadcrumbSchema(locale, [
          { name: t("title"), path: "/shop" },
          { name: c.name, path: `/categories/${slug}` },
        ]),
      ]} />
      <PageHero title={c.name} subtitle={c.description ?? undefined} image={c.image} />
      <ShopListing locale={locale} basePath={`/categories/${slug}`} categorySlug={slug} q={q} sort={sort} />
    </>
  );
}
