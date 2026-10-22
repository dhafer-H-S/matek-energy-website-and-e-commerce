import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Mail, Phone, Wrench } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/site/PageHero";
import { listTeam } from "@/lib/queries/team";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "team" });
  return buildMetadata({ title: t("title"), description: t("subtitle"), path: "/team", locale });
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("team");
  const tc = await getTranslations("common");
  const members = await listTeam(locale);

  return (
    <>
      <PageHero title={t("title")} subtitle={t("subtitle")} />
      <section className="py-16">
        <div className="container-luxe grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {members.length === 0 ? (
            <div className="rounded-3xl border border-border bg-white p-8 text-center sm:col-span-2 sm:p-12 lg:col-span-3">
              <Wrench className="mx-auto h-10 w-10 text-brand" />
              <h2 className="mt-5 font-display text-2xl font-semibold text-navy">{t("contactTitle")}</h2>
              <p className="mx-auto mt-3 max-w-2xl leading-relaxed text-muted">{t("contactText")}</p>
              <Link href="/appointment" className="mt-6 inline-flex rounded-full bg-brand px-7 py-3 text-sm font-semibold text-white hover:bg-navy">{tc("bookAppointment")}</Link>
            </div>
          ) : null}
          {members.map((m) => (
            <div key={m.id} className="overflow-hidden rounded-2xl border border-border bg-white">
              <div className="aspect-4/3 bg-background-alt">
                {m.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.photo} alt={m.name} className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="p-5">
                <h3 className="font-display text-xl text-navy">{m.name}</h3>
                {m.role ? <p className="text-sm font-medium text-brand">{m.role}</p> : null}
                {m.bio ? <p className="mt-3 text-sm text-muted">{m.bio}</p> : null}
                <div className="mt-4 flex gap-3 text-muted">
                  {m.email ? <a href={`mailto:${m.email}`} aria-label="Email"><Mail className="h-4 w-4 hover:text-brand" /></a> : null}
                  {m.phone ? <a href={`tel:${m.phone}`} aria-label="Phone"><Phone className="h-4 w-4 hover:text-brand" /></a> : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
