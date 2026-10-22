import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/site/PageHero";
import { listProjects } from "@/lib/queries/shop";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "projects" });
  return buildMetadata({ title: t("title"), description: t("subtitle"), path: "/projects", locale });
}

export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("projects");
  const items = await listProjects(locale);
  return (
    <>
      <PageHero title={t("title")} subtitle={t("subtitle")} />
      <section className="py-16">
        <div className="container-luxe grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <Link key={p.id} href={`/projects/${p.slug}`} className="group relative aspect-4/3 overflow-hidden rounded-2xl bg-navy">
              {p.image ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={p.image} alt={p.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /> : null}
              <div className="absolute inset-0 bg-linear-to-t from-navy-deep/90 via-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                {p.kind ? <span className="text-xs font-semibold uppercase tracking-wide text-white/70">{p.kind}</span> : null}
                <h2 className="font-display text-lg">{p.title}</h2>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
