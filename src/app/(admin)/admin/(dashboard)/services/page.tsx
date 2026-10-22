import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { PageHeader, Badge, EmptyState } from "@/components/admin/ui";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { ServiceIcon } from "@/components/icons/ServiceIcon";
import { listServicesForAdmin } from "@/lib/admin/queries";
import { deleteService } from "./actions";
import { formatMoney } from "@/lib/money";

export default async function AdminServicesPage() {
  const items = await listServicesForAdmin();
  return (
    <>
      <PageHeader
        title="Services"
        description="Create and edit service pages, photos, translations and optional EUR / TRY starting prices."
        action={
          <Link
            href="/admin/services/new"
            className="inline-flex items-center gap-2 rounded-xs bg-foreground px-5 py-2.5 text-xs font-semibold uppercase tracking-luxe text-background transition-colors hover:bg-gold hover:text-ink"
          >
            <Plus className="h-4 w-4" /> New Service
          </Link>
        }
      />
      {items.length === 0 ? (
        <EmptyState title="No services yet" description="Add your first service." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((s) => (
            <div key={s.id} className="flex flex-col rounded-md border border-border bg-surface p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold/15 text-gold">
                  <ServiceIcon name={s.icon} className="h-5 w-5" />
                </span>
                <Badge tone={s.published ? "green" : "neutral"}>
                  {s.published ? "Published" : "Draft"}
                </Badge>
              </div>
              <p className="font-display text-lg text-foreground">{s.title ?? "Untitled"}</p>
              <p className="mt-1 text-xs text-muted">/{s.slug}</p>
              <p className="mt-3 text-sm font-semibold text-brand">{s.priceFrom !== null ? `From ${formatMoney(s.priceFrom, s.currency, "en")}` : "Free quote · No starting price"}</p>
              {s.published ? <Link href={`/en/services/${s.slug}`} className="mt-2 text-xs text-brand underline">View service page</Link> : null}
              <div className="mt-4 flex items-center gap-2">
                <Link
                  href={`/admin/services/${s.id}`}
                  className="inline-flex items-center gap-1.5 rounded-xs border border-border px-3 py-2 text-xs text-foreground transition-colors hover:border-gold hover:text-gold"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Link>
                <DeleteButton action={deleteService} id={s.id} iconOnly />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
