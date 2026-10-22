import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { settings, type Settings } from "@/lib/db/schema";

export type SiteSettings = Settings;

const DEFAULT_SETTINGS: SiteSettings = {
  id: "global",
  metaPixelId: null,
  gaMeasurementId: null,
  gtmId: null,
  contactEmail: "matek@matek-energy.com",
  orderEmail: "matek.energy@gmail.com",
  contactPhone: "+90 542 887 70 70",
  whatsapp: "+90 533 869 79 73",
  addressText: "Semih Sencar Cad. No.65 Centro Kyrenia Apt. Dük 7, Kyrenia – TRNC",
  addressTextTr: null,
  openingHours: "Mon – Fri 8:00 – 18:00 · Sunday 8:00 – 14:00",
  openingHoursTr: null,
  bankName: null,
  bankAccountHolder: null,
  bankIban: null,
  bankNotes: null,
  bankNotesTr: null,
  social: {},
  updatedAt: new Date(),
};

/**
 * Read the singleton settings row. Cached per request. Returns sensible
 * defaults if the row has not been created yet so the site never crashes.
 */
export const getSettings = cache(async function getSettings(locale = "en"): Promise<SiteSettings> {
  try {
    const row = await db.query.settings.findFirst({
      where: eq(settings.id, "global"),
    });
    const value = row ?? DEFAULT_SETTINGS;
    if (locale !== "tr") return value;
    return {
      ...value,
      addressText: value.addressTextTr ?? value.addressText,
      openingHours: value.openingHoursTr ?? value.openingHours,
      bankNotes: value.bankNotesTr ?? value.bankNotes,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
});
