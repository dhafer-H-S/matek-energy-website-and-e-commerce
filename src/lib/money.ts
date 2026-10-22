export type Currency = "TRY" | "EUR";

export const CURRENCIES: Currency[] = ["EUR", "TRY"];

/** Format an amount in its own currency (no conversion between currencies). */
export function formatMoney(
  amount: number | null | undefined,
  currency: Currency | string = "EUR",
  locale = "en",
): string {
  const value = amount ?? 0;
  const loc = locale === "tr" ? "tr-TR" : "en-GB";
  try {
    return new Intl.NumberFormat(loc, {
      style: "currency",
      currency,
      maximumFractionDigits: value % 1 === 0 ? 0 : 2,
    }).format(value);
  } catch {
    return `${value} ${currency}`;
  }
}

export function effectivePrice(p: {
  price: number;
  salePrice: number | null;
}): number {
  return p.salePrice != null && p.salePrice > 0 && p.salePrice < p.price
    ? p.salePrice
    : p.price;
}

export function discountPercent(p: {
  price: number;
  salePrice: number | null;
}): number | null {
  if (p.salePrice == null || p.salePrice <= 0 || p.salePrice >= p.price)
    return null;
  return Math.round((1 - p.salePrice / p.price) * 100);
}
