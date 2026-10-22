import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { CalendarDays, User } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { RichText } from "@/components/ui/RichText";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { BlogCard } from "@/components/cards/BlogCard";
import { getBlogPostBySlug, listRelatedPosts } from "@/lib/queries/blog";
import { buildMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getBlogPostBySlug(slug, locale);
  if (!post) return {};
  return buildMetadata({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    path: `/blog/${post.slug}`,
    locale,
    image: post.coverImage,
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const post = await getBlogPostBySlug(slug, locale);
  if (!post) notFound();
  const t = await getTranslations("blog");
  const related = await listRelatedPosts(post.id, post.category, locale, 3);

  return (
    <>
      <PageHero
        eyebrow={post.category ?? undefined}
        title={post.title}
        image={post.coverImage}
        meta={
          <>
            {post.authorName ? <span className="flex items-center gap-1.5"><User className="h-4 w-4" />{post.authorName}</span> : null}
            {post.publishedAt ? <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />{formatDate(post.publishedAt, locale)}</span> : null}
          </>
        }
      />
      <article className="py-14">
        <div className="container-luxe max-w-3xl">
          {post.content ? <RichText html={post.content} /> : null}
          <div className="mt-10 border-t border-border pt-6">
            <ShareButtons title={post.title} />
          </div>
        </div>
      </article>
      {related.length > 0 ? (
        <section className="bg-background-alt py-14">
          <div className="container-luxe">
            <h2 className="mb-8 font-display text-2xl text-navy">{t("related")}</h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <BlogCard key={p.id} post={p} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
