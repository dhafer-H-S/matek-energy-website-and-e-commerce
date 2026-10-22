import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ProductCard } from "./ProductCard";
import { listCategories, listProducts, type ProductSort } from "@/lib/queries/shop";
import { cn } from "@/lib/utils";

export async function ShopListing({
  locale,
  basePath,
  categorySlug,
  q,
  sort,
}: {
  locale: string;
  basePath: string;
  categorySlug?: string;
  q?: string;
  sort?: string;
}) {
  const t = await getTranslations({ locale, namespace: "shop" });
  const tn = await getTranslations({ locale, namespace: "nav" });
  const [cats, items] = await Promise.all([
    listCategories(locale),
    listProducts(locale, { categorySlug, search: q, sort: (sort as ProductSort) || "newest" }),
  ]);
  const sorts: [ProductSort, string][] = [
    ["newest", t("sortNewest")],
    ["price-asc", t("sortPriceAsc")],
    ["price-desc", t("sortPriceDesc")],
    ["name", t("sortName")],
  ];
  const qs = (s: string) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    p.set("sort", s);
    return `${basePath}?${p.toString()}`;
  };
  return (
    <div className="container-luxe grid gap-8 py-12 lg:grid-cols-4">
      <aside className="lg:col-span-1">
        <h2 className="mb-3 font-display text-lg text-navy">{tn("categories")}</h2>
        <ul className="space-y-1 text-sm">
          <li><Link href="/shop" className={cn("block rounded-lg px-3 py-2 hover:bg-background-alt", !categorySlug && "bg-brand/10 font-semibold text-navy")}>{tn("allProducts")}</Link></li>
          {cats.map((c) => (
            <li key={c.slug}><Link href={`/categories/${c.slug}`} className={cn("block rounded-lg px-3 py-2 hover:bg-background-alt", categorySlug === c.slug && "bg-brand/10 font-semibold text-navy")}>{c.name}</Link></li>
          ))}
        </ul>
      </aside>
      <div className="lg:col-span-3">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted">
            {q ? `${t("searchResults", { query: q })} · ` : ""}{t("results", { count: items.length })}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted">{t("sortBy")}:</span>
            {sorts.map(([v, label]) => (
              <Link key={v} href={qs(v)} className={cn("rounded-full border px-3 py-1", (sort || "newest") === v ? "border-brand bg-brand text-white" : "border-border hover:border-brand")}>{label}</Link>
            ))}
          </div>
        </div>
        {items.length === 0 ? (
          <p className="py-16 text-center text-muted">{categorySlug && !q ? t("emptyCategory") : t("noResults")}</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 xl:grid-cols-3">
            {items.map((p) => (
              <ProductCard key={p.id} product={p} locale={locale} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
