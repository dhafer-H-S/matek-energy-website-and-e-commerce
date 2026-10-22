"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Phone, Search, ShoppingCart, Menu, X, ChevronDown, Clock } from "lucide-react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useCart } from "@/components/shop/CartProvider";
import { cn } from "@/lib/utils";
import { ServiceIcon } from "@/components/icons/ServiceIcon";
import { formatMoney } from "@/lib/money";
import { useLocale } from "next-intl";

interface Cat {
  slug: string;
  name: string;
}

interface Svc {
  slug: string;
  title: string;
  icon: string | null;
  description: string | null;
  priceFrom: number | null;
  currency: "TRY" | "EUR";
}

export function HeaderClient({
  categories,
  services,
  phone,
}: {
  categories: Cat[];
  services: Svc[];
  phone: string | null;
}) {
  const t = useTranslations("nav");
  const ts = useTranslations("services");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => setOpen(false), [pathname]);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
  }

  const links = [
    { href: "/", label: t("home") },
    { href: "/projects", label: t("projects") },
    { href: "/about", label: t("about") },
    { href: "/blog", label: t("blog") },
    { href: "/contact", label: t("contact") },
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  const cartButton = (
    <Link
      href="/cart"
      aria-label={t("cart")}
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white text-navy transition-colors hover:border-brand hover:text-brand"
    >
      <ShoppingCart className="h-5 w-5" />
      {count > 0 ? (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[11px] font-bold text-white">
          {count}
        </span>
      ) : null}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 bg-white shadow-soft">
      <div className="bg-navy text-xs text-white">
        <div className="container-luxe flex h-9 items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            {phone ? (
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1.5 hover:opacity-80">
                <Phone className="h-3.5 w-3.5" /> {phone}
              </a>
            ) : null}
            <span className="hidden items-center gap-1.5 md:inline-flex">
              <Clock className="h-3.5 w-3.5" /> {t("hours")}
            </span>
          </div>
          <div className="flex items-center gap-4 text-white">
            <span className="hidden lg:block">{t("freeShipping")}</span>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      <div className="container-luxe flex items-center gap-4 py-3">
        <Logo priority imgClassName="h-10 sm:h-12" />
        <form onSubmit={onSearch} className="mx-auto hidden max-w-2xl flex-1 md:block">
          <div className="flex overflow-hidden rounded-full border border-border bg-background-alt focus-within:border-brand">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="flex-1 bg-transparent px-5 py-2.5 text-sm outline-none"
            />
            <button type="submit" className="bg-brand px-5 text-white hover:bg-navy" aria-label="Search">
              <Search className="h-4 w-4" />
            </button>
          </div>
        </form>
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          {cartButton}
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border text-navy lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? t("close") : t("menu")}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <nav className="hidden bg-brand text-white lg:block">
        <div className="container-luxe flex items-center gap-1">
          <div className="group relative">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-navy px-5 py-3 text-sm font-semibold uppercase tracking-wide"
            >
              <Menu className="h-4 w-4" /> {t("categories")} <ChevronDown className="h-4 w-4" />
            </Link>
            <div className="invisible absolute left-0 top-full z-50 w-80 translate-y-1 rounded-b-xl border border-border bg-white py-2 text-foreground opacity-0 shadow-lift transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              <Link href="/shop" className="block px-5 py-2.5 text-sm font-semibold text-brand hover:bg-background-alt">
                {t("allProducts")}
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/categories/${c.slug}`}
                  className="block px-5 py-2.5 text-sm hover:bg-background-alt hover:text-brand"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
          {links.slice(0, 1).map((l) => (
            <Link key={l.href} href={l.href} className={cn("px-4 py-3 text-sm font-medium transition-colors hover:bg-white/15", isActive(l.href) && "bg-white/20")}>
              {l.label}
            </Link>
          ))}
          <div className="group relative">
            <Link
              href="/services"
              className={cn("inline-flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors hover:bg-white/15", isActive("/services") && "bg-white/20")}
            >
              {t("services")} <ChevronDown className="h-4 w-4" />
            </Link>
            <div className="invisible absolute left-0 top-full z-50 w-[46rem] max-w-[90vw] translate-y-1 rounded-b-2xl border border-border bg-white p-4 text-foreground opacity-0 shadow-lift transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              <div className="grid grid-cols-2 gap-2">
                {services.map((s) => (
                  <Link key={s.slug} href={`/services/${s.slug}`} className="flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-background-alt">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand"><ServiceIcon name={s.icon} className="h-5 w-5" /></span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-navy">{s.title}</span>
                      <span className="block truncate text-xs text-muted">
                        {s.priceFrom ? `${ts("from")} ${formatMoney(s.priceFrom, s.currency, locale)}` : ts("quoteOnly")}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
              <Link href="/services" className="mt-3 flex items-center justify-between rounded-xl bg-navy px-4 py-3 text-sm font-semibold text-white hover:bg-brand">
                {t("allServices")} <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
          {links.slice(1).map((l) => (
            <Link key={l.href} href={l.href} className={cn("px-4 py-3 text-sm font-medium transition-colors hover:bg-white/15", isActive(l.href) && "bg-white/20")}>
              {l.label}
            </Link>
          ))}
          <Link
            href="/appointment"
            className="ml-auto my-1.5 rounded-full bg-white px-5 py-2 text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-white"
          >
            {t("appointment")}
          </Link>
        </div>
      </nav>

      {open ? (
        <div className="max-h-[75vh] overflow-y-auto border-t border-border bg-white lg:hidden">
          <form onSubmit={onSearch} className="p-4 md:hidden">
            <div className="flex overflow-hidden rounded-full border border-border bg-background-alt">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="flex-1 bg-transparent px-4 py-2.5 text-sm outline-none"
              />
              <button type="submit" className="bg-brand px-4 text-white" aria-label="Search">
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>
          <div className="px-4 pb-2 text-xs font-semibold uppercase tracking-wide text-muted">{t("categories")}</div>
          <ul>
            <li>
              <Link href="/shop" className="block px-4 py-2.5 text-sm font-semibold text-brand">{t("allProducts")}</Link>
            </li>
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/categories/${c.slug}`} className="block px-4 py-2.5 text-sm">{c.name}</Link>
              </li>
            ))}
          </ul>
          <div className="mt-2 border-t border-border px-4 pb-2 pt-3 text-xs font-semibold uppercase tracking-wide text-muted">{t("servicesMenu")}</div>
          <ul>
            <li><Link href="/services" className="block px-4 py-2.5 text-sm font-semibold text-brand">{t("allServices")}</Link></li>
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                  <ServiceIcon name={s.icon} className="h-4 w-4 text-brand" /> {s.title}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-2 border-t border-border px-4 pb-2 pt-3 text-xs font-semibold uppercase tracking-wide text-muted">{t("menu")}</div>
          <ul className="pb-4">
            {[links[0], { href: "/services", label: t("services") }, ...links.slice(1), { href: "/appointment", label: t("appointment") }].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="block px-4 py-2.5 text-sm">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </header>
  );
}
