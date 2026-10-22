import { notFound } from "next/navigation";
import { PageHeader, Badge } from "@/components/admin/ui";
import { OrderStatusSelect, OrderNote } from "@/components/admin/OrderControls";
import { getOrderForAdmin } from "@/lib/admin/queries";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/utils";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const o = await getOrderForAdmin(id);
  if (!o) notFound();
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title={`Order ${o.orderNumber}`} description={formatDate(o.createdAt) ?? undefined} />
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-md border border-border bg-surface p-5 md:col-span-2">
          <h2 className="mb-4 font-display text-lg">Items</h2>
          <ul className="divide-y divide-border">
            {o.items.map((it, i) => (
              <li key={i} className="flex items-center gap-4 py-3">
                {it.image ? <img src={it.image} alt="" className="h-14 w-14 rounded-sm object-cover" /> : null}
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{it.name}</p>
                  <p className="text-xs text-muted">
                    {it.quantity} × {formatMoney(it.unitPrice, it.currency)}
                    {it.sku ? ` · ${it.sku}` : ""}
                  </p>
                </div>
                <p className="text-sm">{formatMoney(it.unitPrice * it.quantity, it.currency)}</p>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-border pt-4 text-right">
            {(["EUR", "TRY"] as const).filter((c) => o.totals[c]).map((c) => (
              <p key={c} className="font-display text-xl">{formatMoney(o.totals[c], c)}</p>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="rounded-md border border-border bg-surface p-5 text-sm">
            <h2 className="mb-3 font-display text-lg">Customer</h2>
            <p className="font-medium text-foreground">{o.customerName}</p>
            <p><a href={`tel:${o.phone}`} className="text-gold">{o.phone}</a></p>
            {o.email ? <p><a href={`mailto:${o.email}`} className="text-gold">{o.email}</a></p> : null}
            <p className="mt-2 text-muted">{[o.address, o.city].filter(Boolean).join(", ")}</p>
            {o.notes ? <p className="mt-2 italic text-muted">“{o.notes}”</p> : null}
          </div>
          <div className="rounded-md border border-border bg-surface p-5 text-sm">
            <h2 className="mb-3 font-display text-lg">Status</h2>
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge tone="neutral">{o.paymentMethod === "bank_transfer" ? "Bank transfer" : "Cash on delivery"}</Badge>
              <Badge tone="gold">{o.channel}</Badge>
            </div>
            <OrderStatusSelect id={o.id} status={o.status} />
          </div>
          <div className="rounded-md border border-border bg-surface p-5">
            <h2 className="mb-3 font-display text-lg">Note</h2>
            <OrderNote id={o.id} note={o.adminNote} />
          </div>
        </div>
      </div>
    </div>
  );
}
