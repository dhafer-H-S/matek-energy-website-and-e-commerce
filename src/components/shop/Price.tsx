import { formatMoney, discountPercent } from "@/lib/money";
import { cn } from "@/lib/utils";

export function Price({
  price,
  salePrice,
  currency,
  locale,
  className,
  size = "md",
}: {
  price: number;
  salePrice: number | null;
  currency: "TRY" | "EUR";
  locale: string;
  className?: string;
  size?: "md" | "lg";
}) {
  const discount = discountPercent({ price, salePrice });
  const big = size === "lg";
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2", className)}>
      <span className={cn("font-display font-semibold text-navy", big ? "text-3xl" : "text-lg")}>
        {formatMoney(discount ? salePrice : price, currency, locale)}
      </span>
      {discount ? (
        <span className={cn("text-muted line-through", big ? "text-lg" : "text-sm")}>
          {formatMoney(price, currency, locale)}
        </span>
      ) : null}
    </div>
  );
}
