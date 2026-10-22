"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, ShoppingCart } from "lucide-react";
import { useCart, lineFromProduct } from "./CartProvider";
import { cn } from "@/lib/utils";
import type { ProductView } from "@/lib/queries/shop";

export function AddToCartButton({
  product,
  quantity = 1,
  className,
  compact = false,
}: {
  product: ProductView;
  quantity?: number;
  className?: string;
  compact?: boolean;
}) {
  const t = useTranslations("shop");
  const { add } = useCart();
  const [done, setDone] = useState(false);

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    add(lineFromProduct(product), quantity);
    setDone(true);
    setTimeout(() => setDone(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy",
        done && "bg-navy",
        className,
      )}
    >
      {done ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
      {compact ? null : done ? t("added") : t("addToCart")}
      {compact ? <span className="sr-only">{t("addToCart")}</span> : null}
    </button>
  );
}
