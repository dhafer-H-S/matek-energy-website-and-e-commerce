"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/admin/helpers";

const STATUSES = ["new", "confirmed", "shipped", "delivered", "cancelled"] as const;
type Status = (typeof STATUSES)[number];

export async function updateOrderStatus(id: string, status: string) {
  await requireAdmin();
  if (!STATUSES.includes(status as Status)) return;
  await db.update(orders).set({ status: status as Status }).where(eq(orders.id, id));
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

export async function saveOrderNote(id: string, note: string) {
  await requireAdmin();
  await db.update(orders).set({ adminNote: note.trim() || null }).where(eq(orders.id, id));
  revalidatePath(`/admin/orders/${id}`);
}

export async function deleteOrder(id: string) {
  await requireAdmin();
  await db.delete(orders).where(eq(orders.id, id));
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}
