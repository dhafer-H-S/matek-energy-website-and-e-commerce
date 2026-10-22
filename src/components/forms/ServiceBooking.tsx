"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { submitEnquiry, type EnquiryState } from "@/lib/actions/enquiry";

const input =
  "w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-brand";

export function ServiceBooking({ serviceId, serviceTitle }: { serviceId: string; serviceTitle: string }) {
  const t = useTranslations("services");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [state, action, pending] = useActionState<EnquiryState, FormData>(submitEnquiry, {});

  if (state.ok) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-brand/30 bg-brand/10 p-5 text-navy">
        <Check className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
        <div><p className="text-sm font-medium">{t("bookingSent")}</p>{state.emailWarning ? <p role="status" className="mt-2 text-sm text-muted">{tc("emailDelayed")}</p> : null}</div>
      </div>
    );
  }

  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="sourceType" value="quote" />
      <input type="hidden" name="sourceId" value={serviceId} />
      <input type="hidden" name="sourceLabel" value={serviceTitle} />
      <input type="hidden" name="locale" value={locale} />
      <input name="name" required placeholder={tc("name")} className={input} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <input name="phone" required placeholder={tc("phone")} className={input} />
        <input name="email" type="email" required placeholder={tc("email")} className={input} />
      </div>
      <label className="grid gap-1 text-xs text-muted">
        {t("preferredDate")}
        <input name="preferredDate" type="date" className={input} />
      </label>
      <textarea name="message" rows={3} placeholder={tc("message")} className={input} />
      {state.error ? <p className="text-sm text-danger">{tc("error")}</p> : null}
      <button type="submit" disabled={pending} className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-4 text-base font-semibold text-white shadow-lg shadow-brand/25 transition hover:-translate-y-0.5 hover:bg-navy disabled:opacity-60">
        {pending ? tc("sending") : t("bookCta")}
      </button>
      <p className="text-center text-xs text-muted">{t("bookNote")}</p>
    </form>
  );
}
