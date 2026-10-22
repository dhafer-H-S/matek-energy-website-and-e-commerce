import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { discountPercent } from "@/lib/money";
import { Price } from "./Price";
import { AddToCartButton } from "./AddToCartButton";
import type { ProductView } from "@/lib/queries/shop";

export async function ProductCard({
  product,
  locale,
}: {
  product: ProductView;
  locale: string;
}) {
  const t = await getTranslations({ locale, namespace: "shop" });
  const discount = discountPercent(product);
  const buyable = product.inStock && !product.quoteOnly;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white transition-shadow hover:shadow-lift">
      <Link href={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden bg-background-alt">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {discount ? (
            <span className="rounded-full bg-danger px-2.5 py-1 text-xs font-bold text-white">-{discount}%</span>
          ) : null}
          {product.isNew ? (
            <span className="rounded-full bg-navy px-2.5 py-1 text-xs font-bold text-white">{t("new")}</span>
          ) : null}
        </div>
        {!product.inStock ? (
          <span className="absolute right-3 top-3 rounded-full bg-foreground/80 px-2.5 py-1 text-xs font-semibold text-white">
            {t("outOfStock")}
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        {product.categoryName ? (
          <span className="text-xs font-medium uppercase tracking-wide text-brand">{product.categoryName}</span>
        ) : null}
        <Link href={`/products/${product.slug}`} className="line-clamp-2 min-h-[2.75rem] font-display text-base font-semibold leading-snug text-foreground hover:text-brand">
          {product.name}
        </Link>
        <div className="mt-auto flex flex-col gap-3 pt-2">
          {product.quoteOnly ? (
            <span className="text-sm font-semibold text-navy">{t("quoteOnly")}</span>
          ) : (
            <Price price={product.price} salePrice={product.salePrice} currency={product.currency} locale={locale} />
          )}
          {buyable ? (
            <AddToCartButton product={product} className="w-full" />
          ) : (
            <Link
              href={`/contact?subject=${encodeURIComponent(product.name)}`}
              className="inline-flex items-center justify-center rounded-full border border-brand px-5 py-2.5 text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-white"
            >
              {t("requestQuote")}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
