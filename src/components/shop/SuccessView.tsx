"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { totalsText } from "@/lib/whatsapp";
import type { PlaceOrderResult } from "@/lib/actions/order";

type Saved = Extract<PlaceOrderResult, { ok: true }>;

export function SuccessView() {
  const t = useTranslations("checkout");
  const tc = useTranslations("cart");
  const locale = useLocale();
  const [data, setData] = useState<Saved | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("matek_last_order");
      if (raw) setData(JSON.parse(raw));
    } catch {}
  }, []);

  return (
    <div className="rounded-2xl border border-border bg-white p-8 text-center">
      <CheckCircle2 className="mx-auto h-14 w-14 text-brand" />
      <h1 className="mt-4 font-display text-3xl text-navy">{t("successTitle")}</h1>
      <p className="mt-2 text-muted">{t("successText")}</p>
      {data ? (
        <div className="mt-6 space-y-2 text-sm">
          <p>{t("orderNumber")}: <strong className="text-navy">{data.order.orderNumber}</strong></p>
          <p className="font-semibold text-navy">{totalsText(data.order.totals, locale)}</p>
          {data.order.paymentMethod === "bank_transfer" && data.bank.iban ? (
            <div className="mx-auto mt-4 max-w-sm rounded-xl bg-background-alt p-4 text-start">
              <p className="mb-2 text-muted">{t("transferNote")}</p>
              {data.bank.name ? <p>{t("bankName")}: {data.bank.name}</p> : null}
              {data.bank.holder ? <p>{t("accountHolder")}: {data.bank.holder}</p> : null}
              <p className="font-mono">{t("iban")}: {data.bank.iban}</p>
            </div>
          ) : null}
          <a href={data.whatsappUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex rounded-full bg-[#25D366] px-6 py-3 font-semibold text-white">
            {t("whatsappAgain")}
          </a>
        </div>
      ) : null}
      <div>
        <Link href="/shop" className="mt-6 inline-flex rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white hover:bg-navy">
          {tc("continue")}
        </Link>
      </div>
    </div>
  );
}
