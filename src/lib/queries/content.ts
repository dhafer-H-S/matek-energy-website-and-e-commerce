import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { siteContent } from "@/lib/db/schema";
import { contentDefaults, mergeContent } from "@/lib/content";

export const getSiteMessages = cache(async (locale: "en" | "tr") => {
  const messages = { ...contentDefaults[locale] };
  const rows = await db.select().from(siteContent).where(eq(siteContent.locale, locale));
  for (const row of rows) {
    if (Object.hasOwn(messages, row.section)) {
      messages[row.section] = mergeContent(messages[row.section], row.content);
    }
  }
  return messages;
});
