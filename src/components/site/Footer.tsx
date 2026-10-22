import { getTranslations } from "next-intl/server";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Logo } from "./Logo";
import { BRAND_ICONS } from "./BrandIcons";
import { listCategories } from "@/lib/queries/shop";
import { waDigits } from "@/lib/whatsapp";
import type { SiteSettings } from "@/lib/queries/settings";

export async function Footer({
  settings,
  locale,
}: {
  settings: SiteSettings;
  locale: string;
}) {
  const t = await getTranslations({ locale });
  const categories = await listCategories(locale);
  const year = new Date().getFullYear();
  const social = settings.social ?? {};

  const company = [
    { href: "/about", label: t("nav.about") },
    { href: "/services", label: t("nav.services") },
    { href: "/projects", label: t("nav.projects") },
    { href: "/team", label: t("nav.team") },
    { href: "/blog", label: t("nav.blog") },
    { href: "/appointment", label: t("nav.appointment") },
  ];

  return (
    <footer className="bg-navy-deep text-white/80">
      <div className="container-luxe grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo variant="light" imgClassName="h-14 w-auto" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed">{t("footer.about")}</p>
          <div className="mt-5 flex items-center gap-3">
            {Object.entries(BRAND_ICONS).map(([key, Icon]) => {
              const url = social[key as keyof typeof social];
              if (!url) return null;
              return (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={key}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 transition-colors hover:bg-brand"
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="mb-4 font-display text-base font-semibold text-white">{t("footer.shop")}</h3>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/shop" className="hover:text-white">{t("nav.allProducts")}</Link></li>
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/categories/${c.slug}`} className="hover:text-white">{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-display text-base font-semibold text-white">{t("footer.company")}</h3>
          <ul className="space-y-2.5 text-sm">
            {company.map((l) => (
              <li key={l.href}><Link href={l.href} className="hover:text-white">{l.label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-display text-base font-semibold text-white">{t("footer.contact")}</h3>
          <ul className="space-y-3 text-sm">
            {settings.addressText ? (
              <li className="flex gap-2.5"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" /> {settings.addressText}</li>
            ) : null}
            {settings.contactPhone ? (
              <li className="flex gap-2.5"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <a href={`tel:${settings.contactPhone.replace(/\s/g, "")}`} className="hover:text-white">{settings.contactPhone}</a>
              </li>
            ) : null}
            {settings.whatsapp ? (
              <li className="flex gap-2.5"><MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <a href={`https://wa.me/${waDigits(settings.whatsapp)}`} target="_blank" rel="noopener noreferrer" className="hover:text-white">WhatsApp</a>
              </li>
            ) : null}
            {settings.contactEmail ? (
              <li className="flex gap-2.5"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <a href={`mailto:${settings.contactEmail}`} className="hover:text-white">{settings.contactEmail}</a>
              </li>
            ) : null}
            {settings.openingHours ? <li className="pl-6.5 text-white/60">{settings.openingHours}</li> : null}
          </ul>
          <p className="mt-5 text-xs uppercase tracking-wide text-white/50">{t("footer.paymentTitle")}</p>
          <p className="mt-1 text-sm">{t("footer.payments")}</p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-luxe flex flex-col items-center justify-between gap-3 py-5 text-xs text-white/60 sm:flex-row">
          <p>© {year} {t("common.brand")}. {t("footer.rights")}</p>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-white">{t("footer.privacy")}</Link>
            <Link href="/terms" className="hover:text-white">{t("footer.terms")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
