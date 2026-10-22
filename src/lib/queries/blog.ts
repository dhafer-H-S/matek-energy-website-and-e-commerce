import "server-only";
import { and, asc, desc, eq, gt, lt, ne, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { blogPosts, blogTranslations } from "@/lib/db/schema";
import { pickTranslation } from "@/lib/db/translations";

export interface BlogPostView {
  id: string;
  slug: string;
  coverImage: string | null;
  category: string | null;
  authorName: string | null;
  publishedAt: Date | null;
  title: string;
  excerpt: string | null;
  content: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
}

type BlogRow = typeof blogPosts.$inferSelect & {
  translations: (typeof blogTranslations.$inferSelect)[];
};

function resolveBlog(row: BlogRow, locale: string): BlogPostView {
  const t = pickTranslation(row.translations, locale);
  return {
    id: row.id,
    slug: row.slug,
    coverImage: row.coverImage,
    category: row.category,
    authorName: row.authorName,
    publishedAt: row.publishedAt,
    title: t?.title ?? "Untitled",
    excerpt: t?.excerpt ?? null,
    content: t?.content ?? null,
    seoTitle: t?.seoTitle ?? null,
    seoDescription: t?.seoDescription ?? null,
  };
}

export async function listBlogPosts(
  locale: string,
  opts: { limit?: number } = {},
): Promise<BlogPostView[]> {
  const rows = await db.query.blogPosts.findMany({
    where: eq(blogPosts.published, true),
    with: { translations: true },
    orderBy: [desc(blogPosts.publishedAt), desc(blogPosts.createdAt)],
    limit: opts.limit,
  });
  return rows.map((r) => resolveBlog(r as BlogRow, locale));
}

export async function getBlogPostBySlug(
  slug: string,
  locale: string,
): Promise<BlogPostView | null> {
  const row = await db.query.blogPosts.findFirst({
    where: eq(blogPosts.slug, slug),
    with: { translations: true },
  });
  if (!row || !row.published) return null;
  return resolveBlog(row as BlogRow, locale);
}

export async function listRelatedPosts(
  postId: string,
  category: string | null,
  locale: string,
  limit = 3,
): Promise<BlogPostView[]> {
  const conditions = [eq(blogPosts.published, true), ne(blogPosts.id, postId)];
  if (category) conditions.push(eq(blogPosts.category, category));
  const rows = await db.query.blogPosts.findMany({
    where: and(...conditions),
    with: { translations: true },
    orderBy: [sql`RANDOM()`],
    limit,
  });
  return rows.map((r) => resolveBlog(r as BlogRow, locale));
}

export interface AdjacentPosts {
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
}

/** Previous (older) and next (newer) published posts relative to this one. */
export async function getAdjacentPosts(
  publishedAt: Date | null,
  postId: string,
  locale: string,
): Promise<AdjacentPosts> {
  if (!publishedAt) return { prev: null, next: null };

  const [prevRow, nextRow] = await Promise.all([
    db.query.blogPosts.findFirst({
      where: and(
        eq(blogPosts.published, true),
        ne(blogPosts.id, postId),
        lt(blogPosts.publishedAt, publishedAt),
      ),
      with: { translations: true },
      orderBy: [desc(blogPosts.publishedAt)],
    }),
    db.query.blogPosts.findFirst({
      where: and(
        eq(blogPosts.published, true),
        ne(blogPosts.id, postId),
        gt(blogPosts.publishedAt, publishedAt),
      ),
      with: { translations: true },
      orderBy: [asc(blogPosts.publishedAt)],
    }),
  ]);

  const toLink = (row: BlogRow | undefined) =>
    row
      ? { slug: row.slug, title: resolveBlog(row, locale).title }
      : null;

  return {
    prev: toLink(prevRow as BlogRow | undefined),
    next: toLink(nextRow as BlogRow | undefined),
  };
}
