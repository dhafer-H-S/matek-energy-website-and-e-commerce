import "server-only";
import { and, eq, inArray, lt, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { emailNotifications } from "@/lib/db/schema";
import type { EmailDraft } from "@/lib/email-templates";
import { sendEmailJS, type EmailJSConfig } from "@/lib/emailjs-transport";

export function emailJSConfig(): EmailJSConfig {
  return {
    serviceId: process.env.EMAILJS_SERVICE_ID,
    publicKey: process.env.EMAILJS_PUBLIC_KEY,
    privateKey: process.env.EMAILJS_PRIVATE_KEY,
    adminTemplateId: process.env.EMAILJS_ADMIN_TEMPLATE_ID,
    customerTemplateId: process.env.EMAILJS_CUSTOMER_TEMPLATE_ID,
  };
}

export function emailNotificationRows(drafts: EmailDraft[]) {
  return drafts.map((draft) => ({
    id: draft.id,
    orderId: draft.kind === "order" ? draft.entityId : null,
    enquiryId: draft.kind === "order" ? null : draft.entityId,
    kind: draft.kind,
    audience: draft.audience,
    recipient: draft.recipient,
    params: draft.params,
  }));
}

// EmailJS limits sending to one request/second. Serialize this server instance;
// cross-instance quota rejections remain visible and retryable in admin.
let deliveryQueue: Promise<void> = Promise.resolve();
let nextSendAt = 0;

async function deliver(id: string): Promise<boolean> {
  const [notification] = await db.update(emailNotifications).set({
    status: "sending",
    attempts: sql`${emailNotifications.attempts} + 1`,
    updatedAt: new Date(),
    lastError: null,
  }).where(and(
    eq(emailNotifications.id, id),
    or(
      inArray(emailNotifications.status, ["pending", "failed", "not_configured"]),
      and(eq(emailNotifications.status, "sending"), lt(emailNotifications.updatedAt, new Date(Date.now() - 120000))),
    ),
  )).returning();
  if (!notification) {
    const existing = await db.query.emailNotifications.findFirst({ where: eq(emailNotifications.id, id) });
    return existing?.status === "sent";
  }
  const wait = Math.max(0, nextSendAt - Date.now());
  if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
  const result = await sendEmailJS(emailJSConfig(), notification.audience, notification.params);
  nextSendAt = Date.now() + 1100;
  await db.update(emailNotifications).set({
    status: result.status,
    lastError: result.error,
    sentAt: result.status === "sent" ? new Date() : null,
    updatedAt: new Date(),
  }).where(eq(emailNotifications.id, notification.id));
  if (result.status !== "sent") console.error(`[EmailJS] Notification ${notification.id}: ${result.error}`);
  return result.status === "sent";
}

export async function deliverEmailNotifications(ids: string[]): Promise<boolean> {
  const results: boolean[] = [];
  for (const id of ids) {
    const task = deliveryQueue.then(() => deliver(id));
    deliveryQueue = task.then(() => undefined, (error: unknown) => {
      console.error(`[EmailJS] Delivery state could not be persisted for notification ${id}. Check provider history before retrying.`, error);
    });
    try {
      results.push(await task);
    } catch {
      // The queue logs persistence errors; the saved submission must not be retried by the customer.
      results.push(false);
    }
  }
  return results.every(Boolean);
}
