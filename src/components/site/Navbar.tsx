import { listCategories } from "@/lib/queries/shop";
import { listServices } from "@/lib/queries/services";
import { getSettings } from "@/lib/queries/settings";
import { HeaderClient } from "./HeaderClient";

export async function Navbar({ locale }: { locale: string }) {
  const [categories, services, settings] = await Promise.all([
    listCategories(locale),
    listServices(locale),
    getSettings(),
  ]);
  return (
    <HeaderClient
      categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
      services={services.map((s) => ({ slug: s.slug, title: s.title, icon: s.icon, description: s.description, priceFrom: s.priceFrom, currency: s.currency }))}
      phone={settings.contactPhone}
    />
  );
}
