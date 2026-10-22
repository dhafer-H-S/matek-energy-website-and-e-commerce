import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/site/PageHero";
import { ShopListing } from "@/components/shop/ShopListing";
import { getCategoryBySlug } from "@/lib/queries/shop";
import { buildMetadata } from "@/lib/seo";

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
  return (
    <>
      <PageHero title={c.name} subtitle={c.description ?? undefined} image={c.image} />
      <ShopListing locale={locale} basePath={`/categories/${slug}`} categorySlug={slug} q={q} sort={sort} />
    </>
  );
}
