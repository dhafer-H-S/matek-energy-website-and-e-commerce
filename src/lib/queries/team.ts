import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { teamMembers, teamTranslations } from "@/lib/db/schema";
import { pickTranslation } from "@/lib/db/translations";

export interface TeamMemberView {
  id: string;
  photo: string | null;
  email: string | null;
  phone: string | null;
  linkedin: string | null;
  name: string;
  role: string | null;
  bio: string | null;
}

type TeamRow = typeof teamMembers.$inferSelect & {
  translations: (typeof teamTranslations.$inferSelect)[];
};

export async function listTeam(locale: string): Promise<TeamMemberView[]> {
  const rows = await db.query.teamMembers.findMany({
    where: eq(teamMembers.published, true),
    with: { translations: true },
    orderBy: [asc(teamMembers.sortOrder)],
  });
  return rows.map((row) => {
    const r = row as TeamRow;
    const t = pickTranslation(r.translations, locale);
    return {
      id: r.id,
      photo: r.photo,
      email: r.email,
      phone: r.phone,
      linkedin: r.linkedin,
      name: t?.name ?? "",
      role: t?.role ?? null,
      bio: t?.bio ?? null,
    };
  });
}
