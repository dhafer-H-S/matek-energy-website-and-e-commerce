"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { blogPosts, blogTranslations } from "@/lib/db/schema";
import {
  requireAdmin,
  str,
  strOrNull,
  bool,
  uniqueSlug,
  LOCALES,
} from "@/lib/admin/helpers";
import { toSlug } from "@/lib/slug";

export interface BlogFormState {
  error?: string;
}

export async function saveBlogPost(
  id: string | null,
  _prev: BlogFormState,
  fd: FormData,
): Promise<BlogFormState> {
  await requireAdmin();

  const titleEn = str(fd, "title_en");
  if (!titleEn) return { error: "An English title is required." };

  const baseSlug = toSlug(str(fd, "slug") || titleEn);
  const slug = await uniqueSlug(baseSlug, async (s) => {
    const row = await db.query.blogPosts.findFirst({
      where: eq(blogPosts.slug, s),
      columns: { id: true },
    });
    return !!row && row.id !== id;
  });

  const published = bool(fd, "published");

  // Preserve an existing publish date; otherwise set on first publish.
  let publishedAt: Date | null = null;
  if (id) {
    const current = await db.query.blogPosts.findFirst({
      where: eq(blogPosts.id, id),
      columns: { publishedAt: true },
    });
    publishedAt = current?.publishedAt ?? null;
  }
  if (published && !publishedAt) publishedAt = new Date();

  const values = {
    slug,
    coverImage: strOrNull(fd, "coverImage"),
    category: strOrNull(fd, "category"),
    authorName: strOrNull(fd, "authorName"),
    published,
    publishedAt,
  };

  let postId = id;
  if (id) {
    await db.update(blogPosts).set(values).where(eq(blogPosts.id, id));
  } else {
    const [row] = await db
      .insert(blogPosts)
      .values(values)
      .returning({ id: blogPosts.id });
    postId = row?.id ?? null;
  }
  if (!postId) return { error: "Could not save the post." };

  for (const locale of LOCALES) {
    const title = str(fd, `title_${locale}`);
    const present = locale === "en" || title.length > 0;
    const existing = await db.query.blogTranslations.findFirst({
      where: and(
        eq(blogTranslations.postId, postId),
        eq(blogTranslations.locale, locale),
      ),
      columns: { id: true },
    });

    if (!present) {
      if (existing) {
        await db
          .delete(blogTranslations)
          .where(eq(blogTranslations.id, existing.id));
      }
      continue;
    }

    const tr = {
      title: title || titleEn,
      excerpt: strOrNull(fd, `excerpt_${locale}`),
      content: strOrNull(fd, `content_${locale}`),
      seoTitle: strOrNull(fd, `seoTitle_${locale}`),
      seoDescription: strOrNull(fd, `seoDescription_${locale}`),
    };

    if (existing) {
      await db
        .update(blogTranslations)
        .set(tr)
        .where(eq(blogTranslations.id, existing.id));
    } else {
      await db
        .insert(blogTranslations)
        .values({ postId, locale, ...tr });
    }
  }

  revalidatePath("/admin/blog");
  revalidatePath("/", "layout");
  redirect("/admin/blog");
}

export async function deleteBlogPost(id: string) {
  await requireAdmin();
  await db.delete(blogPosts).where(eq(blogPosts.id, id));
  revalidatePath("/admin/blog");
  revalidatePath("/", "layout");
}
