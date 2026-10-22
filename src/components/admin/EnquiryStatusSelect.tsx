"use client";

import { useTransition } from "react";
import { updateEnquiryStatus } from "@/app/(admin)/admin/(dashboard)/enquiries/actions";

export function EnquiryStatusSelect({
  id,
  status,
}: {
  id: string;
  status: "new" | "contacted" | "closed";
}) {
  const [pending, start] = useTransition();
  return (
    <select
      defaultValue={status}
      disabled={pending}
      onChange={(e) =>
        start(() =>
          updateEnquiryStatus(
            id,
            e.target.value as "new" | "contacted" | "closed",
          ),
        )
      }
      className="rounded-xs border border-border bg-background px-2.5 py-1.5 text-xs capitalize outline-none focus:border-gold"
    >
      <option value="new">New</option>
      <option value="contacted">Contacted</option>
      <option value="closed">Closed</option>
    </select>
  );
}
