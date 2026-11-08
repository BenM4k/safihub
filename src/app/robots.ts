import type { MetadataRoute } from "next";
import { getAppBaseUrl } from "@/lib/app-url";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getAppBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/houses",
          "/houses/*",
          "/coverage",
          "/track",
          "/partners/apply",
          "/terms",
          "/privacy",
          "/security",
          "/consent",
          "/opengraph-image",
        ],
        disallow: [
          "/admin",
          "/admin/*",
          "/courier",
          "/courier/*",
          "/partner",
          "/partner/*",
          "/cart",
          "/checkout",
          "/account",
          "/account/*",
          "/orders",
          "/orders/*",
          "/change-password",
          "/notifications",
          "/track/*", // individual order tokens are private
          "/api/*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}

