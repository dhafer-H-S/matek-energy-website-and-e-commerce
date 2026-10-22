"use client";

import { useLocale, useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { formatDate } from "@/lib/utils";
import type { BlogPostView } from "@/lib/queries/blog";

export function BlogCard({
  post,
  showExcerpt = false,
  showDate = false,
}: {
  post: BlogPostView;
  showExcerpt?: boolean;
  showDate?: boolean;
}) {
  const tc = useTranslations("common");
  const locale = useLocale();

  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <div className="relative aspect-16/10 overflow-hidden rounded-2xl bg-background-alt">
        {post.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImage}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : null}
      </div>

      {post.category ? (
        <span className="eyebrow mt-5 block text-brand">{post.category}</span>
      ) : null}

      <h3 className="mt-2 font-display text-xl leading-snug text-navy transition-colors group-hover:text-brand">
        {post.title}
      </h3>

      {showExcerpt && post.excerpt ? (
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
          {post.excerpt}
        </p>
      ) : null}

      {showDate && post.publishedAt ? (
        <p className="mt-2 text-xs text-muted">
          {formatDate(post.publishedAt, locale)}
        </p>
      ) : null}

      <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand">
        {tc("readMore")}
        <ArrowRight
          className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 rtl:rotate-180"
          strokeWidth={2}
        />
      </span>
    </Link>
  );
}
