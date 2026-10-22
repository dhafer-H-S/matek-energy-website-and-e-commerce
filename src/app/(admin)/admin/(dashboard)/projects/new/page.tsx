import { PageHeader } from "@/components/admin/ui";
import { ProjectForm } from "@/components/admin/forms/ProjectForm";

export default async function NewProjectPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="New Project" />
      <ProjectForm />
    </div>
  );
}
