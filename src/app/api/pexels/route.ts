import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { searchPexelsPhotos, searchPexelsVideos } from "@/lib/pexels";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sp = req.nextUrl.searchParams;
  const query = sp.get("query")?.trim();
  const page = Number(sp.get("page") ?? "1") || 1;
  const type = sp.get("type") === "video" ? "video" : "photo";

  if (!query) {
    return NextResponse.json({ results: [], type });
  }

  try {
    const results =
      type === "video"
        ? await searchPexelsVideos(query, page)
        : await searchPexelsPhotos(query, page);
    return NextResponse.json({ results, type });
  } catch {
    return NextResponse.json(
      { error: "Failed to search Pexels", results: [] },
      { status: 502 },
    );
  }
}
