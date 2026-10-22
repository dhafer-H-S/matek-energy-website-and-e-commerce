import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { blobToken } from "@/lib/blob";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const isVideo = file.type.startsWith("video/");
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const token = blobToken();

  try {
    let url: string;
    if (token) {
      const blob = await put(`uploads/${safeName}`, file, {
        access: "public",
        addRandomSuffix: true,
        token,
      });
      url = blob.url;
    } else {
      // Local fallback when Vercel Blob is not configured.
      const dir = path.join(process.cwd(), "public", "uploads");
      await mkdir(dir, { recursive: true });
      const unique = `${Date.now()}-${safeName}`;
      await writeFile(path.join(dir, unique), Buffer.from(await file.arrayBuffer()));
      url = `/uploads/${unique}`;
    }

    const [row] = await db
      .insert(media)
      .values({
        url,
        alt: file.name,
        type: isVideo ? "video" : "image",
        source: "upload",
      })
      .returning();

    return NextResponse.json({ url, id: row?.id });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
