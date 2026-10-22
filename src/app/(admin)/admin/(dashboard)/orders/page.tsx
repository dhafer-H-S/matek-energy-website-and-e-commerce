import Link from "next/link";
import { PageHeader, Badge, EmptyState } from "@/components/admin/ui";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { OrderStatusSelect } from "@/components/admin/OrderControls";
import { listOrdersForAdmin } from "@/lib/admin/queries";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import { deleteOrder } from "./actions";

export default async function AdminOrdersPage() {
  const items = await listOrdersForAdmin();
  return (
    <>
      <PageHeader title="Orders" description="Orders placed through the website and WhatsApp." />
      {items.length === 0 ? (
        <EmptyState title="No orders yet" description="New orders will appear here." />
      ) : (
        <div className="overflow-x-auto rounded-md border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-luxe text-muted">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {items.map((o) => (
                <tr key={o.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${o.id}`} className="font-medium text-foreground hover:text-gold">
                      {o.orderNumber}
                    </Link>
                    <span className="block text-xs text-muted">{formatDate(o.createdAt)}</span>
                  </td>
                  <td className="px-4 py-3">
                    {o.customerName}
                    <span className="block text-xs text-muted">{o.phone}</span>
                  </td>
                  <td className="px-4 py-3">
                    {(["EUR", "TRY"] as const)
                      .filter((c) => o.totals[c])
                      .map((c) => (
                        <div key={c}>{formatMoney(o.totals[c], c)}</div>
                      ))}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone="neutral">{o.paymentMethod === "bank_transfer" ? "Bank transfer" : "Cash on delivery"}</Badge>
                    {o.channel === "whatsapp" ? <Badge tone="green"> WhatsApp</Badge> : null}
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusSelect id={o.id} status={o.status} />
                  </td>
                  <td className="px-4 py-3">
                    <DeleteButton action={deleteOrder} id={o.id} iconOnly />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
