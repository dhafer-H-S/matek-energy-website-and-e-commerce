import { PageHeader } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/forms/ProductForm";
import { listCategoryOptions } from "@/lib/admin/queries";

export default async function NewProductPage() {
  const categories = await listCategoryOptions();
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="New Product" />
      <ProductForm categories={categories} />
    </div>
  );
}
