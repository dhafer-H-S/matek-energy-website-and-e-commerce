import { locales } from "@/i18n/routing";
import type { SiteSettings } from "@/lib/queries/settings";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const BRAND_NAME = "Matek Energy";
const BRAND_DESCRIPTION =
  "Renewable energy, heating, cooling, hot water and electrical systems — products and professional installation services in Northern Cyprus.";
const LOGO_URL = `${SITE_URL}/brand/logo.png`;

type Json = Record<string, unknown>;

function abs(path: string): string {
  if (!path) return SITE_URL;
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

function telDigits(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const d = value.replace(/[^\d+]/g, "");
  return d || undefined;
}

/** Stable @id for the single Organization/LocalBusiness node, referenced elsewhere. */
export const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

export function organizationSchema(settings: SiteSettings): Json {
  const sameAs = Object.values(settings.social ?? {}).filter(
    (v): v is string => typeof v === "string" && v.length > 0,
  );
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness", "Store"],
    "@id": ORG_ID,
    name: BRAND_NAME,
    description: BRAND_DESCRIPTION,
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: LOGO_URL },
    image: LOGO_URL,
    ...(telDigits(settings.contactPhone) ? { telephone: telDigits(settings.contactPhone) } : {}),
    ...(settings.contactEmail ? { email: settings.contactEmail } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.addressText ?? "Kyrenia",
      addressLocality: "Kyrenia",
      addressRegion: "Kyrenia",
      addressCountry: "CY",
    },
    areaServed: [
      { "@type": "Country", name: "Northern Cyprus" },
      { "@type": "City", name: "Kyrenia" },
      { "@type": "City", name: "Nicosia" },
      { "@type": "City", name: "Famagusta" },
    ],
    ...(sameAs.length ? { sameAs } : {}),
    ...(settings.openingHours ? { openingHours: settings.openingHours } : {}),
  };
}

export function websiteSchema(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: BRAND_NAME,
    description: BRAND_DESCRIPTION,
    publisher: { "@id": ORG_ID },
    inLanguage: locales,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/en/shop?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function breadcrumbSchema(locale: string, items: BreadcrumbItem[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}/${locale}${item.path === "/" ? "" : item.path}`,
    })),
  };
}

interface ProductSchemaInput {
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  gallery: string[];
  sku: string | null;
  brand: string | null;
  price: number;
  currency: "TRY" | "EUR";
  inStock: boolean;
  quoteOnly: boolean;
  categoryName: string | null;
}

export function productSchema(locale: string, p: ProductSchemaInput): Json {
  const images = [...new Set([p.image, ...p.gallery].filter((v): v is string => Boolean(v)))].map(abs);
  const url = `${SITE_URL}/${locale}/products/${p.slug}`;
  const schema: Json = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    ...(p.description ? { description: p.description } : {}),
    ...(images.length ? { image: images } : {}),
    ...(p.sku ? { sku: p.sku, mpn: p.sku } : {}),
    ...(p.brand ? { brand: { "@type": "Brand", name: p.brand } } : {}),
    ...(p.categoryName ? { category: p.categoryName } : {}),
    url,
  };
  if (!p.quoteOnly) {
    schema.offers = {
      "@type": "Offer",
      price: p.price.toFixed(2),
      priceCurrency: p.currency,
      availability: p.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url,
      seller: { "@id": ORG_ID },
    };
  }
  return schema;
}

interface ServiceSchemaInput {
  title: string;
  slug: string;
  description: string | null;
  image: string | null;
  priceFrom: number | null;
  currency: "TRY" | "EUR";
}

export function serviceSchema(locale: string, s: ServiceSchemaInput): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.title,
    ...(s.description ? { description: s.description } : {}),
    ...(s.image ? { image: abs(s.image) } : {}),
    serviceType: s.title,
    provider: { "@id": ORG_ID },
    areaServed: { "@type": "Country", name: "Northern Cyprus" },
    url: `${SITE_URL}/${locale}/services/${s.slug}`,
    ...(s.priceFrom !== null
      ? {
          offers: {
            "@type": "Offer",
            price: s.priceFrom.toFixed(2),
            priceCurrency: s.currency,
            priceSpecification: {
              "@type": "PriceSpecification",
              priceCurrency: s.currency,
              price: s.priceFrom.toFixed(2),
              valueAddedTaxIncluded: false,
            },
          },
        }
      : {}),
  };
}

export function faqSchema(faqs: { q: string; a: string }[]): Json | null {
  const valid = faqs.filter((f) => f.q && f.a);
  if (!valid.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: valid.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

interface BlogPostingInput {
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  authorName: string | null;
  publishedAt: Date | null;
  updatedAt?: Date | null;
}

export function blogPostingSchema(locale: string, post: BlogPostingInput): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    ...(post.excerpt ? { description: post.excerpt } : {}),
    ...(post.coverImage ? { image: abs(post.coverImage) } : {}),
    author: post.authorName
      ? { "@type": "Person", name: post.authorName }
      : { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    ...(post.publishedAt ? { datePublished: post.publishedAt.toISOString() } : {}),
    ...(post.updatedAt ? { dateModified: post.updatedAt.toISOString() } : {}),
    mainEntityOfPage: `${SITE_URL}/${locale}/blog/${post.slug}`,
    inLanguage: locale,
  };
}

interface ItemListEntry {
  name: string;
  path: string;
}

export function itemListSchema(locale: string, name: string, entries: ItemListEntry[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: entries.length,
    itemListElement: entries.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}/${locale}${entry.path}`,
      name: entry.name,
    })),
  };
}
