import { PageHeader } from "@/components/admin/ui";
import { UserForm } from "@/components/admin/forms/UserForm";

export default function NewUserPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="New User" />
      <UserForm />
    </div>
  );
}
