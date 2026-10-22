import { PageHeader } from "@/components/admin/ui";
import { TeamForm } from "@/components/admin/forms/TeamForm";

export default function NewTeamPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="New Team Member" />
      <TeamForm />
    </div>
  );
}
