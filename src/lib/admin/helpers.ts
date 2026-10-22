import "server-only";
import { getCurrentUser } from "@/lib/auth/session";
import type { SessionPayload } from "@/lib/auth/jwt";

export const LOCALES = ["en", "tr"] as const;
export type FormLocale = (typeof LOCALES)[number];

export async function requireAdmin(): Promise<SessionPayload> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireSuperAdminUser(): Promise<SessionPayload> {
  const user = await requireAdmin();
  if (user.role !== "super_admin") throw new Error("Forbidden");
  return user;
}

export function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export function strOrNull(fd: FormData, key: string): string | null {
  return str(fd, key) || null;
}

export function num(fd: FormData, key: string): number | null {
  const v = str(fd, key);
  if (!v) return null;
  const n = Number(v.replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

export function int(fd: FormData, key: string): number | null {
  const n = num(fd, key);
  return n == null ? null : Math.round(n);
}

export function bool(fd: FormData, key: string): boolean {
  const v = fd.get(key);
  return v === "on" || v === "true" || v === "1";
}

/** Split a textarea value into a trimmed array of non-empty lines. */
export function lines(value: string): string[] {
  return value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Parse a hidden JSON-array input (e.g. galleries). */
export function jsonArray(fd: FormData, key: string): string[] {
  try {
    const parsed = JSON.parse(str(fd, key) || "[]");
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/** Get the multi-value list for a checkbox group. */
export function multi(fd: FormData, key: string): string[] {
  return fd
    .getAll(key)
    .filter((v): v is string => typeof v === "string" && v.length > 0);
}

/**
 * Produce a unique slug given a base and a function that reports whether a slug
 * is already taken (the caller excludes the current record when editing).
 */
export async function uniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const root = base || "item";
  let candidate = root;
  let i = 2;
  while (await exists(candidate)) {
    candidate = `${root}-${i}`;
    i += 1;
  }
  return candidate;
}

export interface TranslationInput {
  locale: FormLocale;
  fields: Record<string, string | string[] | null>;
}

/**
 * Collect translation field values for each locale. `defs` maps an output key
 * to the form field prefix and a parser. Locales whose primary field is empty
 * (other than the default `en`) are returned with `present: false` so callers
 * can skip/remove them, enabling proper EN fallback.
 */
export function collectTranslations(
  fd: FormData,
  defs: {
    key: string;
    type?: "text" | "lines";
  }[],
  primaryKey: string,
): { locale: FormLocale; present: boolean; values: Record<string, string | string[] | null> }[] {
  return LOCALES.map((locale) => {
    const values: Record<string, string | string[] | null> = {};
    for (const def of defs) {
      const raw = str(fd, `${def.key}_${locale}`);
      values[def.key] = def.type === "lines" ? lines(raw) : raw || null;
    }
    const primary = str(fd, `${primaryKey}_${locale}`);
    return { locale, present: locale === "en" || primary.length > 0, values };
  });
}

/** Pull a `{label, value}` spec list out of a "Label: Value" per-line textarea. */
export function parseSpecs(raw: string): { label: string; value: string }[] {
  return lines(raw)
    .map((line) => {
      const i = line.indexOf(":");
      if (i === -1) return { label: line, value: "" };
      return { label: line.slice(0, i).trim(), value: line.slice(i + 1).trim() };
    })
    .filter((s) => s.label);
}

/**
 * Locales to persist for an entity: `en` always, others only when their
 * primary field was filled in (so the site falls back to English).
 */
export function presentLocales(fd: FormData, primaryKey: string): FormLocale[] {
  return LOCALES.filter(
    (l) => l === "en" || str(fd, `${primaryKey}_${l}`).length > 0,
  );
}
