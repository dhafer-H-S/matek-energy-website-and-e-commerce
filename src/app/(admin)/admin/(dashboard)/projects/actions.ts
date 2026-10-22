"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { projects, projectTranslations } from "@/lib/db/schema";
import {
  requireAdmin,
  str,
  strOrNull,
  int,
  bool,
  jsonArray,
  uniqueSlug,
  presentLocales,
} from "@/lib/admin/helpers";
import { toSlug } from "@/lib/slug";

export interface ProjectFormState {
  error?: string;
}

export async function saveProject(
  id: string | null,
  _prev: ProjectFormState,
  fd: FormData,
): Promise<ProjectFormState> {
  await requireAdmin();

  const titleEn = str(fd, "title_en");
  if (!titleEn) return { error: "An English title is required." };

  const slug = await uniqueSlug(toSlug(str(fd, "slug") || titleEn), async (s) => {
    const row = await db.query.projects.findFirst({
      where: eq(projects.slug, s),
      columns: { id: true },
    });
    return !!row && row.id !== id;
  });

  const gallery = jsonArray(fd, "gallery");
  const values = {
    slug,
    kind: strOrNull(fd, "kind"),
    image: strOrNull(fd, "image") ?? gallery[0] ?? null,
    gallery,
    published: bool(fd, "published"),
    sortOrder: int(fd, "sortOrder") ?? 0,
  };

  let projectId = id;
  if (id) {
    await db.update(projects).set(values).where(eq(projects.id, id));
  } else {
    const [row] = await db
      .insert(projects)
      .values(values)
      .returning({ id: projects.id });
    projectId = row?.id ?? null;
  }
  if (!projectId) return { error: "Could not save the project." };

  await db
    .delete(projectTranslations)
    .where(eq(projectTranslations.projectId, projectId));
  for (const locale of presentLocales(fd, "title")) {
    await db.insert(projectTranslations).values({
      projectId,
      locale,
      title: str(fd, `title_${locale}`) || titleEn,
      subtitle: strOrNull(fd, `subtitle_${locale}`),
      description: strOrNull(fd, `description_${locale}`),
    });
  }

  revalidatePath("/", "layout");
  redirect("/admin/projects");
}

export async function deleteProject(id: string) {
  await requireAdmin();
  await db.delete(projects).where(eq(projects.id, id));
  revalidatePath("/", "layout");
}
