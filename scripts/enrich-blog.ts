import { config } from "dotenv";
import { and, eq } from "drizzle-orm";
import { blogGuideExcerpts, blogGuides } from "./content/blog-guides";

config({ path: ".env.local" });

async function main() {
  const { db } = await import("../src/lib/db");
  const { blogPosts, blogTranslations } = await import("../src/lib/db/schema");
  let updated = 0;
  for (const [slug, translations] of Object.entries(blogGuides)) {
    const post = await db.query.blogPosts.findFirst({
      where: eq(blogPosts.slug, slug),
      with: { translations: true },
    });
    if (!post) continue;
    for (const locale of ["en", "tr"] as const) {
      const row = post.translations.find((translation) => translation.locale === locale);
      if (!row || row.content !== `<p>${blogGuideExcerpts[slug]?.[locale]}</p>`) continue;
      const changed = await db.update(blogTranslations).set({ content: translations[locale] }).where(
        and(eq(blogTranslations.id, row.id), eq(blogTranslations.content, row.content)),
      ).returning({ id: blogTranslations.id });
      updated += changed.length;
    }
  }
  console.log(`Expanded ${updated} untouched demo article translations. Admin-edited content was preserved.`);
}

main().catch((error: unknown) => {
  console.error("Could not expand demo articles:", error);
  process.exitCode = 1;
});
