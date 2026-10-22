"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { teamMembers, teamTranslations } from "@/lib/db/schema";
import {
  requireAdmin,
  str,
  strOrNull,
  int,
  bool,
  LOCALES,
} from "@/lib/admin/helpers";

export interface TeamFormState {
  error?: string;
}

export async function saveTeamMember(
  id: string | null,
  _prev: TeamFormState,
  fd: FormData,
): Promise<TeamFormState> {
  await requireAdmin();

  const nameEn = str(fd, "name_en");
  if (!nameEn) return { error: "An English name is required." };

  const values = {
    photo: strOrNull(fd, "photo"),
    email: strOrNull(fd, "email"),
    phone: strOrNull(fd, "phone"),
    linkedin: strOrNull(fd, "linkedin"),
    published: bool(fd, "published"),
    sortOrder: int(fd, "sortOrder") ?? 0,
  };

  let memberId = id;
  if (id) {
    await db.update(teamMembers).set(values).where(eq(teamMembers.id, id));
  } else {
    const [row] = await db
      .insert(teamMembers)
      .values(values)
      .returning({ id: teamMembers.id });
    memberId = row?.id ?? null;
  }
  if (!memberId) return { error: "Could not save the team member." };

  for (const locale of LOCALES) {
    const name = str(fd, `name_${locale}`);
    const present = locale === "en" || name.length > 0;
    const existing = await db.query.teamTranslations.findFirst({
      where: and(
        eq(teamTranslations.memberId, memberId),
        eq(teamTranslations.locale, locale),
      ),
      columns: { id: true },
    });
    if (!present) {
      if (existing) {
        await db
          .delete(teamTranslations)
          .where(eq(teamTranslations.id, existing.id));
      }
      continue;
    }
    const tr = {
      name: name || nameEn,
      role: strOrNull(fd, `role_${locale}`),
      bio: strOrNull(fd, `bio_${locale}`),
    };
    if (existing) {
      await db
        .update(teamTranslations)
        .set(tr)
        .where(eq(teamTranslations.id, existing.id));
    } else {
      await db.insert(teamTranslations).values({ memberId, locale, ...tr });
    }
  }

  revalidatePath("/admin/team");
  revalidatePath("/", "layout");
  redirect("/admin/team");
}

export async function deleteTeamMember(id: string) {
  await requireAdmin();
  await db.delete(teamMembers).where(eq(teamMembers.id, id));
  revalidatePath("/admin/team");
  revalidatePath("/", "layout");
}
