"use client";

import { useActionState } from "react";
import { retryEmail, type RetryEmailState } from "@/app/(admin)/admin/(dashboard)/emails/actions";

export function RetryEmailButton({ id }: { id: string }) {
  const [state, action, pending] = useActionState<RetryEmailState, FormData>(async (previous) => {
    if (!window.confirm("If the previous attempt was interrupted, the email may already have been sent. Retrying can deliver a duplicate. Send this email now?")) return previous;
    return retryEmail(id);
  }, {});
  return (
    <form action={action}>
      <button type="submit" disabled={pending} className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground hover:border-gold disabled:opacity-60">{pending ? "Sending..." : "Retry email"}</button>
      {state.error ? <p role="alert" className="mt-2 max-w-lg text-sm text-red-600">{state.error}</p> : null}
      {state.ok ? <p role="status" className="mt-2 text-sm text-emerald-700">Sent via Gmail.</p> : null}
    </form>
  );
}
