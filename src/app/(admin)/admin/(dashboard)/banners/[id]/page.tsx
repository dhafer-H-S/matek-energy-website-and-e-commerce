import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/ui";
import { BannerForm } from "@/components/admin/forms/BannerForm";
import { getBannerForEdit } from "@/lib/admin/queries";

export default async function EditBannerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getBannerForEdit(id);
  if (!data) notFound();
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Edit Banner" />
      <BannerForm banner={data.banner} translations={data.translations} />
    </div>
  );
}
