"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { banners, bannerTranslations } from "@/lib/db/schema";
import {
  requireAdmin,
  str,
  strOrNull,
  int,
  bool,
  LOCALES,
} from "@/lib/admin/helpers";

export interface BannerFormState {
  error?: string;
}

export async function saveBanner(
  id: string | null,
  _prev: BannerFormState,
  fd: FormData,
): Promise<BannerFormState> {
  await requireAdmin();

  const image = str(fd, "image");
  if (!image) return { error: "Please upload or choose a banner image." };

  const values = {
    placement: str(fd, "placement") === "promo" ? ("promo" as const) : ("hero" as const),
    image,
    mobileImage: strOrNull(fd, "mobileImage"),
    linkUrl: strOrNull(fd, "linkUrl"),
    active: bool(fd, "active"),
    sortOrder: int(fd, "sortOrder") ?? 0,
  };

  let bannerId = id;
  if (id) {
    await db.update(banners).set(values).where(eq(banners.id, id));
  } else {
    const [row] = await db
      .insert(banners)
      .values(values)
      .returning({ id: banners.id });
    bannerId = row?.id ?? null;
  }
  if (!bannerId) return { error: "Could not save the banner." };

  await db
    .delete(bannerTranslations)
    .where(eq(bannerTranslations.bannerId, bannerId));
  for (const locale of LOCALES) {
    const title = strOrNull(fd, `title_${locale}`);
    const subtitle = strOrNull(fd, `subtitle_${locale}`);
    const eyebrow = strOrNull(fd, `eyebrow_${locale}`);
    const ctaLabel = strOrNull(fd, `ctaLabel_${locale}`);
    if (!title && !subtitle && !eyebrow && !ctaLabel && locale !== "en") continue;
    await db
      .insert(bannerTranslations)
      .values({ bannerId, locale, title, subtitle, eyebrow, ctaLabel });
  }

  revalidatePath("/", "layout");
  redirect("/admin/banners");
}

export async function deleteBanner(id: string) {
  await requireAdmin();
  await db.delete(banners).where(eq(banners.id, id));
  revalidatePath("/", "layout");
}

export async function toggleBanner(id: string, active: boolean) {
  await requireAdmin();
  await db.update(banners).set({ active }).where(eq(banners.id, id));
  revalidatePath("/", "layout");
}
