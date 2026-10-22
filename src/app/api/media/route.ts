import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await db
    .select()
    .from(media)
    .orderBy(desc(media.createdAt))
    .limit(200);
  return NextResponse.json({ media: rows });
}
