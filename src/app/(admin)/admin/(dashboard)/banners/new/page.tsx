import { PageHeader } from "@/components/admin/ui";
import { BannerForm } from "@/components/admin/forms/BannerForm";

export default async function NewBannerPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="New Banner" />
      <BannerForm />
    </div>
  );
}
