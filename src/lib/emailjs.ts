"use client";

import emailjs from "@emailjs/browser";
import { totalsText, type OrderSummary } from "@/lib/whatsapp";

/**
 * Sends the order notification email through EmailJS.
 * Template variables: order_number, customer_name, customer_phone,
 * customer_email, customer_address, notes, payment_method, channel,
 * items, total, to_email. Silently skips when EmailJS is not configured.
 */
export async function sendOrderEmail(
  order: OrderSummary,
  channel: "website" | "whatsapp",
  toEmail: string | null,
): Promise<boolean> {
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
  if (!serviceId || !templateId || !publicKey) return false;
  try {
    await emailjs.send(
      serviceId,
      templateId,
      {
        to_email: toEmail ?? "matek.energy@gmail.com",
        order_number: order.orderNumber,
        customer_name: order.customerName,
        customer_phone: order.phone,
        customer_email: order.email ?? "-",
        customer_address: [order.address, order.city].filter(Boolean).join(", ") || "-",
        notes: order.notes ?? "-",
        payment_method:
          order.paymentMethod === "bank_transfer" ? "Bank transfer (IBAN)" : "Cash on delivery",
        channel,
        items: order.items
          .map((i) => `${i.quantity} x ${i.name} (${i.unitPrice} ${i.currency})`)
          .join("\n"),
        total: totalsText(order.totals, "en"),
      },
      { publicKey },
    );
    return true;
  } catch {
    return false;
  }
}
