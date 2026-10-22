"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { enquiries, emailNotifications } from "@/lib/db/schema";
import { getSettings } from "@/lib/queries/settings";
import { buildEmailDrafts } from "@/lib/email-templates";
import { deliverEmailNotifications, emailNotificationRows } from "@/lib/email-notifications";

const schema = z.object({
  name: z.string().trim().max(120).optional(),
  firstName: z.string().trim().max(80).optional(),
  lastName: z.string().trim().max(80).optional(),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().max(40).optional(),
  message: z.string().trim().max(2000).optional(),
  sourceType: z
    .enum(["contact", "appointment", "quote", "general"])
    .default("general"),
  sourceId: z.string().max(64).optional(),
  sourceLabel: z.string().max(200).optional(),
  locale: z.string().max(5).default("en"),
  preferredDate: z.string().date().optional().or(z.literal("")),
});

export interface EnquiryState {
  ok?: boolean;
  error?: boolean;
  emailWarning?: boolean;
}

export async function submitEnquiry(
  _prev: EnquiryState,
  formData: FormData,
): Promise<EnquiryState> {
  const raw = Object.fromEntries(formData);
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { error: true };
  }
  const data = parsed.data;
  const fullName =
    data.name?.trim() ||
    [data.firstName, data.lastName].filter(Boolean).join(" ").trim();
  if (!fullName) {
    return { error: true };
  }
  const id = crypto.randomUUID();
  const createdAt = new Date();
  let notificationIds: string[];
  try {
    const settings = await getSettings(data.locale);
    const message = [data.preferredDate ? `${data.locale === "tr" ? "Tercih edilen tarih" : "Preferred date"}: ${data.preferredDate}` : "", data.message].filter(Boolean).join("\n");
    const drafts = buildEmailDrafts({
      id, createdAt, locale: data.locale,
      kind: data.sourceType === "quote" || data.sourceType === "appointment" ? "service" : "contact",
      name: fullName, email: data.email, phone: data.phone || null,
      message: data.message || null, sourceType: data.sourceType,
      sourceLabel: data.sourceLabel || null, preferredDate: data.preferredDate || null,
    }, settings, process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000");
    notificationIds = drafts.map((draft) => draft.id);
    await db.transaction(async (tx) => {
      await tx.insert(enquiries).values({
        id,
        name: fullName,
        email: data.email,
        phone: data.phone || null,
        message: message || null,
        sourceType: data.sourceType,
        sourceId: data.sourceId || null,
        sourceLabel: data.sourceLabel || null,
        locale: data.locale,
        createdAt,
      });
      await tx.insert(emailNotifications).values(emailNotificationRows(drafts));
    });
  } catch (error) {
    console.error("Could not save enquiry and email notifications:", error);
    return { error: true };
  }
  const emailSent = await deliverEmailNotifications(notificationIds);
  return { ok: true, emailWarning: !emailSent };
}
