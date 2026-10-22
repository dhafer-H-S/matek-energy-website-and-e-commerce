import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names with Tailwind conflict resolution. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Estimate reading time in minutes from HTML or plain text (≈200 wpm). */
export function readingTime(content: string | null | undefined): number {
  if (!content) return 1;
  const text = content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return 1;
  const words = text.split(" ").length;
  return Math.max(1, Math.round(words / 200));
}

/** Format a numeric price with a currency code into a localized string. */
export function formatPrice(
  amount: number | null | undefined,
  currency = "USD",
  locale = "en",
): string | null {
  if (amount == null || Number.isNaN(amount)) return null;
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

/** Compact number formatting (e.g. 2.4M) for stats and price-from labels. */
export function formatCompact(
  amount: number | null | undefined,
  locale = "en",
): string | null {
  if (amount == null || Number.isNaN(amount)) return null;
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
}

/** Format an ISO date string for a given locale. */
export function formatDate(
  value: string | number | Date | null | undefined,
  locale = "en",
): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/** Safely parse a JSON column that may already be an array/object. */
export function parseJson<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value !== "string") return value as T;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
