import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/ui";
import { ProjectForm } from "@/components/admin/forms/ProjectForm";
import { getProjectForEdit } from "@/lib/admin/queries";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getProjectForEdit(id);
  if (!data) notFound();
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Edit Project" />
      <ProjectForm project={data.project} translations={data.translations} />
    </div>
  );
}
