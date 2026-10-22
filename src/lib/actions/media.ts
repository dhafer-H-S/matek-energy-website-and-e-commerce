"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";

export interface AddMediaInput {
  url: string;
  alt?: string;
  type?: "image" | "video";
  source?: "upload" | "pexels" | "external";
  width?: number;
  height?: number;
  pexelsId?: string;
  photographer?: string;
}

export async function addMediaFromUrl(input: AddMediaInput) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  if (!input.url) return null;

  // De-dupe by URL so the library stays clean.
  const existing = await db.query.media.findFirst({
    where: eq(media.url, input.url),
  });
  if (existing) return existing;

  const [row] = await db
    .insert(media)
    .values({
      url: input.url,
      alt: input.alt ?? null,
      type: input.type ?? "image",
      source: input.source ?? "external",
      width: input.width ?? null,
      height: input.height ?? null,
      pexelsId: input.pexelsId ?? null,
      photographer: input.photographer ?? null,
    })
    .returning();
  revalidatePath("/admin/media");
  return row;
}

export async function deleteMedia(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  await db.delete(media).where(eq(media.id, id));
  revalidatePath("/admin/media");
}

export async function updateMediaAlt(id: string, alt: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  await db.update(media).set({ alt }).where(and(eq(media.id, id)));
  revalidatePath("/admin/media");
}
