"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { siteContent } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/admin/helpers";
import { contentDefaults, contentSections, isContentObject } from "@/lib/content";
import { validateContent } from "@/lib/content-validation";

export interface ContentFormState {
  ok?: boolean;
  error?: string;
}

export async function saveSiteContent(section: string, _state: ContentFormState, fd: FormData): Promise<ContentFormState> {
  await requireAdmin();
  if (!Object.hasOwn(contentSections, section)) return { error: "Unknown website content section." };
  const values: { locale: "en" | "tr"; content: Record<string, unknown> }[] = [];
  for (const locale of ["en", "tr"] as const) {
    const raw = fd.get(`content_${locale}`);
    if (typeof raw !== "string" || raw.length > 500000) return { error: `${locale.toUpperCase()}: missing or oversized content.` };
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return { error: `${locale.toUpperCase()}: invalid content. Reload this editor and try again.` };
    }
    const template = contentDefaults[locale][section];
    if (!isContentObject(parsed)) return { error: `${locale.toUpperCase()}: invalid content section.` };
    const error = validateContent(parsed, template, section);
    if (error) return { error: `${locale.toUpperCase()} — ${error}` };
    values.push({ locale, content: parsed });
  }
  try {
    await db.transaction(async (tx) => {
      for (const value of values) {
        await tx.insert(siteContent).values({ section, ...value }).onConflictDoUpdate({
          target: [siteContent.section, siteContent.locale],
          set: { content: value.content, updatedAt: new Date() },
        });
      }
    });
  } catch (error) {
    console.error(`Could not save website content section ${section}:`, error);
    return { error: "Could not save website content. Your changes are still in the editor; please try again." };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}
