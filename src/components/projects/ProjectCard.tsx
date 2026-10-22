import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { ProjectView } from "@/lib/queries/shop";

export async function ProjectCard({ project, locale }: { project: ProjectView; locale: string }) {
  const t = await getTranslations({ locale, namespace: "projects" });
  const typeLabels = t.raw("types") as Record<string, string>;
  return (
    <Link href={`/projects/${project.slug}`} className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-white transition-shadow hover:shadow-lift">
      <div className="relative aspect-4/3 overflow-hidden bg-navy">
        {project.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={project.image} alt={project.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : null}
        <span className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-navy transition-colors group-hover:bg-brand group-hover:text-white"><ArrowUpRight className="h-5 w-5" /></span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        {project.kind ? <span className="eyebrow text-brand">{typeLabels[project.kind] || project.kind}</span> : null}
        {project.subtitle && project.subtitle !== project.kind && project.subtitle !== typeLabels[project.kind ?? ""] ? <p className="mt-2 text-sm text-muted">{project.subtitle}</p> : null}
        <h2 className="mt-2 font-display text-xl text-navy">{project.title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">{t("cardText")}</p>
        <span className="mt-5 text-sm font-semibold text-brand">{t("viewProject")} →</span>
      </div>
    </Link>
  );
}
