import type { MetadataRoute } from "next";
import { eq } from "drizzle-orm";
import { locales } from "@/i18n/routing";
import { db } from "@/lib/db";
import { products, categories, projects, blogPosts, services } from "@/lib/db/schema";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

/** Static routes with their relative priority and how often they change. */
const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "", priority: 1, changeFrequency: "daily" },
  { path: "/shop", priority: 0.9, changeFrequency: "daily" },
  { path: "/services", priority: 0.9, changeFrequency: "weekly" },
  { path: "/projects", priority: 0.7, changeFrequency: "weekly" },
  { path: "/blog", priority: 0.7, changeFrequency: "weekly" },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" },
  { path: "/team", priority: 0.5, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.6, changeFrequency: "monthly" },
  { path: "/appointment", priority: 0.6, changeFrequency: "monthly" },
];

/** hreflang alternates so Google serves the right language per visitor. */
function languageAlternates(path: string): Record<string, string> {
  return Object.fromEntries(locales.map((l) => [l, `${SITE_URL}/${l}${path}`]));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const route of STATIC_ROUTES) {
    for (const locale of locales) {
      entries.push({
        url: `${SITE_URL}/${locale}${route.path}`,
        lastModified: new Date(),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: { languages: languageAlternates(route.path) },
      });
    }
  }

  try {
    const [prods, cats, projs, posts, svcs] = await Promise.all([
      db.select({ slug: products.slug, image: products.image, updatedAt: products.updatedAt }).from(products).where(eq(products.published, true)),
      db.select({ slug: categories.slug, updatedAt: categories.updatedAt }).from(categories).where(eq(categories.published, true)),
      db.select({ slug: projects.slug, updatedAt: projects.updatedAt }).from(projects).where(eq(projects.published, true)),
      db.select({ slug: blogPosts.slug, updatedAt: blogPosts.updatedAt }).from(blogPosts).where(eq(blogPosts.published, true)),
      db.select({ slug: services.slug, updatedAt: services.updatedAt }).from(services).where(eq(services.published, true)),
    ]);

    const toAbs = (image: string | null): string | undefined =>
      image ? (/^https?:\/\//.test(image) ? image : `${SITE_URL}${image.startsWith("/") ? "" : "/"}${image}`) : undefined;

    const push = (base: string, slug: string, updatedAt: Date | null, priority: number, image?: string | null) => {
      for (const locale of locales) {
        const img = toAbs(image ?? null);
        entries.push({
          url: `${SITE_URL}/${locale}${base}/${slug}`,
          lastModified: updatedAt ?? new Date(),
          changeFrequency: "weekly",
          priority,
          alternates: { languages: languageAlternates(`${base}/${slug}`) },
          ...(img ? { images: [img] } : {}),
        });
      }
    };

    for (const row of prods) push("/products", row.slug, row.updatedAt, 0.8, row.image);
    for (const row of cats) push("/categories", row.slug, row.updatedAt, 0.8);
    for (const row of svcs) push("/services", row.slug, row.updatedAt, 0.8);
    for (const row of projs) push("/projects", row.slug, row.updatedAt, 0.6);
    for (const row of posts) push("/blog", row.slug, row.updatedAt, 0.6);
  } catch {
    // If the DB is unreachable at build, fall back to static entries only.
  }

  return entries;
}
