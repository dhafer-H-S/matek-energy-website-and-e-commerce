import type { MetadataRoute } from "next";

/** PWA / installable web manifest. Served at /manifest.webmanifest. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Matek Energy — Energy systems that simply work",
    short_name: "Matek Energy",
    description:
      "Renewable energy, heating, cooling and electrical systems — shop products and book installation services in Kyrenia, TRNC.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f8f7",
    theme_color: "#5d8b73",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
