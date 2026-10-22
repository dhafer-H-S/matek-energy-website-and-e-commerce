"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { enquiries } from "@/lib/db/schema";

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
});

export interface EnquiryState {
  ok?: boolean;
  error?: boolean;
}

export async function submitEnquiry(
  _prev: EnquiryState,
  formData: FormData,
): Promise<EnquiryState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;
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
  try {
    await db.insert(enquiries).values({
      name: fullName,
      email: data.email,
      phone: data.phone || null,
      message: data.message || null,
      sourceType: data.sourceType,
      sourceId: data.sourceId || null,
      sourceLabel: data.sourceLabel || null,
      locale: data.locale,
    });
    return { ok: true };
  } catch {
    return { error: true };
  }
}
