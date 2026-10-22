"use server";

import { inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { orders, products, type OrderItem } from "@/lib/db/schema";
import { effectivePrice } from "@/lib/money";
import { getSettings } from "@/lib/queries/settings";
import { pickTranslation } from "@/lib/db/translations";
import { buildOrderMessage, waLink } from "@/lib/whatsapp";

const schema = z.object({
  customerName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(5).max(40),
  email: z.string().trim().email().max(160).optional().or(z.literal("")),
  city: z.string().trim().max(80).optional(),
  address: z.string().trim().min(3).max(300),
  notes: z.string().trim().max(1000).optional(),
  paymentMethod: z.enum(["cash_on_delivery", "bank_transfer"]),
  channel: z.enum(["website", "whatsapp"]),
  locale: z.string().max(5).default("en"),
  items: z
    .array(z.object({ productId: z.string(), quantity: z.number().int().min(1).max(999) }))
    .min(1)
    .max(60),
});

export type PlaceOrderInput = z.input<typeof schema>;

export type PlaceOrderResult =
  | {
      ok: true;
      order: {
        orderNumber: string;
        customerName: string;
        phone: string;
        email: string | null;
        city: string | null;
        address: string | null;
        notes: string | null;
        paymentMethod: "cash_on_delivery" | "bank_transfer";
        items: OrderItem[];
        totals: { TRY?: number; EUR?: number };
      };
      whatsappUrl: string;
      orderEmail: string | null;
      bank: { name: string | null; holder: string | null; iban: string | null; notes: string | null };
    }
  | { ok: false; error: string };

function makeOrderNumber(): string {
  const d = new Date();
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `MK-${ymd}-${rand}`;
}

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const data = parsed.data;

  const ids = [...new Set(data.items.map((i) => i.productId))];
  const rows = await db.query.products.findMany({
    where: inArray(products.id, ids),
    with: { translations: true },
  });
  const byId = new Map(rows.map((r) => [r.id, r]));

  const items: OrderItem[] = [];
  const totals: { TRY?: number; EUR?: number } = {};
  for (const line of data.items) {
    const p = byId.get(line.productId);
    if (!p || !p.published || p.quoteOnly || !p.inStock) continue;
    const unitPrice = effectivePrice(p);
    items.push({
      productId: p.id,
      slug: p.slug,
      name: pickTranslation(p.translations, data.locale)?.name ?? p.slug,
      image: p.image,
      sku: p.sku,
      unitPrice,
      currency: p.currency,
      quantity: line.quantity,
    });
    totals[p.currency] = Math.round(((totals[p.currency] ?? 0) + unitPrice * line.quantity) * 100) / 100;
  }
  if (items.length === 0) return { ok: false, error: "empty" };

  const order = {
    orderNumber: makeOrderNumber(),
    customerName: data.customerName,
    phone: data.phone,
    email: data.email || null,
    city: data.city || null,
    address: data.address,
    notes: data.notes || null,
    paymentMethod: data.paymentMethod,
    items,
    totals,
  };

  try {
    await db.insert(orders).values({ ...order, channel: data.channel, locale: data.locale });
  } catch {
    return { ok: false, error: "db" };
  }

  const settings = await getSettings(data.locale);
  return {
    ok: true,
    order,
    whatsappUrl: waLink(settings.whatsapp, buildOrderMessage(order, data.locale)),
    orderEmail: settings.orderEmail,
    bank: {
      name: settings.bankName,
      holder: settings.bankAccountHolder,
      iban: settings.bankIban,
      notes: settings.bankNotes,
    },
  };
}
