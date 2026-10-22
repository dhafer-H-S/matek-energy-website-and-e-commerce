import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { PageHeader, Badge, EmptyState } from "@/components/admin/ui";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { listBannersForAdmin } from "@/lib/admin/queries";
import { deleteBanner } from "./actions";

export default async function AdminBannersPage() {
  const items = await listBannersForAdmin();
  return (
    <>
      <PageHeader title="Banners" description="Moving hero banners and promo strips on the home page." action={<Link href="/admin/banners/new" className="inline-flex items-center gap-2 rounded-xs bg-foreground px-5 py-2.5 text-xs font-semibold uppercase tracking-luxe text-background transition-colors hover:bg-gold hover:text-ink"><Plus className="h-4 w-4" /> New Banner</Link>} />
      {items.length === 0 ? (
        <EmptyState title="No banners" description="Create your first one." />
      ) : (
        <div className="overflow-x-auto rounded-md border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-luxe text-muted">
              <tr><th className="px-4 py-3"></th><th className="px-4 py-3">Banner</th><th className="px-4 py-3">Placement</th><th className="px-4 py-3">Order</th><th className="px-4 py-3">Status</th><th className="px-4 py-3" /></tr>
            </thead>
            <tbody>
              {items.map((b) => (
                <tr key={b.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">{b.image ? <img src={b.image} alt="" className="h-14 w-28 rounded-sm object-cover" /> : <div className="h-14 w-28 rounded-sm bg-border" />}</td>
                  <td className="px-4 py-3"><span className="font-medium text-foreground">{b.title ?? "Image banner"}</span><span className="block text-xs text-muted">{b.linkUrl}</span></td>
                  <td className="px-4 py-3"><span className="capitalize">{b.placement}</span></td>
                  <td className="px-4 py-3">{b.sortOrder}</td>
                  <td className="px-4 py-3"><Badge tone={b.active ? "green" : "neutral"}>{b.active ? "Active" : "Off"}</Badge></td>

                  <td className="px-4 py-3"><div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/banners/${b.id}`} className="inline-flex items-center gap-1.5 rounded-xs border border-border px-3 py-2 text-xs text-foreground transition-colors hover:border-gold hover:text-gold"><Pencil className="h-3.5 w-3.5" /> Edit</Link>
                    <DeleteButton action={deleteBanner} id={b.id} iconOnly />
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
