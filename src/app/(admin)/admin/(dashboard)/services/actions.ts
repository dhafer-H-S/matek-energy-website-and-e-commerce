"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { services, serviceTranslations } from "@/lib/db/schema";
import {
  requireAdmin,
  str,
  strOrNull,
  int,
  bool,
  uniqueSlug,
  num,
  lines,
  jsonArray,
  LOCALES,
} from "@/lib/admin/helpers";
import { toSlug } from "@/lib/slug";

/** "Left | Right" per line. */
function pairs(raw: string): [string, string][] {
  return lines(raw).map((l) => {
    const i = l.indexOf("|");
    return i === -1 ? ([l, ""] as [string, string]) : ([l.slice(0, i).trim(), l.slice(i + 1).trim()] as [string, string]);
  });
}

export interface ServiceFormState {
  error?: string;
}

export async function saveService(
  id: string | null,
  _prev: ServiceFormState,
  fd: FormData,
): Promise<ServiceFormState> {
  await requireAdmin();

  const titleEn = str(fd, "title_en");
  if (!titleEn) return { error: "An English title is required." };

  const baseSlug = toSlug(str(fd, "slug") || titleEn);
  const slug = await uniqueSlug(baseSlug, async (s) => {
    const row = await db.query.services.findFirst({
      where: eq(services.slug, s),
      columns: { id: true },
    });
    return !!row && row.id !== id;
  });

  const values = {
    slug,
    icon: strOrNull(fd, "icon"),
    image: strOrNull(fd, "image"),
    gallery: jsonArray(fd, "gallery"),
    priceFrom: num(fd, "priceFrom"),
    currency: str(fd, "currency") === "TRY" ? ("TRY" as const) : ("EUR" as const),
    categoryId: strOrNull(fd, "categoryId"),
    published: bool(fd, "published"),
    sortOrder: int(fd, "sortOrder") ?? 0,
  };

  let serviceId = id;
  if (id) {
    await db.update(services).set(values).where(eq(services.id, id));
  } else {
    const [row] = await db
      .insert(services)
      .values(values)
      .returning({ id: services.id });
    serviceId = row?.id ?? null;
  }
  if (!serviceId) return { error: "Could not save the service." };

  for (const locale of LOCALES) {
    const title = str(fd, `title_${locale}`);
    const present = locale === "en" || title.length > 0;
    const existing = await db.query.serviceTranslations.findFirst({
      where: and(
        eq(serviceTranslations.serviceId, serviceId),
        eq(serviceTranslations.locale, locale),
      ),
      columns: { id: true },
    });
    if (!present) {
      if (existing) {
        await db
          .delete(serviceTranslations)
          .where(eq(serviceTranslations.id, existing.id));
      }
      continue;
    }
    const tr = {
      title: title || titleEn,
      description: strOrNull(fd, `description_${locale}`),
      content: strOrNull(fd, `content_${locale}`),
      duration: strOrNull(fd, `duration_${locale}`),
      highlights: lines(str(fd, `highlights_${locale}`)),
      steps: pairs(str(fd, `steps_${locale}`)).map(([title, text]) => ({ title, text })),
      faqs: pairs(str(fd, `faqs_${locale}`)).map(([q, a]) => ({ q, a })),
      seoTitle: strOrNull(fd, `seoTitle_${locale}`),
      seoDescription: strOrNull(fd, `seoDescription_${locale}`),
    };
    if (existing) {
      await db
        .update(serviceTranslations)
        .set(tr)
        .where(eq(serviceTranslations.id, existing.id));
    } else {
      await db
        .insert(serviceTranslations)
        .values({ serviceId, locale, ...tr });
    }
  }

  revalidatePath("/admin/services");
  revalidatePath("/", "layout");
  redirect("/admin/services");
}

export async function deleteService(id: string) {
  await requireAdmin();
  await db.delete(services).where(eq(services.id, id));
  revalidatePath("/admin/services");
  revalidatePath("/", "layout");
}
