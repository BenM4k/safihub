import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SafiHub — Pressing & Blanchisserie à Bukavu",
    short_name: "SafiHub",
    description:
      "Le pressing moderne à Bukavu avec collecte et livraison à domicile en 24h-48h.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#2824D5",
    icons: [
      {
        src: "/favicon-light.png",
        sizes: "64x64",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}

