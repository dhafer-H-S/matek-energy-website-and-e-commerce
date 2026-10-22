"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Minus, Plus, ShoppingCart, Zap } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useCart, lineFromProduct } from "./CartProvider";
import { formatMoney, effectivePrice } from "@/lib/money";
import type { ProductView } from "@/lib/queries/shop";

export function ProductBuy({ product, locale, whatsappHref }: { product: ProductView; locale: string; whatsappHref: string }) {
  const t = useTranslations("shop");
  const router = useRouter();
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [done, setDone] = useState(false);
  const total = effectivePrice(product) * qty;

  function addToCart() {
    add(lineFromProduct(product), qty);
    setDone(true);
    setTimeout(() => setDone(false), 1600);
  }
  function orderNow() {
    add(lineFromProduct(product), qty);
    router.push("/checkout");
  }

  return (
    <>
      <div className="rounded-2xl border border-border bg-background-alt/60 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center rounded-full border border-border bg-white" aria-label={t("quantity")}>
            <button type="button" className="p-3 hover:text-brand" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="-"><Minus className="h-4 w-4" /></button>
            <span className="w-10 text-center font-semibold">{qty}</span>
            <button type="button" className="p-3 hover:text-brand" onClick={() => setQty((q) => q + 1)} aria-label="+"><Plus className="h-4 w-4" /></button>
          </div>
          <p className="text-sm text-muted">
            {t("totalFor")}: <span className="font-display text-xl font-semibold text-navy">{formatMoney(total, product.currency, locale)}</span>
          </p>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={orderNow} className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-4 text-base font-semibold text-white shadow-lg shadow-brand/25 transition hover:-translate-y-0.5 hover:bg-navy">
            <Zap className="h-5 w-5" /> {t("orderNow")}
          </button>
          <button type="button" onClick={addToCart} className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-navy px-6 py-4 text-base font-semibold text-navy transition hover:bg-navy hover:text-white">
            {done ? <Check className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />} {done ? t("added") : t("addToCart")}
          </button>
        </div>
        <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-semibold text-white transition hover:brightness-95">
          {t("askExpert")}
        </a>
      </div>

      {/* Mobile sticky buy bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-border bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-muted">{product.name}</p>
          <p className="font-display text-lg font-semibold text-navy">{formatMoney(effectivePrice(product), product.currency, locale)}</p>
        </div>
        <button type="button" onClick={orderNow} className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white">{t("orderNow")}</button>
      </div>
    </>
  );
}
