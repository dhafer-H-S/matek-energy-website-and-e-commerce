"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { submitEnquiry, type EnquiryState } from "@/lib/actions/enquiry";

const input =
  "w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-brand";

export function EnquiryForm({
  sourceType = "contact",
  services,
  defaultService,
  defaultMessage,
}: {
  sourceType?: "contact" | "appointment" | "quote" | "general";
  services?: string[];
  defaultService?: string;
  defaultMessage?: string;
}) {
  const t = useTranslations("common");
  const locale = useLocale();
  const [state, action, pending] = useActionState<EnquiryState, FormData>(submitEnquiry, {});

  if (state.ok) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-brand/30 bg-brand/10 p-6 text-navy">
        <Check className="h-6 w-6 text-brand" />
        <p className="font-medium">{t("sent")}</p>
      </div>
    );
  }

  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="sourceType" value={sourceType} />
      <input type="hidden" name="locale" value={locale} />
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="name" required placeholder={t("name")} className={input} />
        <input name="phone" placeholder={t("phone")} className={input} />
      </div>
      <input name="email" type="email" required placeholder={t("email")} className={input} />
      {services ? (
        <select name="sourceLabel" defaultValue={defaultService ?? ""} required className={input}>
          <option value="" disabled>
            —
          </option>
          {services.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      ) : defaultService ? (
        <input type="hidden" name="sourceLabel" value={defaultService} />
      ) : null}
      <textarea
        name="message"
        rows={5}
        defaultValue={defaultMessage}
        placeholder={t("message")}
        className={input}
      />
      {state.error ? <p className="text-sm text-danger">{t("error")}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-full bg-brand px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-navy disabled:opacity-60"
      >
        {pending ? t("sending") : t("send")}
      </button>
    </form>
  );
}
