const PEXELS_API = "https://api.pexels.com";

export interface PexelsPhoto {
  id: string;
  url: string; // large display URL
  thumb: string; // small preview URL
  photographer: string;
  width: number;
  height: number;
  alt: string;
}

export interface PexelsVideo {
  id: string;
  url: string; // mp4 file URL
  thumb: string; // preview image
  width: number;
  height: number;
  photographer: string;
}

interface PexelsPhotoApi {
  id: number;
  width: number;
  height: number;
  alt: string;
  photographer: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    tiny: string;
  };
}

interface PexelsVideoApi {
  id: number;
  width: number;
  height: number;
  image: string;
  user: { name: string };
  video_files: {
    id: number;
    quality: string;
    width: number | null;
    height: number | null;
    link: string;
    file_type: string;
  }[];
}

function apiKey(): string {
  const key = process.env.PEXELS_API_KEY;
  if (!key) throw new Error("PEXELS_API_KEY is not set");
  return key;
}

export async function searchPexelsPhotos(
  query: string,
  page = 1,
  perPage = 24,
): Promise<PexelsPhoto[]> {
  const url = `${PEXELS_API}/v1/search?query=${encodeURIComponent(
    query,
  )}&per_page=${perPage}&page=${page}&orientation=landscape`;
  const res = await fetch(url, {
    headers: { Authorization: apiKey() },
    next: { revalidate: 3600 },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { photos: PexelsPhotoApi[] };
  return (data.photos ?? []).map((p) => ({
    id: String(p.id),
    url: p.src.large2x ?? p.src.large,
    thumb: p.src.medium ?? p.src.small,
    photographer: p.photographer,
    width: p.width,
    height: p.height,
    alt: p.alt ?? query,
  }));
}

export async function searchPexelsVideos(
  query: string,
  page = 1,
  perPage = 12,
): Promise<PexelsVideo[]> {
  const url = `${PEXELS_API}/videos/search?query=${encodeURIComponent(
    query,
  )}&per_page=${perPage}&page=${page}&orientation=landscape`;
  const res = await fetch(url, {
    headers: { Authorization: apiKey() },
    next: { revalidate: 3600 },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { videos: PexelsVideoApi[] };
  return (data.videos ?? []).map((v) => {
    // Prefer an HD-ish mp4 that isn't enormous.
    const files = v.video_files
      .filter((f) => f.file_type === "video/mp4")
      .sort((a, b) => (b.width ?? 0) - (a.width ?? 0));
    const preferred =
      files.find((f) => (f.height ?? 0) <= 1080 && (f.height ?? 0) >= 540) ??
      files[0];
    return {
      id: String(v.id),
      url: preferred?.link ?? "",
      thumb: v.image,
      width: v.width,
      height: v.height,
      photographer: v.user?.name ?? "Pexels",
    };
  });
}
