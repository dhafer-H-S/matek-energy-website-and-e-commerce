import Link from "next/link";
import { desc, eq, getTableColumns, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { emailNotifications } from "@/lib/db/schema";
import { emailJSConfig } from "@/lib/email-notifications";
import { missingEmailJSConfig } from "@/lib/emailjs-transport";
import { PageHeader, Badge, EmptyState } from "@/components/admin/ui";
import { RetryEmailButton } from "@/components/admin/RetryEmailButton";
import { formatDate } from "@/lib/utils";

export default async function EmailsPage({ searchParams }: { searchParams: Promise<{ submission?: string }> }) {
  const { submission } = await searchParams;
  const config = emailJSConfig();
  const missing = [...new Set([...missingEmailJSConfig(config, "admin"), ...missingEmailJSConfig(config, "customer")])];
  const notifications = await db.select({
    ...getTableColumns(emailNotifications),
    stale: sql<boolean>`${emailNotifications.status} = 'sending' AND ${emailNotifications.updatedAt} < unixepoch() - 120`.mapWith(Boolean),
  }).from(emailNotifications)
    .where(submission ? or(eq(emailNotifications.orderId, submission), eq(emailNotifications.enquiryId, submission)) : undefined)
    .orderBy(desc(emailNotifications.createdAt)).limit(100);
  return (
    <>
      <PageHeader title="Email notifications" description="Automatic order, contact and service-request emails for Matek and the customer. Latest 100 notifications; customer emails follow their chosen EN/TR language." action={<form action="/admin/emails" method="get"><button type="submit" className="text-sm font-semibold text-gold">Refresh / show all</button></form>} />
      <div className={`mb-6 rounded-2xl border p-5 text-sm leading-relaxed ${missing.length ? "border-amber-300 bg-amber-50 text-amber-950" : "border-border bg-surface text-muted"}`}>
        <h2 className="mb-2 font-semibold">{missing.length ? "EmailJS setup is required before live delivery" : "EmailJS configuration is present"}</h2>
        {missing.length ? <p>Missing server environment variables: <strong>{missing.join(", ")}</strong>. Add them locally / on Vercel and restart or redeploy. Saved submissions remain in Orders / Enquiries and their emails can be retried here after setup.</p> : <p>API acceptance is recorded as Sent. It does not guarantee inbox delivery; check EmailJS history and your email provider for bounces or spam filtering.</p>}
        <p className="mt-2">In EmailJS, enable non-browser API requests and configure the two templates described in the project README. Private-key authorization is {config.privateKey ? "configured" : "not configured (set EMAILJS_PRIVATE_KEY if enabled in your EmailJS account)"}.</p>
        <p className="mt-2">All Matek notifications go to the notification email in Settings (default: matek.energy@gmail.com). Customer confirmations require an email address. Provider rate limits and quota failures are shown below, never silently ignored.</p>
      </div>
      {notifications.length === 0 ? <EmptyState title="No email notifications yet" description="New saved orders, contact enquiries and service requests create notification records automatically." /> : (
        <div className="space-y-4">
          {notifications.map((notification) => {
            const stale = notification.stale;
            const retryable = ["pending", "failed", "not_configured"].includes(notification.status) || stale;
            return (
              <article key={notification.id} className="rounded-2xl border border-border bg-surface p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap gap-2">
                      <Badge tone={notification.status === "sent" ? "green" : notification.status === "failed" ? "red" : "gold"}>{notification.status.replaceAll("_", " ")}</Badge>
                      <Badge>{notification.kind}</Badge><Badge>{notification.audience === "admin" ? "Matek notification" : "Customer confirmation"}</Badge>
                    </div>
                    <h2 className="break-words font-semibold">{String(notification.params.email_subject)}</h2>
                    <p className="mt-1 break-all text-sm text-muted">To: {notification.recipient}</p>
                    <p className="mt-2 text-xs text-muted">{formatDate(notification.createdAt)} · Attempts: {notification.attempts}{notification.sentAt ? ` · Accepted: ${formatDate(notification.sentAt)}` : ""}</p>
                  </div>
                  {retryable ? <RetryEmailButton id={notification.id} /> : null}
                </div>
                {notification.lastError ? <p className="mt-3 rounded-xl bg-background p-3 text-sm text-red-700">{notification.lastError}</p> : null}
                {stale ? <p className="mt-3 text-sm text-amber-800">This attempt was interrupted. Delivery is uncertain. Check EmailJS history before retrying to avoid duplicate emails.</p> : null}
                <Link href={notification.orderId ? `/admin/orders/${notification.orderId}` : "/admin/enquiries"} className="mt-3 inline-block text-sm font-semibold text-gold">Open saved {notification.orderId ? "order" : "enquiry"}</Link>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
