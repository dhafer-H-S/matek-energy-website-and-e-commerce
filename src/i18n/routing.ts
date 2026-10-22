import { defineRouting } from "next-intl/routing";

export const locales = ["en", "tr"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Locales that render right-to-left. */
export const rtlLocales: Locale[] = [];

export function isRtl(locale: string): boolean {
  return rtlLocales.includes(locale as Locale);
}

export function dirFor(locale: string): "ltr" | "rtl" {
  return isRtl(locale) ? "rtl" : "ltr";
}

export const localeNames: Record<Locale, string> = {
  en: "English",
  tr: "Türkçe",
};

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always",
});
