import Link from "next/link";
import { Plus, Pencil, UserRound } from "lucide-react";
import { PageHeader, Badge, EmptyState } from "@/components/admin/ui";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { listTeamForAdmin } from "@/lib/admin/queries";
import { deleteTeamMember } from "./actions";

export default async function AdminTeamPage() {
  const items = await listTeamForAdmin();
  return (
    <>
      <PageHeader
        title="Team"
        description="Manage your team members and consultants."
        action={
          <Link
            href="/admin/team/new"
            className="inline-flex items-center gap-2 rounded-xs bg-foreground px-5 py-2.5 text-xs font-semibold uppercase tracking-luxe text-background transition-colors hover:bg-gold hover:text-ink"
          >
            <Plus className="h-4 w-4" /> New Member
          </Link>
        }
      />
      {items.length === 0 ? (
        <EmptyState title="No team members yet" description="Add your first team member." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((m) => (
            <div key={m.id} className="flex items-center gap-4 rounded-md border border-border bg-surface p-4">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-background-alt text-muted">
                {m.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.photo} alt="" className="h-full w-full object-cover" />
                ) : (
                  <UserRound className="h-7 w-7" strokeWidth={1.5} />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">{m.name ?? "Unnamed"}</p>
                <p className="truncate text-xs text-muted">{m.role ?? "—"}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Link
                    href={`/admin/team/${m.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xs border border-border px-2.5 py-1.5 text-xs text-foreground transition-colors hover:border-gold hover:text-gold"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Link>
                  <DeleteButton action={deleteTeamMember} id={m.id} iconOnly />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
