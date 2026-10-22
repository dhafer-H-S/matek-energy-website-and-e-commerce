"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/helpers";
import { deliverEmailNotifications } from "@/lib/email-notifications";

export interface RetryEmailState {
  ok?: boolean;
  error?: string;
}

export async function retryEmail(id: string): Promise<RetryEmailState> {
  await requireAdmin();
  const sent = await deliverEmailNotifications([id]);
  revalidatePath("/admin/emails");
  return sent ? { ok: true } : { error: "Email was not confirmed as sent. Check the delivery status and error details below, then verify GMAIL_USER / GMAIL_APP_PASSWORD." };
}
