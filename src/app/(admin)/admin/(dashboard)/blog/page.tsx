import Link from "next/link";
import { Plus, Pencil, Newspaper } from "lucide-react";
import { PageHeader, Badge, EmptyState } from "@/components/admin/ui";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { listBlogPostsForAdmin } from "@/lib/admin/queries";
import { formatDate } from "@/lib/utils";
import { deleteBlogPost } from "./actions";

export default async function AdminBlogPage() {
  const items = await listBlogPostsForAdmin();
  return (
    <>
      <PageHeader
        title="Insights"
        description="Publish market insights and journal articles."
        action={
          <Link
            href="/admin/blog/new"
            className="inline-flex items-center gap-2 rounded-xs bg-foreground px-5 py-2.5 text-xs font-semibold uppercase tracking-luxe text-background transition-colors hover:bg-gold hover:text-ink"
          >
            <Plus className="h-4 w-4" /> New Insight
          </Link>
        }
      />
      {items.length === 0 ? (
        <EmptyState title="No insights yet" description="Write your first article." />
      ) : (
        <div className="overflow-hidden rounded-md border border-border bg-surface">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-background-alt/50 text-left text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Article</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Category</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((p) => (
                <tr key={p.id} className="hover:bg-background-alt/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xs bg-background-alt text-muted">
                        {p.coverImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.coverImage} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Newspaper className="h-5 w-5" strokeWidth={1.5} />
                        )}
                      </span>
                      <p className="truncate font-medium text-foreground">{p.title ?? "Untitled"}</p>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-muted md:table-cell">{p.category ?? "—"}</td>
                  <td className="hidden px-4 py-3 text-muted sm:table-cell">{formatDate(p.publishedAt) ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge tone={p.published ? "green" : "neutral"}>
                      {p.published ? "Published" : "Draft"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/blog/${p.id}`}
                        className="inline-flex items-center gap-1.5 rounded-xs border border-border px-3 py-2 text-xs text-foreground transition-colors hover:border-gold hover:text-gold"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Link>
                      <DeleteButton action={deleteBlogPost} id={p.id} iconOnly />
                    </div>
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
