export function readingMinutes(html: string | null): number {
  const text = (html ?? "").replace(/<[^>]*>/g, " ").replace(/&[^;]+;/g, " ").trim();
  return Math.max(1, Math.ceil((text ? text.split(/\s+/).length : 0) / 200));
}
