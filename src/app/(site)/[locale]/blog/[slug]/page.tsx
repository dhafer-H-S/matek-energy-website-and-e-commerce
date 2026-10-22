import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { CalendarDays, User, Clock, Check } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { RichText } from "@/components/ui/RichText";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { BlogCard } from "@/components/cards/BlogCard";
import { getBlogPostBySlug, listRelatedPosts, listBlogPosts } from "@/lib/queries/blog";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { blogPostingSchema, breadcrumbSchema } from "@/lib/structured-data";
import { formatDate } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { listServices } from "@/lib/queries/services";
import { readingMinutes } from "@/lib/reading-time";
import { ConsultationCta } from "@/components/site/ConsultationCta";

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
  const [related, allPosts, services] = await Promise.all([listRelatedPosts(post.id, post.category, locale, 3), listBlogPosts(locale), listServices(locale)]);
  const index = allPosts.findIndex((item) => item.id === post.id);
  const newer = allPosts[index - 1];
  const older = allPosts[index + 1];
  const preparations = t.raw("preparations") as string[];

  return (
    <>
      <JsonLd data={[
        blogPostingSchema(locale, post),
        breadcrumbSchema(locale, [
          { name: t("title"), path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ]),
      ]} />
      <PageHero
        eyebrow={post.category === "Guides" ? t("guides") : post.category ?? undefined}
        title={post.title}
        subtitle={post.excerpt ?? undefined}
        image={post.coverImage}
        meta={
          <>
            {post.authorName ? <span className="flex items-center gap-1.5"><User className="h-4 w-4" />{post.authorName}</span> : null}
            {post.publishedAt ? <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />{formatDate(post.publishedAt, locale)}</span> : null}
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{t("readingTime", { minutes: readingMinutes(post.content) })}</span>
          </>
        }
      />
      <article className="py-14">
        <div className="container-luxe">
          <Link href="/blog" className="mb-8 inline-flex text-sm font-semibold text-brand">← {t("allArticles")}</Link>
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
          {post.content ? <RichText html={post.content} className="mx-auto max-w-3xl text-base leading-relaxed sm:text-lg" /> : <p className="text-muted">{post.excerpt || t("contentPending")}</p>}
          <div className="mt-10 rounded-3xl bg-background-alt p-7 sm:p-9"><span className="eyebrow text-brand">{t("practicalEyebrow")}</span><h2 className="mt-3 font-display text-2xl text-navy">{t("prepareTitle")}</h2><p className="mt-3 text-sm leading-relaxed text-muted">{t("prepareText")}</p><ul className="mt-5 space-y-3">{preparations.map((item) => <li key={item} className="flex gap-3 text-sm leading-relaxed text-navy"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />{item}</li>)}</ul></div>
          <p className="mt-6 text-xs leading-relaxed text-muted">{t("disclaimer")}</p>
          <div className="mt-10 border-t border-border pt-6">
            <ShareButtons title={post.title} />
          </div>
          {newer || older ? <nav aria-label={t("articleNavigation")} className="mt-8 grid gap-4 sm:grid-cols-2">{newer ? <Link href={`/blog/${newer.slug}`} className="rounded-2xl border border-border p-5 hover:border-brand"><span className="text-xs font-semibold text-brand">← {t("newer")}</span><span className="mt-2 block font-display text-lg text-navy">{newer.title}</span></Link> : <div />}{older ? <Link href={`/blog/${older.slug}`} className="rounded-2xl border border-border p-5 hover:border-brand"><span className="text-xs font-semibold text-brand">{t("older")} →</span><span className="mt-2 block font-display text-lg text-navy">{older.title}</span></Link> : null}</nav> : null}
          </div>
          <aside className="space-y-6 lg:sticky lg:top-44">
            <div className="rounded-3xl bg-navy p-7 text-white"><h2 className="font-display text-2xl">{t("expertTitle")}</h2><p className="mt-3 text-sm leading-relaxed text-white/75">{t("expertText")}</p><Link href={{ pathname: "/contact", query: { subject: post.title } }} className="mt-6 flex justify-center rounded-full bg-brand px-5 py-3 text-sm font-semibold hover:bg-white hover:text-navy">{t("askExpert")}</Link></div>
            {services.length ? <div className="rounded-3xl border border-border p-7"><h2 className="font-display text-xl text-navy">{t("servicesTitle")}</h2><div className="mt-4 divide-y divide-border">{services.map((service) => <Link key={service.id} href={`/services/${service.slug}`} className="flex justify-between gap-3 py-3 text-sm text-navy hover:text-brand">{service.title}<span aria-hidden="true">↗</span></Link>)}</div></div> : null}
          </aside>
          </div>
        </div>
      </article>
      {related.length > 0 ? (
        <section className="bg-background-alt py-14">
          <div className="container-luxe">
            <h2 className="mb-8 font-display text-2xl text-navy">{t("related")}</h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <BlogCard key={p.id} post={p} showExcerpt showDate />
              ))}
            </div>
          </div>
        </section>
      ) : null}
      <ConsultationCta locale={locale} />
    </>
  );
}
