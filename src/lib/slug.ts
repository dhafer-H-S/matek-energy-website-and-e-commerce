import slugify from "slugify";

/**
 * Build a URL-safe slug from a title. Falls back to a random token when the
 * input produces an empty slug (e.g. a purely Arabic title).
 */
export function toSlug(input: string | null | undefined): string {
  const base = slugify(input ?? "", {
    lower: true,
    strict: true,
    trim: true,
    locale: "en",
  });
  if (base) return base;
  return `item-${Math.random().toString(36).slice(2, 8)}`;
}

/** Append a short random suffix to keep a slug unique. */
export function uniquifySlug(slug: string): string {
  return `${slug}-${Math.random().toString(36).slice(2, 6)}`;
}
