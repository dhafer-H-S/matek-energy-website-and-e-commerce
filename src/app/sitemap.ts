import type { MetadataRoute } from "next";
import { eq } from "drizzle-orm";
import { locales } from "@/i18n/routing";
import { db } from "@/lib/db";
import { products, categories, projects, blogPosts, services } from "@/lib/db/schema";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const STATIC_PATHS = [
  "",
  "/shop",
  "/services",
  "/projects",
  "/blog",
  "/about",
  "/team",
  "/contact",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const path of STATIC_PATHS) {
    for (const locale of locales) {
      entries.push({
        url: `${SITE_URL}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: path === "" ? 1 : 0.7,
      });
    }
  }

  try {
    const [prods, cats, projs, posts, svcs] = await Promise.all([
      db.select({ slug: products.slug }).from(products).where(eq(products.published, true)),
      db.select({ slug: categories.slug }).from(categories).where(eq(categories.published, true)),
      db.select({ slug: projects.slug }).from(projects).where(eq(projects.published, true)),
      db.select({ slug: blogPosts.slug }).from(blogPosts).where(eq(blogPosts.published, true)),
      db.select({ slug: services.slug }).from(services).where(eq(services.published, true)),
    ]);

    const dynamicGroups: [string, { slug: string }[]][] = [
      ["/products", prods],
      ["/categories", cats],
      ["/projects", projs],
      ["/blog", posts],
      ["/services", svcs],
    ];

    for (const [base, rows] of dynamicGroups) {
      for (const row of rows) {
        for (const locale of locales) {
          entries.push({
            url: `${SITE_URL}/${locale}${base}/${row.slug}`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
          });
        }
      }
    }
  } catch {
    // If the DB is unreachable at build, fall back to static entries only.
  }

  return entries;
}
