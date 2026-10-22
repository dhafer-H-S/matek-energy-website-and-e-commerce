import { parse, TYPE, type MessageFormatElement } from "@formatjs/icu-messageformat-parser";
import { isContentObject, type ContentValue } from "./content";

function argumentsIn(elements: MessageFormatElement[]): string[] {
  const names: string[] = [];
  for (const element of elements) {
    if (element.type === TYPE.literal || element.type === TYPE.pound) continue;
    names.push(`${element.type}:${element.value}`);
    if (element.type === TYPE.select || element.type === TYPE.plural) {
      for (const option of Object.values(element.options)) names.push(...argumentsIn(option.value));
    }
    if (element.type === TYPE.tag) names.push(...argumentsIn(element.children));
  }
  return [...new Set(names)].sort();
}

export function validateContent(value: unknown, template: ContentValue, path: string): string | null {
  if (typeof template === "string") {
    if (typeof value !== "string") return `${path}: expected text.`;
    if (value.length > 20000) return `${path}: keep text under 20,000 characters.`;
    if (path.startsWith("media.")) {
      try {
        const parsed = parse(value);
        if (parsed.length !== 1 || parsed[0].type !== TYPE.literal || parsed[0].value !== value) return `${path}: image URLs cannot contain message placeholders or formatting.`;
      } catch {
        return `${path}: image URLs cannot contain message placeholders or formatting.`;
      }
      if (/^\/(?!\/)[^\s\\]*$/.test(value)) return null;
      try {
        const url = new URL(value);
        if (url.protocol === "https:" && !url.username && !url.password && (url.hostname === "images.pexels.com" || url.hostname.endsWith(".pexels.com") || url.hostname.endsWith(".public.blob.vercel-storage.com"))) return null;
      } catch {
        return `${path}: choose a valid local, Pexels or Vercel Blob image.`;
      }
      return `${path}: choose an image from the media library or upload a file.`;
    }
    try {
      const expected = argumentsIn(parse(template));
      const actual = argumentsIn(parse(value));
      if (JSON.stringify(expected) !== JSON.stringify(actual)) return `${path}: preserve the original {placeholders} and their number/plural formats.`;
    } catch {
      return `${path}: invalid message format. Check braces and preserve the original {placeholders}.`;
    }
    return null;
  }
  if (Array.isArray(template)) {
    if (!Array.isArray(value) || value.length > 30) return `${path}: use a list of up to 30 items.`;
    if (!template.length && value.length) return `${path}: this list does not support new items.`;
    for (let index = 0; index < value.length; index++) {
      const error = validateContent(value[index], template[index] ?? template[0], `${path}.${index + 1}`);
      if (error) return error;
    }
    return null;
  }
  if (!isContentObject(value)) return `${path}: expected a group of fields.`;
  const expectedKeys = Object.keys(template).sort();
  if (JSON.stringify(Object.keys(value).sort()) !== JSON.stringify(expectedKeys)) return `${path}: fields do not match this page. Reload the editor before saving.`;
  for (const key of expectedKeys) {
    const error = validateContent(value[key], template[key], `${path}.${key}`);
    if (error) return error;
  }
  return null;
}
