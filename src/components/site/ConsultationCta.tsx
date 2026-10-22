import { ArrowUpRight, MessageCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getSettings } from "@/lib/queries/settings";
import { waLink } from "@/lib/whatsapp";

export async function ConsultationCta({ locale }: { locale: string }) {
  const [t, settings] = await Promise.all([
    getTranslations({ locale, namespace: "editorial" }),
    getSettings(locale),
  ]);
  return (
    <section className="py-14 sm:py-20">
      <div className="container-luxe">
        <div className="relative overflow-hidden rounded-3xl bg-navy px-7 py-10 text-white sm:p-12">
          <div className="pointer-events-none absolute -right-16 -top-24 h-80 w-80 rounded-full border-40 border-white/5" />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div className="max-w-2xl">
              <span className="eyebrow text-white/65">{t("eyebrow")}</span>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl">{t("title")}</h2>
              <p className="mt-4 leading-relaxed text-white/75">{t("text")}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link href="/appointment" className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-navy">
                {t("quote")} <ArrowUpRight className="h-4 w-4" />
              </Link>
              <a href={waLink(settings.whatsapp, t("waMessage"))} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/10">
                <MessageCircle className="h-4 w-4" /> {t("whatsapp")}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
