export function trText<T extends { locale: string }>(
  translations: T[] | undefined,
  field: keyof T,
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const t of translations ?? []) {
    const v = t[field];
    if (typeof v === "string") map[t.locale] = v;
  }
  return map;
}

export function specsText<T extends { locale: string; specs?: { label: string; value: string }[] | null }>(
  translations: T[] | undefined,
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const t of translations ?? []) {
    map[t.locale] = (t.specs ?? []).map((s) => `${s.label}: ${s.value}`).join("\n");
  }
  return map;
}

export const ErrorNote = ({ message }: { message?: string }) =>
  message ? (
    <p className="rounded-sm border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-600">
      {message}
    </p>
  ) : null;
