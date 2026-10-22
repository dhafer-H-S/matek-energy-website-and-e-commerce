import { desc } from "drizzle-orm";
import { Mail, Phone } from "lucide-react";
import { db } from "@/lib/db";
import { enquiries } from "@/lib/db/schema";
import { PageHeader, Badge, EmptyState } from "@/components/admin/ui";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { EnquiryStatusSelect } from "@/components/admin/EnquiryStatusSelect";
import { formatDate } from "@/lib/utils";
import { deleteEnquiry } from "./actions";
import Link from "next/link";

const SOURCE_LABELS: Record<string, string> = {
  quote: "Service / quote request",
  appointment: "Appointment request",
  contact: "Contact form",
  general: "General",
};

export default async function AdminEnquiriesPage() {
  const items = await db
    .select()
    .from(enquiries)
    .orderBy(desc(enquiries.createdAt))
    .limit(200);

  return (
    <>
      <PageHeader
        title="Enquiries"
        description="Leads submitted through the website's call-to-action forms."
      />
      {items.length === 0 ? (
        <EmptyState
          title="No enquiries yet"
          description="Leads from the site's forms will appear here."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((e) => (
            <div
              key={e.id}
              className="rounded-md border border-border bg-surface p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground">{e.name}</h3>
                    <Badge tone="neutral">
                      {SOURCE_LABELS[e.sourceType] ?? e.sourceType}
                    </Badge>
                    <Badge tone="gold">{e.locale.toUpperCase()}</Badge>
                  </div>
                  {e.sourceLabel ? (
                    <p className="mt-0.5 text-xs text-muted">
                      Re: {e.sourceLabel}
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <EnquiryStatusSelect id={e.id} status={e.status} />
                  <DeleteButton action={deleteEnquiry} id={e.id} iconOnly />
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-sm">
                <a
                  href={`mailto:${e.email}`}
                  className="inline-flex items-center gap-1.5 text-foreground/80 hover:text-gold"
                >
                  <Mail className="h-4 w-4" strokeWidth={1.5} /> {e.email}
                </a>
                {e.phone ? (
                  <a
                    href={`tel:${e.phone}`}
                    className="inline-flex items-center gap-1.5 text-foreground/80 hover:text-gold"
                  >
                    <Phone className="h-4 w-4" strokeWidth={1.5} /> {e.phone}
                  </a>
                ) : null}
                <span className="text-muted">{formatDate(e.createdAt)}</span>
              </div>

              {e.message ? (
                <p className="mt-3 border-t border-border pt-3 text-sm leading-relaxed text-foreground/80">
                  {e.message}
                </p>
              ) : null}
              <Link href={`/admin/emails?submission=${e.id}`} className="mt-3 inline-block text-sm font-semibold text-gold">View email delivery</Link>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
