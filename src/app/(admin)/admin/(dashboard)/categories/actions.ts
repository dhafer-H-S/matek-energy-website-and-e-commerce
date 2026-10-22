"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { categories, categoryTranslations } from "@/lib/db/schema";
import {
  requireAdmin,
  str,
  strOrNull,
  int,
  bool,
  uniqueSlug,
  presentLocales,
} from "@/lib/admin/helpers";
import { toSlug } from "@/lib/slug";

export interface FormState {
  error?: string;
}

export async function saveCategory(
  id: string | null,
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  await requireAdmin();

  const nameEn = str(fd, "name_en");
  if (!nameEn) return { error: "An English name is required." };

  const slug = await uniqueSlug(toSlug(str(fd, "slug") || nameEn), async (s) => {
    const row = await db.query.categories.findFirst({
      where: eq(categories.slug, s),
      columns: { id: true },
    });
    return !!row && row.id !== id;
  });

  const values = {
    slug,
    image: strOrNull(fd, "image"),
    icon: strOrNull(fd, "icon"),
    published: bool(fd, "published"),
    sortOrder: int(fd, "sortOrder") ?? 0,
  };

  let categoryId = id;
  if (id) {
    await db.update(categories).set(values).where(eq(categories.id, id));
  } else {
    const [row] = await db
      .insert(categories)
      .values(values)
      .returning({ id: categories.id });
    categoryId = row?.id ?? null;
  }
  if (!categoryId) return { error: "Could not save the category." };

  await db
    .delete(categoryTranslations)
    .where(eq(categoryTranslations.categoryId, categoryId));
  for (const locale of presentLocales(fd, "name")) {
    await db.insert(categoryTranslations).values({
      categoryId,
      locale,
      name: str(fd, `name_${locale}`) || nameEn,
      description: strOrNull(fd, `description_${locale}`),
    });
  }

  revalidatePath("/", "layout");
  redirect("/admin/categories");
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  await db.delete(categories).where(eq(categories.id, id));
  revalidatePath("/", "layout");
}
