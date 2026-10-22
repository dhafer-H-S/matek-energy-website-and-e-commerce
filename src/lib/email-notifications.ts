import "server-only";
import { and, eq, inArray, lt, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { emailNotifications } from "@/lib/db/schema";
import type { EmailMessage } from "@/lib/email-templates";
import { mailConfig, missingMailConfig, sendMail, type MailMessage } from "@/lib/mailer";

export { mailConfig, missingMailConfig };

export function emailNotificationRows(messages: EmailMessage[]) {
  return messages.map((message) => ({
    id: message.id,
    orderId: message.kind === "order" ? message.entityId : null,
    enquiryId: message.kind === "order" ? null : message.entityId,
    kind: message.kind,
    audience: message.audience,
    recipient: message.recipient,
    params: {
      to: message.recipient,
      replyTo: message.replyTo,
      subject: message.subject,
      html: message.html,
      text: message.text,
    },
  }));
}

function toMailMessage(params: Record<string, unknown>): MailMessage | null {
  const { to, replyTo, subject, html, text } = params;
  if (typeof to !== "string" || typeof subject !== "string" || typeof html !== "string" || typeof text !== "string") return null;
  return { to, replyTo: typeof replyTo === "string" ? replyTo : undefined, subject, html, text };
}

// Serialize sends per server instance so a single order's two emails go out in order.
let deliveryQueue: Promise<void> = Promise.resolve();

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
  const message = toMailMessage(notification.params);
  const result = message
    ? await sendMail(mailConfig(), message)
    : { status: "failed" as const, error: "Stored email content is invalid. Recreate it from the order/enquiry if needed." };
  await db.update(emailNotifications).set({
    status: result.status,
    lastError: result.error,
    sentAt: result.status === "sent" ? new Date() : null,
    updatedAt: new Date(),
  }).where(eq(emailNotifications.id, notification.id));
  if (result.status !== "sent") console.error(`[Mailer] Notification ${notification.id}: ${result.error}`);
  return result.status === "sent";
}

export async function deliverEmailNotifications(ids: string[]): Promise<boolean> {
  const results: boolean[] = [];
  for (const id of ids) {
    const task = deliveryQueue.then(() => deliver(id));
    deliveryQueue = task.then(() => undefined, (error: unknown) => {
      console.error(`[Mailer] Delivery state could not be persisted for notification ${id}.`, error);
    });
    try {
      results.push(await task);
    } catch {
      results.push(false);
    }
  }
  return results.every(Boolean);
}
