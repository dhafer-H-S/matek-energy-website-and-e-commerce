import { PageHeader } from "@/components/admin/ui";
import { listCategoryOptions } from "@/lib/admin/queries";
import { ServiceForm } from "@/components/admin/forms/ServiceForm";

export default async function NewServicePage() {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="New Service" />
      <ServiceForm categories={await listCategoryOptions()} />
    </div>
  );
}
