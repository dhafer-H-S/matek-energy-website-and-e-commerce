import "server-only";
import { and, asc, desc, eq, inArray, ne, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  banners,
  categories,
  products,
  projects,
  type Banner,
  type BannerTranslation,
  type Category,
  type CategoryTranslation,
  type Product,
  type ProductTranslation,
  type Project,
  type ProjectTranslation,
} from "@/lib/db/schema";
import { pickTranslation, asArray } from "@/lib/db/translations";
import { effectivePrice } from "@/lib/money";

/* ─── Categories ─────────────────────────────────────────────────────────── */
export interface CategoryView {
  id: string;
  slug: string;
  image: string | null;
  icon: string | null;
  name: string;
  description: string | null;
}

function resolveCategory(
  row: Category & { translations: CategoryTranslation[] },
  locale: string,
): CategoryView {
  const t = pickTranslation(row.translations, locale);
  return {
    id: row.id,
    slug: row.slug,
    image: row.image,
    icon: row.icon,
    name: t?.name ?? row.slug,
    description: t?.description ?? null,
  };
}

export async function listCategories(locale: string): Promise<CategoryView[]> {
  const rows = await db.query.categories.findMany({
    where: eq(categories.published, true),
    with: { translations: true },
    orderBy: [asc(categories.sortOrder), asc(categories.createdAt)],
  });
  return rows.map((r) => resolveCategory(r, locale));
}

export async function getCategoryBySlug(
  slug: string,
  locale: string,
): Promise<CategoryView | null> {
  const row = await db.query.categories.findFirst({
    where: eq(categories.slug, slug),
    with: { translations: true },
  });
  if (!row || !row.published) return null;
  return resolveCategory(row, locale);
}

/* ─── Products ───────────────────────────────────────────────────────────── */
export interface ProductView {
  id: string;
  slug: string;
  sku: string | null;
  brand: string | null;
  image: string | null;
  gallery: string[];
  price: number;
  salePrice: number | null;
  currency: "TRY" | "EUR";
  inStock: boolean;
  stock: number | null;
  quoteOnly: boolean;
  featured: boolean;
  isNew: boolean;
  categoryId: string | null;
  categorySlug: string | null;
  categoryName: string | null;
  name: string;
  shortDescription: string | null;
  description: string | null;
  specs: { label: string; value: string }[];
  seoTitle: string | null;
  seoDescription: string | null;
}

type ProductRow = Product & {
  translations: ProductTranslation[];
  category: (Category & { translations: CategoryTranslation[] }) | null;
};

function resolveProduct(row: ProductRow, locale: string): ProductView {
  const t = pickTranslation(row.translations, locale);
  const cat = row.category ? resolveCategory(row.category, locale) : null;
  return {
    id: row.id,
    slug: row.slug,
    sku: row.sku,
    brand: row.brand,
    image: row.image,
    gallery: asArray(row.gallery),
    price: row.price,
    salePrice: row.salePrice,
    currency: row.currency,
    inStock: row.inStock,
    stock: row.stock,
    quoteOnly: row.quoteOnly,
    featured: row.featured,
    isNew: row.isNew,
    categoryId: row.categoryId,
    categorySlug: cat?.slug ?? null,
    categoryName: cat?.name ?? null,
    name: t?.name ?? "Untitled",
    shortDescription: t?.shortDescription ?? null,
    description: t?.description ?? null,
    specs: asArray(t?.specs),
    seoTitle: t?.seoTitle ?? null,
    seoDescription: t?.seoDescription ?? null,
  };
}

export type ProductSort = "newest" | "price-asc" | "price-desc" | "name";

export interface ProductFilters {
  categorySlug?: string;
  search?: string;
  sort?: ProductSort;
  featured?: boolean;
  onSale?: boolean;
  limit?: number;
  excludeId?: string;
  ids?: string[];
}

export async function listProducts(
  locale: string,
  filters: ProductFilters = {},
): Promise<ProductView[]> {
  const conditions = [eq(products.published, true)];
  if (filters.featured) conditions.push(eq(products.featured, true));
  if (filters.excludeId) conditions.push(ne(products.id, filters.excludeId));
  if (filters.ids) {
    if (filters.ids.length === 0) return [];
    conditions.push(inArray(products.id, filters.ids));
  }
  if (filters.categorySlug) {
    const cat = await db.query.categories.findFirst({
      where: eq(categories.slug, filters.categorySlug),
      columns: { id: true },
    });
    if (!cat) return [];
    conditions.push(eq(products.categoryId, cat.id));
  }

  const rows = await db.query.products.findMany({
    where: and(...conditions),
    with: { translations: true, category: { with: { translations: true } } },
    orderBy: [desc(products.featured), asc(products.sortOrder), desc(products.createdAt)],
  });

  let list = rows.map((r) => resolveProduct(r as ProductRow, locale));

  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter((p) =>
      [p.name, p.brand, p.sku, p.categoryName, p.shortDescription]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q)),
    );
  }
  if (filters.onSale) {
    list = list.filter((p) => p.salePrice != null && p.salePrice < p.price);
  }

  switch (filters.sort) {
    case "price-asc":
      list.sort((a, b) => effectivePrice(a) - effectivePrice(b));
      break;
    case "price-desc":
      list.sort((a, b) => effectivePrice(b) - effectivePrice(a));
      break;
    case "name":
      list.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      break;
  }

  return filters.limit ? list.slice(0, filters.limit) : list;
}

export async function getProductBySlug(
  slug: string,
  locale: string,
): Promise<ProductView | null> {
  const row = await db.query.products.findFirst({
    where: eq(products.slug, slug),
    with: { translations: true, category: { with: { translations: true } } },
  });
  if (!row || !row.published) return null;
  return resolveProduct(row as ProductRow, locale);
}

export async function listAllProductSlugs(): Promise<string[]> {
  const rows = await db
    .select({ slug: products.slug })
    .from(products)
    .where(eq(products.published, true));
  return rows.map((r) => r.slug);
}

export async function countProducts(): Promise<number> {
  const [row] = await db
    .select({ n: sql<number>`count(*)` })
    .from(products)
    .where(eq(products.published, true));
  return row?.n ?? 0;
}

/* ─── Banners ────────────────────────────────────────────────────────────── */
export interface BannerView {
  id: string;
  placement: "hero" | "promo";
  image: string;
  mobileImage: string | null;
  linkUrl: string | null;
  eyebrow: string | null;
  title: string | null;
  subtitle: string | null;
  ctaLabel: string | null;
}

export async function listBanners(
  locale: string,
  placement: "hero" | "promo",
): Promise<BannerView[]> {
  const rows = (await db.query.banners.findMany({
    where: and(eq(banners.active, true), eq(banners.placement, placement)),
    with: { translations: true },
    orderBy: [asc(banners.sortOrder), desc(banners.createdAt)],
  })) as (Banner & { translations: BannerTranslation[] })[];
  return rows.map((r) => {
    const t = pickTranslation(r.translations, locale);
    return {
      id: r.id,
      placement: r.placement,
      image: r.image,
      mobileImage: r.mobileImage,
      linkUrl: r.linkUrl,
      eyebrow: t?.eyebrow ?? null,
      title: t?.title ?? null,
      subtitle: t?.subtitle ?? null,
      ctaLabel: t?.ctaLabel ?? null,
    };
  });
}

/* ─── Projects ───────────────────────────────────────────────────────────── */
export interface ProjectView {
  id: string;
  slug: string;
  kind: string | null;
  image: string | null;
  gallery: string[];
  title: string;
  subtitle: string | null;
  description: string | null;
}

function resolveProject(
  row: Project & { translations: ProjectTranslation[] },
  locale: string,
): ProjectView {
  const t = pickTranslation(row.translations, locale);
  return {
    id: row.id,
    slug: row.slug,
    kind: row.kind,
    image: row.image,
    gallery: asArray(row.gallery),
    title: t?.title ?? "Untitled",
    subtitle: t?.subtitle ?? null,
    description: t?.description ?? null,
  };
}

export async function listProjects(
  locale: string,
  limit?: number,
): Promise<ProjectView[]> {
  const rows = await db.query.projects.findMany({
    where: eq(projects.published, true),
    with: { translations: true },
    orderBy: [asc(projects.sortOrder), desc(projects.createdAt)],
    limit,
  });
  return rows.map((r) => resolveProject(r, locale));
}

export async function getProjectBySlug(
  slug: string,
  locale: string,
): Promise<ProjectView | null> {
  const row = await db.query.projects.findFirst({
    where: eq(projects.slug, slug),
    with: { translations: true },
  });
  if (!row || !row.published) return null;
  return resolveProject(row, locale);
}
