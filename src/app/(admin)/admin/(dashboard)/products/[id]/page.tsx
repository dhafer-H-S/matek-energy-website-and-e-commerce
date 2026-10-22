import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/forms/ProductForm";
import { getProductForEdit, listCategoryOptions } from "@/lib/admin/queries";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getProductForEdit(id);
  if (!data) notFound();
  const categories = await listCategoryOptions();
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Edit Product" />
      <ProductForm product={data.product} translations={data.translations} categories={categories} />
    </div>
  );
}
