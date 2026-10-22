import type { Metadata } from "next";
import { locales } from "@/i18n/routing";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Default branded social-share image used when a page has no image of its own. */
const DEFAULT_OG_IMAGE = "/og.png";

interface BuildMetadataArgs {
  title: string;
  description?: string | null;
  /** Path without locale prefix, e.g. "/developments" or "/blog/my-post". */
  path: string;
  locale: string;
  image?: string | null;
}

/** Build per-page metadata with hreflang alternates and Open Graph tags. */
export function buildMetadata({
  title,
  description,
  path,
  locale,
  image,
}: BuildMetadataArgs): Metadata {
  const cleanPath = path === "/" ? "" : path;
  const languages = Object.fromEntries(
    locales.map((l) => [l, `${SITE_URL}/${l}${cleanPath}`]),
  );
  const url = `${SITE_URL}/${locale}${cleanPath}`;
  const desc = description ?? undefined;
  const ogImage = image ?? DEFAULT_OG_IMAGE;

  return {
    title,
    description: desc,
    alternates: { canonical: url, languages },
    openGraph: {
      title,
      description: desc,
      url,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [ogImage],
    },
  };
}
