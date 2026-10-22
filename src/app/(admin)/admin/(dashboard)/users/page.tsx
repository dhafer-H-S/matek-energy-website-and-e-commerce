import Link from "next/link";
import { desc } from "drizzle-orm";
import { Plus, Pencil } from "lucide-react";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { PageHeader, Badge } from "@/components/admin/ui";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { formatDate } from "@/lib/utils";
import { deleteUser } from "./actions";

export default async function AdminUsersPage() {
  const items = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      active: users.active,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt));

  return (
    <>
      <PageHeader
        title="Users"
        description="Manage who can access the admin dashboard."
        action={
          <Link
            href="/admin/users/new"
            className="inline-flex items-center gap-2 rounded-xs bg-foreground px-5 py-2.5 text-xs font-semibold uppercase tracking-luxe text-background transition-colors hover:bg-gold hover:text-ink"
          >
            <Plus className="h-4 w-4" /> New User
          </Link>
        }
      />
      <div className="overflow-hidden rounded-md border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-background-alt/50 text-left text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((u) => (
              <tr key={u.id} className="hover:bg-background-alt/40">
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{u.name}</p>
                  <p className="text-xs text-muted">{u.email}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={u.role === "super_admin" ? "gold" : "neutral"}>
                    {u.role.replace("_", " ")}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={u.active ? "green" : "red"}>
                    {u.active ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/users/${u.id}`}
                      className="inline-flex items-center gap-1.5 rounded-xs border border-border px-3 py-2 text-xs text-foreground transition-colors hover:border-gold hover:text-gold"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Link>
                    <DeleteButton action={deleteUser} id={u.id} iconOnly />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
