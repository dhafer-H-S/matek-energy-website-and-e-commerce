import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { PageHeader, Badge, EmptyState } from "@/components/admin/ui";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { listCategoriesForAdmin } from "@/lib/admin/queries";
import { deleteCategory } from "./actions";

export default async function AdminCategoriesPage() {
  const items = await listCategoriesForAdmin();
  return (
    <>
      <PageHeader title="Categories" description="Categories appear in the navbar dropdown automatically." action={<Link href="/admin/categories/new" className="inline-flex items-center gap-2 rounded-xs bg-foreground px-5 py-2.5 text-xs font-semibold uppercase tracking-luxe text-background transition-colors hover:bg-gold hover:text-ink"><Plus className="h-4 w-4" /> New Category</Link>} />
      {items.length === 0 ? (
        <EmptyState title="No categories" description="Create your first one." />
      ) : (
        <div className="overflow-x-auto rounded-md border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-luxe text-muted">
              <tr><th className="px-4 py-3"></th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Products</th><th className="px-4 py-3">Status</th><th className="px-4 py-3" /></tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">{c.image ? <img src={c.image} alt="" className="h-14 w-14 rounded-sm object-cover" /> : <div className="h-14 w-14 rounded-sm bg-border" />}</td>
                  <td className="px-4 py-3"><span className="font-medium text-foreground">{c.name ?? c.slug}</span><span className="block text-xs text-muted">/{c.slug}</span></td>
                  <td className="px-4 py-3">{c.productCount}</td>
                  <td className="px-4 py-3"><Badge tone={c.published ? "green" : "neutral"}>{c.published ? "Visible" : "Hidden"}</Badge></td>

                  <td className="px-4 py-3"><div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/categories/${c.id}`} className="inline-flex items-center gap-1.5 rounded-xs border border-border px-3 py-2 text-xs text-foreground transition-colors hover:border-gold hover:text-gold"><Pencil className="h-3.5 w-3.5" /> Edit</Link>
                    <DeleteButton action={deleteCategory} id={c.id} iconOnly />
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
