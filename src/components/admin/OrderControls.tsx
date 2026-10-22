"use client";

import { useState, useTransition } from "react";
import {
  updateOrderStatus,
  saveOrderNote,
} from "@/app/(admin)/admin/(dashboard)/orders/actions";

const STATUSES = ["new", "confirmed", "shipped", "delivered", "cancelled"];

export function OrderStatusSelect({ id, status }: { id: string; status: string }) {
  const [pending, start] = useTransition();
  return (
    <select
      defaultValue={status}
      disabled={pending}
      onChange={(e) => start(() => updateOrderStatus(id, e.target.value))}
      className="rounded-xs border border-border bg-background px-2.5 py-1.5 text-xs capitalize outline-none focus:border-gold"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}

export function OrderNote({ id, note }: { id: string; note: string | null }) {
  const [value, setValue] = useState(note ?? "");
  const [pending, start] = useTransition();
  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={3}
        placeholder="Internal note…"
        className="w-full rounded-sm border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-gold"
      />
      <button
        type="button"
        disabled={pending}
        onClick={() => start(() => saveOrderNote(id, value))}
        className="self-start rounded-xs bg-foreground px-4 py-2 text-xs font-semibold uppercase tracking-luxe text-background hover:bg-gold hover:text-ink disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save note"}
      </button>
    </div>
  );
}
