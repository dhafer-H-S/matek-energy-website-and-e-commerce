"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useCart } from "./CartProvider";
import { Link } from "@/i18n/navigation";
import { placeOrder } from "@/lib/actions/order";
import { formatMoney } from "@/lib/money";
import { totalsText } from "@/lib/whatsapp";

type Bank = { name: string | null; holder: string | null; iban: string | null; notes: string | null };
const input = "w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-brand";

export function CheckoutForm({ bank }: { bank: Bank }) {
  const t = useTranslations("checkout");
  const tc = useTranslations("cart");
  const locale = useLocale();
  const router = useRouter();
  const { lines, totals, ready, clear } = useCart();
  const [payment, setPayment] = useState<"cash_on_delivery" | "bank_transfer">("cash_on_delivery");
  const [busy, setBusy] = useState<null | "website" | "whatsapp">(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(channel: "website" | "whatsapp", form: HTMLFormElement) {
    const fd = new FormData(form);
    const val = (k: string) => String(fd.get(k) ?? "").trim();
    if (!val("customerName") || !val("phone") || !val("address")) {
      setError(t("required"));
      return;
    }
    setError(null);
    setBusy(channel);
    const res = await placeOrder({
      customerName: val("customerName"),
      phone: val("phone"),
      email: val("email"),
      city: val("city"),
      address: val("address"),
      notes: val("notes"),
      paymentMethod: payment,
      channel,
      locale,
      items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
    });
    if (!res.ok) {
      setBusy(null);
      setError(t("failed"));
      return;
    }
    if (channel === "whatsapp") window.open(res.whatsappUrl, "_blank", "noopener");
    sessionStorage.setItem(
      "matek_last_order",
      JSON.stringify({ order: res.order, bank: res.bank, whatsappUrl: res.whatsappUrl, emailWarning: res.emailWarning }),
    );
    clear();
    router.push("/order-success");
  }

  if (!ready) return <div className="h-40" />;
  if (lines.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted">{tc("empty")}</p>
        <Link href="/shop" className="mt-6 inline-flex rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white hover:bg-navy">
          {tc("continue")}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); void submit("website", e.currentTarget); }} className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-2xl border border-border bg-white p-6">
          <h2 className="mb-4 font-display text-xl text-navy">{t("details")}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <input name="customerName" required placeholder={t("fullName")} className={input} />
            <input name="phone" required placeholder={t("phone")} className={input} />
            <input name="email" type="email" placeholder={t("email")} className={input} />
            <input name="city" placeholder={t("city")} className={input} />
          </div>
          <textarea name="address" required rows={3} placeholder={t("address")} className={`${input} mt-4`} />
          <textarea name="notes" rows={2} placeholder={t("notes")} className={`${input} mt-4`} />
        </div>
        <div className="rounded-2xl border border-border bg-white p-6">
          <h2 className="mb-4 font-display text-xl text-navy">{t("payment")}</h2>
          {(["cash_on_delivery", "bank_transfer"] as const).map((m) => (
            <label key={m} className={`mb-3 flex cursor-pointer gap-3 rounded-xl border p-4 ${payment === m ? "border-brand bg-brand/5" : "border-border"}`}>
              <input type="radio" name="pay" checked={payment === m} onChange={() => setPayment(m)} className="mt-1 accent-[#5d8b73]" />
              <span>
                <span className="block font-medium text-navy">{m === "cash_on_delivery" ? t("cod") : t("bank")}</span>
                <span className="text-sm text-muted">{m === "cash_on_delivery" ? t("codText") : t("bankText")}</span>
              </span>
            </label>
          ))}
          {payment === "bank_transfer" ? (
            <div className="rounded-xl bg-background-alt p-4 text-sm">
              {bank.iban ? (
                <dl className="grid gap-1">
                  {bank.name ? <div><dt className="inline font-medium">{t("bankName")}: </dt><dd className="inline">{bank.name}</dd></div> : null}
                  {bank.holder ? <div><dt className="inline font-medium">{t("accountHolder")}: </dt><dd className="inline">{bank.holder}</dd></div> : null}
                  <div><dt className="inline font-medium">{t("iban")}: </dt><dd className="inline font-mono">{bank.iban}</dd></div>
                  {bank.notes ? <p className="mt-1 text-muted">{bank.notes}</p> : null}
                </dl>
              ) : (
                <p className="text-muted">{t("bankPending")}</p>
              )}
            </div>
          ) : null}
        </div>
      </div>

      <aside className="h-fit rounded-2xl border border-border bg-white p-6">
        <h2 className="font-display text-xl text-navy">{t("summary")}</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {lines.map((l) => (
            <li key={l.productId} className="flex justify-between gap-3">
              <span>{l.quantity} × {l.name}</span>
              <span className="shrink-0">{formatMoney(l.unitPrice * l.quantity, l.currency, locale)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 border-t border-border pt-4 font-display text-xl font-semibold text-navy">{totalsText(totals, locale)}</p>
        {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
        <button type="submit" disabled={!!busy} className="mt-5 w-full rounded-full bg-brand px-6 py-3.5 text-sm font-semibold text-white hover:bg-navy disabled:opacity-60">
          {busy === "website" ? t("placing") : t("placeOrder")}
        </button>
        <button
          type="button"
          disabled={!!busy}
          onClick={(e) => void submit("whatsapp", e.currentTarget.form!)}
          className="mt-3 w-full rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {busy === "whatsapp" ? t("placing") : t("orderWhatsapp")}
        </button>
        <p className="mt-2 text-xs text-muted">{t("whatsappHint")}</p>
      </aside>
    </form>
  );
}
