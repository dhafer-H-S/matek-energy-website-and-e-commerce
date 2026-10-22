import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/ui";
import { listCategoryOptions } from "@/lib/admin/queries";
import { ServiceForm } from "@/components/admin/forms/ServiceForm";
import { getServiceForEdit } from "@/lib/admin/queries";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getServiceForEdit(id);
  if (!data) notFound();
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Edit Service" description={`/${data.service.slug}`} />
      <ServiceForm service={data.service} translations={data.translations} categories={await listCategoryOptions()} />
    </div>
  );
}
