"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="space-y-3">
      {items.map((f, i) => (
        <div key={f.q} className="rounded-2xl border border-border bg-white">
          <button onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between gap-4 p-5 text-start font-medium text-navy">
            {f.q}
            <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`} />
          </button>
          {open === i ? <p className="px-5 pb-5 text-sm text-muted">{f.a}</p> : null}
        </div>
      ))}
    </div>
  );
}
