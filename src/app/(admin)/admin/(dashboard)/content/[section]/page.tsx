import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/ui";
import { SiteContentForm } from "@/components/admin/forms/SiteContentForm";
import { contentDefaults, contentSections } from "@/lib/content";
import { getSiteMessages } from "@/lib/queries/content";

export default async function ContentSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!Object.hasOwn(contentSections, section)) notFound();
  const item = contentSections[section];
  const [en, tr] = await Promise.all([getSiteMessages("en"), getSiteMessages("tr")]);
  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/admin/content" className="mb-5 inline-flex text-sm font-semibold text-gold">← All website content</Link>
      <PageHeader title={item.label} description={item.description} />
      <SiteContentForm key={section} section={section} initial={{ en: en[section], tr: tr[section] }} defaults={{ en: contentDefaults.en[section], tr: contentDefaults.tr[section] }} />
    </div>
  );
}
