import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/admin/ui";
import { contentSections } from "@/lib/content";

export default function ContentPage() {
  return (
    <>
      <PageHeader title="Website content" description="Edit and save website text and page images in English and Turkish. Changes are stored in your Matek database and appear on the live site." />
      <div className="mb-6 rounded-2xl border border-border bg-surface p-6 text-sm leading-relaxed text-muted">
        Use these editors for page introductions, company information, FAQs, lists, button labels, legal policies and shared images. Products, services, categories, projects, articles and banners have their own editors in the menu. Contact and bank details are under Settings.
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Object.entries(contentSections).map(([section, item]) => (
          <Link key={section} href={`/admin/content/${section}`} className="group rounded-2xl border border-border bg-surface p-6 hover:border-gold">
            <h2 className="flex justify-between gap-3 font-display text-lg text-foreground">{item.label}<ArrowUpRight className="h-5 w-5 shrink-0 text-gold" /></h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{item.description}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
