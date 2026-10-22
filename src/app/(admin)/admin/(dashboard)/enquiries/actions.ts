"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { enquiries } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/admin/helpers";

export async function updateEnquiryStatus(
  id: string,
  status: "new" | "contacted" | "closed",
) {
  await requireAdmin();
  await db.update(enquiries).set({ status }).where(eq(enquiries.id, id));
  revalidatePath("/admin/enquiries");
}

export async function deleteEnquiry(id: string) {
  await requireAdmin();
  await db.delete(enquiries).where(eq(enquiries.id, id));
  revalidatePath("/admin/enquiries");
}
