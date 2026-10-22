import { PageHeader } from "@/components/admin/ui";
import { CategoryForm } from "@/components/admin/forms/CategoryForm";

export default async function NewCategoryPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="New Category" />
      <CategoryForm />
    </div>
  );
}
