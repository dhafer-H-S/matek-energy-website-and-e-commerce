import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { PageHeader, Badge, EmptyState } from "@/components/admin/ui";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { listProductsForAdmin } from "@/lib/admin/queries";
import { deleteProduct } from "./actions";
import { formatMoney } from "@/lib/money";

export default async function AdminProductsPage() {
  const items = await listProductsForAdmin();
  return (
    <>
      <PageHeader title="Products" description="Items sold in the online shop." action={<Link href="/admin/products/new" className="inline-flex items-center gap-2 rounded-xs bg-foreground px-5 py-2.5 text-xs font-semibold uppercase tracking-luxe text-background transition-colors hover:bg-gold hover:text-ink"><Plus className="h-4 w-4" /> New Product</Link>} />
      {items.length === 0 ? (
        <EmptyState title="No products" description="Create your first one." />
      ) : (
        <div className="overflow-x-auto rounded-md border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-luxe text-muted">
              <tr><th className="px-4 py-3"></th><th className="px-4 py-3">Product</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Stock</th><th className="px-4 py-3">Status</th><th className="px-4 py-3" /></tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">{p.image ? <img src={p.image} alt="" className="h-14 w-14 rounded-sm object-cover" /> : <div className="h-14 w-14 rounded-sm bg-border" />}</td>
                  <td className="px-4 py-3"><span className="font-medium text-foreground">{p.name ?? p.slug}</span><span className="block text-xs text-muted">{p.sku ?? p.slug}</span></td>
                  <td className="px-4 py-3">{p.salePrice ? formatMoney(p.salePrice, p.currency, "en") : formatMoney(p.price, p.currency, "en")}</td>
                  <td className="px-4 py-3"><Badge tone={p.inStock ? "green" : "neutral"}>{p.inStock ? "In stock" : "Out"}</Badge></td>
                  <td className="px-4 py-3"><Badge tone={p.published ? "green" : "neutral"}>{p.published ? "Published" : "Draft"}</Badge></td>

                  <td className="px-4 py-3"><div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/products/${p.id}`} className="inline-flex items-center gap-1.5 rounded-xs border border-border px-3 py-2 text-xs text-foreground transition-colors hover:border-gold hover:text-gold"><Pencil className="h-3.5 w-3.5" /> Edit</Link>
                    <DeleteButton action={deleteProduct} id={p.id} iconOnly />
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
