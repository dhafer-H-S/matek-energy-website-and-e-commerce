"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { requireAdmin, strOrNull } from "@/lib/admin/helpers";

export interface SettingsState {
  ok?: boolean;
  error?: string;
}

export async function saveSettings(
  _prev: SettingsState,
  fd: FormData,
): Promise<SettingsState> {
  await requireAdmin();

  const social = {
    facebook: strOrNull(fd, "facebook") ?? undefined,
    instagram: strOrNull(fd, "instagram") ?? undefined,
    linkedin: strOrNull(fd, "linkedin") ?? undefined,
    youtube: strOrNull(fd, "youtube") ?? undefined,
    twitter: strOrNull(fd, "twitter") ?? undefined,
    tiktok: strOrNull(fd, "tiktok") ?? undefined,
  };

  const values = {
    id: "global",
    metaPixelId: strOrNull(fd, "metaPixelId"),
    gaMeasurementId: strOrNull(fd, "gaMeasurementId"),
    gtmId: strOrNull(fd, "gtmId"),
    contactEmail: strOrNull(fd, "contactEmail"),
    orderEmail: strOrNull(fd, "orderEmail"),
    bankName: strOrNull(fd, "bankName"),
    bankAccountHolder: strOrNull(fd, "bankAccountHolder"),
    bankIban: strOrNull(fd, "bankIban"),
    bankNotes: strOrNull(fd, "bankNotes"),
    contactPhone: strOrNull(fd, "contactPhone"),
    whatsapp: strOrNull(fd, "whatsapp"),
    addressText: strOrNull(fd, "addressText"),
    openingHours: strOrNull(fd, "openingHours"),
    social,
  };

  try {
    const existing = await db.query.settings.findFirst({
      where: eq(settings.id, "global"),
      columns: { id: true },
    });
    if (existing) {
      await db.update(settings).set(values).where(eq(settings.id, "global"));
    } else {
      await db.insert(settings).values(values);
    }
    revalidatePath("/", "layout");
    return { ok: true };
  } catch {
    return { error: "Could not save settings." };
  }
}
