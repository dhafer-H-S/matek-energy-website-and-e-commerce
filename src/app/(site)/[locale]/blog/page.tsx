import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { PageHero } from "@/components/site/PageHero";
import { BlogCard } from "@/components/cards/BlogCard";
import { listBlogPosts } from "@/lib/queries/blog";
import { buildMetadata } from "@/lib/seo";
import { Link } from "@/i18n/navigation";
import { ArrowUpRight, Search, Clock } from "lucide-react";
import { ConsultationCta } from "@/components/site/ConsultationCta";
import { readingMinutes } from "@/lib/reading-time";
import { formatDate } from "@/lib/utils";

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
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("blog");
  const posts = await listBlogPosts(locale);
  const filters = await searchParams;
  const query = filters.q?.trim() ?? "";
  const categories = [...new Set(posts.map((p) => p.category).filter((value): value is string => Boolean(value)))];
  const category = filters.category && categories.includes(filters.category) ? filters.category : null;
  const filtered = posts.filter((post) => (!category || post.category === category) && (!query || [post.title, post.excerpt ?? ""].some((value) => value.toLocaleLowerCase(locale).includes(query.toLocaleLowerCase(locale)))));
  const featured = !query && !category ? filtered[0] : undefined;
  const rest = featured ? filtered.slice(1) : filtered;
  const topics = t.raw("topics") as { title: string; text: string; query: string }[];

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />
      <section className="border-b border-border bg-background-alt py-10">
        <div className="container-luxe grid gap-6 md:grid-cols-3">{topics.map((topic) => <Link key={topic.title} href={{ pathname: "/blog", query: { q: topic.query } }} className="group rounded-2xl bg-white p-6"><h2 className="flex items-center justify-between gap-3 font-display text-lg text-navy">{topic.title}<ArrowUpRight className="h-4 w-4 shrink-0 text-brand" /></h2><p className="mt-2 text-sm leading-relaxed text-muted">{topic.text}</p></Link>)}</div>
      </section>
      <section className="py-16">
        <div className="container-luxe">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
            <div><span className="eyebrow text-brand">{t("libraryEyebrow")}</span><h2 className="mt-3 font-display text-3xl text-navy">{t("libraryTitle")}</h2></div>
            <form action={`/${locale}/blog`} method="get" role="search" className="flex w-full gap-2 sm:w-auto">
              {category ? <input type="hidden" name="category" value={category} /> : null}
              <input name="q" aria-label={t("search")} placeholder={t("search")} defaultValue={query} className="min-w-0 flex-1 rounded-full border border-border bg-white px-5 py-3 text-sm outline-none focus:border-brand" />
              <button type="submit" aria-label={t("search")} className="rounded-full bg-navy p-3.5 text-white hover:bg-brand"><Search className="h-5 w-5" /></button>
            </form>
          </div>
          <nav aria-label={t("categoryFilter")} className="mb-8 flex flex-wrap gap-2">
            <Link href={{ pathname: "/blog", query: query ? { q: query } : {} }} aria-current={!category ? "page" : undefined} className={`rounded-full border px-5 py-2 text-sm font-semibold ${!category ? "border-navy bg-navy text-white" : "border-border text-navy hover:border-brand"}`}>{t("allArticles")}</Link>
            {categories.map((value) => <Link key={value} href={{ pathname: "/blog", query: { category: value, ...(query ? { q: query } : {}) } }} aria-current={category === value ? "page" : undefined} className={`rounded-full border px-5 py-2 text-sm font-semibold ${category === value ? "border-navy bg-navy text-white" : "border-border text-navy hover:border-brand"}`}>{value === "Guides" ? t("guides") : value}</Link>)}
          </nav>
          {featured ? <div className="mb-12 grid overflow-hidden rounded-3xl bg-navy text-white lg:grid-cols-2">
            <Link href={`/blog/${featured.slug}`} aria-label={featured.title} className="relative min-h-64 bg-background-alt">{featured.coverImage ? <Image src={featured.coverImage} alt={featured.title} fill loading="eager" sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" /> : null}</Link>
            <div className="p-8 sm:p-12"><span className="eyebrow text-white/65">{t("featured")}</span><h2 className="mt-3 font-display text-3xl leading-tight">{featured.title}</h2>{featured.excerpt ? <p className="mt-4 leading-relaxed text-white/75">{featured.excerpt}</p> : null}<p className="mt-5 flex flex-wrap items-center gap-2 text-xs text-white/65"><Clock className="h-4 w-4" />{t("readingTime", { minutes: readingMinutes(featured.content) })}{featured.publishedAt ? ` · ${formatDate(featured.publishedAt, locale)}` : ""}</p><Link href={`/blog/${featured.slug}`} className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold hover:bg-white hover:text-navy">{t("readGuide")}<ArrowUpRight className="h-4 w-4" /></Link></div>
          </div> : null}
          {query || category ? <p role="status" className="mb-6 text-sm text-muted">{t("results", { count: filtered.length })}{query ? ` · “${query}”` : ""}</p> : null}
          {filtered.length === 0 ? (
            <div className="rounded-3xl bg-background-alt px-6 py-14 text-center"><h2 className="font-display text-2xl text-navy">{posts.length ? t("noResults") : t("empty")}</h2><p className="mt-3 text-muted">{t("emptyHelp")}</p><Link href="/blog" className="mt-5 inline-flex text-sm font-semibold text-brand">{t("reset")} →</Link></div>
          ) : <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((p) => (
                <BlogCard key={p.id} post={p} showExcerpt showDate />
              ))}
            </div>}
        </div>
      </section>
      <section className="bg-background-alt py-14"><div className="container-luxe grid gap-6 lg:grid-cols-2"><h2 className="font-display text-3xl text-navy">{t("adviceTitle")}</h2><p className="leading-relaxed text-muted">{t("adviceText")}</p></div></section>
      <ConsultationCta locale={locale} />
    </>
  );
}
