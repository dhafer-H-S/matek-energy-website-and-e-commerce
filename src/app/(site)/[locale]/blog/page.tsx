import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { PageHero } from "@/components/site/PageHero";
import { BlogCard } from "@/components/cards/BlogCard";
import { listBlogPosts } from "@/lib/queries/blog";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  return buildMetadata({ title: t("title"), description: t("subtitle"), path: "/blog", locale });
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("blog");
  const posts = await listBlogPosts(locale);

  return (
    <>
      <PageHero title={t("title")} subtitle={t("subtitle")} />
      <section className="py-16">
        <div className="container-luxe">
          {posts.length === 0 ? (
            <p className="py-16 text-center text-muted">{t("empty")}</p>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => (
                <BlogCard key={p.id} post={p} showExcerpt showDate />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
