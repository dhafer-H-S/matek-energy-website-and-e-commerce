import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { services, serviceTranslations } from "@/lib/db/schema";
import { pickTranslation } from "@/lib/db/translations";

export interface ServiceView {
  id: string;
  slug: string;
  icon: string | null;
  image: string | null;
  gallery: string[];
  priceFrom: number | null;
  currency: "TRY" | "EUR";
  categoryId: string | null;
  duration: string | null;
  highlights: string[];
  steps: { title: string; text: string }[];
  faqs: { q: string; a: string }[];
  title: string;
  description: string | null;
  content: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
}

type ServiceRow = typeof services.$inferSelect & {
  translations: (typeof serviceTranslations.$inferSelect)[];
};

function resolveService(row: ServiceRow, locale: string): ServiceView {
  const t = pickTranslation(row.translations, locale);
  return {
    id: row.id,
    slug: row.slug,
    icon: row.icon,
    image: row.image,
    gallery: row.gallery ?? [],
    priceFrom: row.priceFrom,
    currency: row.currency,
    categoryId: row.categoryId,
    duration: t?.duration ?? null,
    highlights: t?.highlights ?? [],
    steps: t?.steps ?? [],
    faqs: t?.faqs ?? [],
    title: t?.title ?? "Untitled",
    description: t?.description ?? null,
    content: t?.content ?? null,
    seoTitle: t?.seoTitle ?? null,
    seoDescription: t?.seoDescription ?? null,
  };
}

export async function listServices(locale: string): Promise<ServiceView[]> {
  const rows = await db.query.services.findMany({
    where: eq(services.published, true),
    with: { translations: true },
    orderBy: [asc(services.sortOrder)],
  });
  return rows.map((r) => resolveService(r as ServiceRow, locale));
}

export async function getServiceBySlug(
  slug: string,
  locale: string,
): Promise<ServiceView | null> {
  const row = await db.query.services.findFirst({
    where: eq(services.slug, slug),
    with: { translations: true },
  });
  if (!row || !row.published) return null;
  return resolveService(row as ServiceRow, locale);
}
