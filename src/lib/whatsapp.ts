import { formatMoney } from "@/lib/money";
import type { OrderItem } from "@/lib/db/schema";

export const DEFAULT_WHATSAPP = "905338697973";

export function waDigits(value: string | null | undefined): string {
  const d = (value ?? "").replace(/\D/g, "");
  return d || DEFAULT_WHATSAPP;
}

export function waLink(number: string | null | undefined, text: string): string {
  return `https://wa.me/${waDigits(number)}?text=${encodeURIComponent(text)}`;
}

export interface OrderSummary {
  orderNumber: string;
  customerName: string;
  phone: string;
  email?: string | null;
  city?: string | null;
  address?: string | null;
  notes?: string | null;
  paymentMethod: "cash_on_delivery" | "bank_transfer";
  items: OrderItem[];
  totals: { TRY?: number; EUR?: number };
}

export function totalsText(totals: { TRY?: number; EUR?: number }, locale: string): string {
  return (["EUR", "TRY"] as const)
    .filter((c) => totals[c])
    .map((c) => formatMoney(totals[c], c, locale))
    .join(" + ");
}

export function buildOrderMessage(o: OrderSummary, locale: string): string {
  const tr = locale === "tr";
  const pay =
    o.paymentMethod === "bank_transfer"
      ? tr ? "Banka havalesi (IBAN)" : "Bank transfer (IBAN)"
      : tr ? "Kapıda ödeme" : "Cash on delivery";
  const lines = [
    tr ? `*Yeni sipariş ${o.orderNumber}*` : `*New order ${o.orderNumber}*`,
    "",
    ...o.items.map(
      (i) => `• ${i.quantity} × ${i.name} — ${formatMoney(i.unitPrice * i.quantity, i.currency, locale)}`,
    ),
    "",
    `${tr ? "Toplam" : "Total"}: ${totalsText(o.totals, locale)}`,
    `${tr ? "Ödeme" : "Payment"}: ${pay}`,
    "",
    `${tr ? "Ad" : "Name"}: ${o.customerName}`,
    `${tr ? "Telefon" : "Phone"}: ${o.phone}`,
  ];
  if (o.email) lines.push(`Email: ${o.email}`);
  const addr = [o.address, o.city].filter(Boolean).join(", ");
  if (addr) lines.push(`${tr ? "Adres" : "Address"}: ${addr}`);
  if (o.notes) lines.push(`${tr ? "Not" : "Notes"}: ${o.notes}`);
  return lines.join("\n");
}
