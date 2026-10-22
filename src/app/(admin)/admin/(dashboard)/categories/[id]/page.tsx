import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/ui";
import { CategoryForm } from "@/components/admin/forms/CategoryForm";
import { getCategoryForEdit } from "@/lib/admin/queries";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getCategoryForEdit(id);
  if (!data) notFound();
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Edit Category" />
      <CategoryForm category={data.category} translations={data.translations} />
    </div>
  );
}
