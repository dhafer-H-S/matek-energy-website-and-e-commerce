import { defaultLocale } from "@/i18n/routing";

/**
 * Pick the best translation row for a locale, falling back to the default
 * locale and finally to whatever exists. Returns undefined only when the list
 * is empty.
 */
export function pickTranslation<T extends { locale: string }>(
  translations: T[] | undefined,
  locale: string,
  fallback: string = defaultLocale,
): T | undefined {
  if (!translations || translations.length === 0) return undefined;
  return (
    translations.find((t) => t.locale === locale) ??
    translations.find((t) => t.locale === fallback) ??
    translations[0]
  );
}

/** Coalesce a possibly-null JSON array column into a plain array. */
export function asArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}
