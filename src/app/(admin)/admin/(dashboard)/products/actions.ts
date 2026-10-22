"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { products, productTranslations } from "@/lib/db/schema";
import {
  requireAdmin,
  str,
  strOrNull,
  num,
  int,
  bool,
  jsonArray,
  parseSpecs,
  uniqueSlug,
  presentLocales,
} from "@/lib/admin/helpers";
import { toSlug } from "@/lib/slug";

export interface ProductFormState {
  error?: string;
}

export async function saveProduct(
  id: string | null,
  _prev: ProductFormState,
  fd: FormData,
): Promise<ProductFormState> {
  await requireAdmin();

  const nameEn = str(fd, "name_en");
  if (!nameEn) return { error: "An English product name is required." };
  const categoryId = strOrNull(fd, "categoryId");
  if (!categoryId) return { error: "Please assign the product to a category." };

  const price = num(fd, "price") ?? 0;
  const salePrice = num(fd, "salePrice");
  if (salePrice != null && salePrice >= price && price > 0) {
    return { error: "Sale price must be lower than the regular price." };
  }

  const slug = await uniqueSlug(toSlug(str(fd, "slug") || nameEn), async (s) => {
    const row = await db.query.products.findFirst({
      where: eq(products.slug, s),
      columns: { id: true },
    });
    return !!row && row.id !== id;
  });

  const gallery = jsonArray(fd, "gallery");
  const values = {
    slug,
    categoryId,
    sku: strOrNull(fd, "sku"),
    brand: strOrNull(fd, "brand"),
    image: strOrNull(fd, "image") ?? gallery[0] ?? null,
    gallery,
    price,
    salePrice: salePrice && salePrice > 0 ? salePrice : null,
    currency: str(fd, "currency") === "TRY" ? ("TRY" as const) : ("EUR" as const),
    inStock: bool(fd, "inStock"),
    stock: int(fd, "stock"),
    quoteOnly: bool(fd, "quoteOnly"),
    featured: bool(fd, "featured"),
    isNew: bool(fd, "isNew"),
    published: bool(fd, "published"),
    sortOrder: int(fd, "sortOrder") ?? 0,
  };

  let productId = id;
  if (id) {
    await db.update(products).set(values).where(eq(products.id, id));
  } else {
    const [row] = await db
      .insert(products)
      .values(values)
      .returning({ id: products.id });
    productId = row?.id ?? null;
  }
  if (!productId) return { error: "Could not save the product." };

  await db
    .delete(productTranslations)
    .where(eq(productTranslations.productId, productId));
  for (const locale of presentLocales(fd, "name")) {
    await db.insert(productTranslations).values({
      productId,
      locale,
      name: str(fd, `name_${locale}`) || nameEn,
      shortDescription: strOrNull(fd, `shortDescription_${locale}`),
      description: strOrNull(fd, `description_${locale}`),
      specs: parseSpecs(str(fd, `specs_${locale}`)),
      seoTitle: strOrNull(fd, `seoTitle_${locale}`),
      seoDescription: strOrNull(fd, `seoDescription_${locale}`),
    });
  }

  revalidatePath("/", "layout");
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  await db.delete(products).where(eq(products.id, id));
  revalidatePath("/", "layout");
}
