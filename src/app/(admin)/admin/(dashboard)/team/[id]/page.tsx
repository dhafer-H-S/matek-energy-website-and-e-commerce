import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/ui";
import { TeamForm } from "@/components/admin/forms/TeamForm";
import { getTeamMemberForEdit } from "@/lib/admin/queries";

export default async function EditTeamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getTeamMemberForEdit(id);
  if (!data) notFound();
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Edit Team Member" />
      <TeamForm member={data.member} translations={data.translations} />
    </div>
  );
}
