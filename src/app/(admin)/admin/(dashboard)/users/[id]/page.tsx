import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { PageHeader } from "@/components/admin/ui";
import { UserForm } from "@/components/admin/forms/UserForm";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await db.query.users.findFirst({ where: eq(users.id, id) });
  if (!user) notFound();
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Edit User" description={user.email} />
      <UserForm user={user} />
    </div>
  );
}
