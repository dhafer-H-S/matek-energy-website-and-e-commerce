import { PageHeader } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/forms/SettingsForm";
import { getSettings } from "@/lib/queries/settings";

export default async function AdminSettingsPage() {
  const settings = await getSettings();
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Settings"
        description="Site-wide configuration, tracking pixels, contact details and social links."
      />
      <SettingsForm settings={settings} />
    </div>
  );
}
