"use client";

import { useLocale, useTranslations } from "next-intl";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useCart } from "./CartProvider";
import { formatMoney } from "@/lib/money";
import { totalsText } from "@/lib/whatsapp";

export function CartView() {
  const t = useTranslations("cart");
  const locale = useLocale();
  const { lines, totals, ready, setQuantity, remove, clear } = useCart();

  if (!ready) return <div className="h-40" />;
  if (lines.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg text-muted">{t("empty")}</p>
        <Link href="/shop" className="mt-6 inline-flex rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white hover:bg-navy">
          {t("continue")}
        </Link>
      </div>
    );
  }
  const mixed = totals.EUR > 0 && totals.TRY > 0;
  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        {lines.map((l) => (
          <div key={l.productId} className="flex gap-4 rounded-2xl border border-border bg-white p-4">
            <Link href={`/products/${l.slug}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-background-alt">
              {l.image ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={l.image} alt={l.name} className="h-full w-full object-cover" /> : null}
            </Link>
            <div className="flex flex-1 flex-col justify-between">
              <div className="flex justify-between gap-3">
                <Link href={`/products/${l.slug}`} className="font-medium text-navy hover:text-brand">{l.name}</Link>
                <button onClick={() => remove(l.productId)} aria-label={t("remove")} className="text-muted hover:text-danger">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center rounded-full border border-border">
                  <button className="p-2" onClick={() => setQuantity(l.productId, l.quantity - 1)} aria-label="-"><Minus className="h-3.5 w-3.5" /></button>
                  <span className="w-8 text-center text-sm">{l.quantity}</span>
                  <button className="p-2" onClick={() => setQuantity(l.productId, l.quantity + 1)} aria-label="+"><Plus className="h-3.5 w-3.5" /></button>
                </div>
                <span className="font-semibold text-navy">{formatMoney(l.unitPrice * l.quantity, l.currency, locale)}</span>
              </div>
            </div>
          </div>
        ))}
        <button onClick={clear} className="text-sm text-muted underline hover:text-danger">{t("clear")}</button>
      </div>
      <aside className="h-fit rounded-2xl border border-border bg-white p-6">
        <h2 className="font-display text-xl text-navy">{t("subtotal")}</h2>
        <p className="mt-3 font-display text-2xl font-semibold text-navy">{totalsText(totals, locale)}</p>
        {mixed ? <p className="mt-2 text-xs text-muted">{t("mixedNote")}</p> : null}
        <Link href="/checkout" className="mt-6 flex w-full justify-center rounded-full bg-brand px-6 py-3.5 text-sm font-semibold text-white hover:bg-navy">
          {t("checkout")}
        </Link>
        <Link href="/shop" className="mt-3 block text-center text-sm text-muted hover:text-brand">{t("continue")}</Link>
      </aside>
    </div>
  );
}
