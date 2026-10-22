import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { ProductBuy } from "@/components/shop/ProductBuy";
import { ProductCard } from "@/components/shop/ProductCard";
import { Price } from "@/components/shop/Price";
import { PlainProse } from "@/components/ui/RichText";
import { getProductBySlug, listProducts } from "@/lib/queries/shop";
import { getSettings } from "@/lib/queries/settings";
import { waLink } from "@/lib/whatsapp";
import { discountPercent, effectivePrice, formatMoney } from "@/lib/money";
import { BadgeCheck, Banknote, Phone, ShieldCheck, Truck, Wrench, PackageCheck, MessageCircle, ClipboardCheck } from "lucide-react";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const p = await getProductBySlug(slug, locale);
  if (!p) return {};
  return buildMetadata({ title: p.seoTitle || p.name, description: p.seoDescription || p.shortDescription, path: `/products/${slug}`, locale, image: p.image });
}

export default async function ProductPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const p = await getProductBySlug(slug, locale);
  if (!p) notFound();
  const t = await getTranslations("shop");
  const media = await getTranslations("media");
  const s = await getSettings();
  const related = await listProducts(locale, { categorySlug: p.categorySlug ?? undefined, excludeId: p.id, limit: 4 });
  const images = [...new Set([p.image, ...p.gallery].filter(Boolean) as string[])];

  const discount = discountPercent({ price: p.price, salePrice: p.salePrice });
  const saved = discount ? p.price - effectivePrice(p) : 0;
  const wa = waLink(s.whatsapp, `${p.name} (${t("sku")}: ${p.sku ?? "-"})`);
  const trust = [
    { Icon: ShieldCheck, label: t("trustWarranty") },
    { Icon: Wrench, label: t("trustInstall") },
    { Icon: Truck, label: t("trustDelivery") },
    { Icon: Banknote, label: t("trustPay") },
  ];
  const badges = (
    <>
      {discount ? <span className="rounded-full bg-danger px-3 py-1 text-xs font-bold text-white shadow">-{discount}%</span> : null}
      {p.isNew ? <span className="rounded-full bg-brand px-3 py-1 text-xs font-bold text-white shadow">{t("new")}</span> : null}
    </>
  );

  return (
    <>
      <section className="container-luxe pb-24 pt-8 lg:pb-12">
        <nav className="mb-6 text-sm text-muted">
          <Link href="/shop" className="hover:text-brand">{t("title")}</Link>
          {p.categorySlug ? <> / <Link href={`/categories/${p.categorySlug}`} className="hover:text-brand">{p.categoryName}</Link></> : null}
          {" / "}<span className="text-navy">{p.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          <ProductGallery images={images} alt={p.name} badges={badges} />

          <div>
            <div className="flex flex-wrap items-center gap-2">
              {p.brand ? <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand">{p.brand}</span> : null}
              {p.categoryName ? <span className="text-xs text-muted">{p.categoryName}</span> : null}
            </div>
            <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-navy sm:text-4xl">{p.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted">
              {p.sku ? <span>{t("sku")}: <span className="font-medium text-navy">{p.sku}</span></span> : null}
              <span className={`inline-flex items-center gap-1 font-medium ${p.inStock ? "text-brand" : "text-danger"}`}>
                {p.inStock ? <BadgeCheck className="h-4 w-4" /> : null}{p.inStock ? t("inStock") : t("outOfStock")}
              </span>
            </div>

            {p.shortDescription ? <p className="mt-5 text-base leading-relaxed text-muted">{p.shortDescription}</p> : null}

            <div className="mt-6 rounded-2xl border border-border bg-white p-5 shadow-sm">
              {p.quoteOnly ? (
                <p className="font-display text-2xl text-navy">{t("quoteOnly")}</p>
              ) : (
                <div className="flex flex-wrap items-end gap-4">
                  <Price price={p.price} salePrice={p.salePrice} currency={p.currency} locale={locale} size="lg" />
                  {discount ? (
                    <span className="mb-1 rounded-full bg-danger/10 px-3 py-1 text-sm font-semibold text-danger">
                      {t("youSave")} {formatMoney(saved, p.currency, locale)} ({discount}%)
                    </span>
                  ) : null}
                </div>
              )}
              <div className="mt-5">
                {p.quoteOnly ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Link href={`/contact?subject=${encodeURIComponent(p.name)}`} className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-4 text-base font-semibold text-white shadow-lg shadow-brand/25 hover:bg-navy">{t("requestQuote")}</Link>
                    <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-4 text-base font-semibold text-white hover:brightness-95"><MessageCircle className="h-5 w-5" />{t("askExpert")}</a>
                  </div>
                ) : p.inStock ? (
                  <ProductBuy product={p} locale={locale} whatsappHref={wa} />
                ) : (
                  <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-full bg-[#25D366] px-6 py-4 text-base font-semibold text-white">{t("askExpert")}</a>
                )}
              </div>
            </div>

            <ul className="mt-5 grid grid-cols-2 gap-3">
              {trust.map(({ Icon, label }) => (
                <li key={label} className="flex items-center gap-3 rounded-xl bg-background-alt px-4 py-3 text-sm font-medium text-navy">
                  <Icon className="h-5 w-5 shrink-0 text-brand" /> {label}
                </li>
              ))}
            </ul>

            {p.specs.length > 0 ? (
              <div className="mt-6">
                <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-navy">{t("highlights")}</h2>
                <div className="flex flex-wrap gap-2">
                  {p.specs.slice(0, 4).map((sp) => (
                    <span key={sp.label} className="rounded-full border border-border px-4 py-2 text-sm text-navy"><span className="text-muted">{sp.label}:</span> <b>{sp.value}</b></span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="container-luxe pb-12">
        <div className="relative overflow-hidden rounded-3xl bg-navy-deep text-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={media("productInstallation")} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-deep via-navy-deep/85 to-transparent" />
          <div className="relative grid gap-6 p-8 sm:p-12 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div>
              <h2 className="font-display text-2xl font-semibold sm:text-3xl">{t("installTitle")}</h2>
              <p className="mt-3 max-w-xl text-white/80">{t("installText")}</p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link href={`/appointment?service=${encodeURIComponent(p.name)}`} className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-navy hover:bg-brand hover:text-white"><ClipboardCheck className="h-4 w-4" />{t("installCta")}</Link>
              <a href={`tel:${(s.contactPhone ?? "").replace(/\s+/g, "")}`} className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3.5 text-sm font-semibold hover:bg-white/10"><Phone className="h-4 w-4" />{t("callUs")}</a>
            </div>
          </div>
        </div>
      </section>

      <section className="container-luxe grid gap-10 pb-14 lg:grid-cols-2">
        {p.description ? (
          <div>
            <h2 className="mb-4 font-display text-2xl text-navy">{t("description")}</h2>
            <PlainProse text={p.description} className="leading-relaxed text-muted" />
          </div>
        ) : null}
        {p.specs.length > 0 ? (
          <div>
            <h2 className="mb-4 font-display text-2xl text-navy">{t("specifications")}</h2>
            <div className="overflow-hidden rounded-2xl border border-border">
              <table className="w-full text-sm">
                <tbody>
                  {p.specs.map((sp, idx) => (
                    <tr key={sp.label} className={idx % 2 ? "bg-white" : "bg-background-alt/60"}>
                      <th className="w-1/2 px-4 py-3 text-start font-medium text-navy">{sp.label}</th>
                      <td className="px-4 py-3 text-muted">{sp.value}</td>
                    </tr>
                  ))}
                  {p.sku ? (
                    <tr className="bg-white"><th className="px-4 py-3 text-start font-medium text-navy">{t("sku")}</th><td className="px-4 py-3 text-muted">{p.sku}</td></tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </section>

      <section className="bg-background-alt py-14">
        <div className="container-luxe">
          <h2 className="mb-8 text-center font-display text-3xl text-navy">{t("whyTitle")}</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { Icon: ShieldCheck, title: t("why1Title"), text: t("why1Text") },
              { Icon: Wrench, title: t("why2Title"), text: t("why2Text") },
              { Icon: PackageCheck, title: t("why3Title"), text: t("why3Text") },
            ].map(({ Icon, title, text }) => (
              <div key={title} className="rounded-2xl bg-white p-6 shadow-sm">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand"><Icon className="h-6 w-6" /></span>
                <h3 className="mt-4 text-lg font-semibold text-navy">{title}</h3>
                <p className="mt-1 text-sm text-muted">{text}</p>
              </div>
            ))}
          </div>
          <h3 className="mb-5 mt-12 text-center font-display text-2xl text-navy">{t("howTitle")}</h3>
          <ol className="grid gap-4 md:grid-cols-3">
            {[t("how1"), t("how2"), t("how3")].map((step, idx) => (
              <li key={step} className="flex items-center gap-4 rounded-2xl border border-border bg-white p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy font-display text-lg text-white">{idx + 1}</span>
                <span className="text-sm font-medium text-navy">{step}</span>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-center text-sm text-muted">{t("freeShippingNote")}</p>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="py-14">
          <div className="container-luxe">
            <h2 className="mb-6 font-display text-2xl text-navy">{t("related")}</h2>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {related.map((r) => <ProductCard key={r.id} product={r} locale={locale} />)}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
