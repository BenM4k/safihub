import type { Metadata } from "next";
import { getAppBaseUrl } from "@/lib/app-url";

export const DEFAULT_SITE_NAME = "SafiHub";
export const DEFAULT_TITLE =
  "SafiHub — Pressing & Blanchisserie à la demande à Bukavu";
export const DEFAULT_DESCRIPTION =
  "Le pressing moderne à Bukavu avec collecte et livraison à domicile en 24h-48h. Double comptage au seuil, photos d'état et paiement Cash on Delivery en CDF et USD.";
export const DEFAULT_OG_IMAGE = "/opengraph-image";

export function getCanonicalUrl(path = "/"): string {
  const baseUrl = getAppBaseUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath === "/" ? "" : cleanPath}`;
}

export interface ConstructMetadataOptions {
  title?: string;
  description?: string;
  path?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  noIndex?: boolean;
}

/**
 * Builds standard, type-safe Next.js Metadata with OpenGraph, Twitter Cards,
 * canonical URLs, language alternates (fr/en/sw), and search crawler directives.
 */
export function constructMetadata(
  options: ConstructMetadataOptions = {}
): Metadata {
  const {
    title,
    description = DEFAULT_DESCRIPTION,
    path = "/",
    ogImage = DEFAULT_OG_IMAGE,
    ogType = "website",
    noIndex = false,
  } = options;

  const canonicalUrl = getCanonicalUrl(path);
  const resolvedTitle = title ? title : DEFAULT_TITLE;

  if (noIndex) {
    return {
      title: resolvedTitle,
      description,
      robots: {
        index: false,
        follow: false,
        nocache: true,
        googleBot: {
          index: false,
          follow: false,
          noimageindex: true,
        },
      },
    };
  }

  return {
    title: resolvedTitle,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        "fr-CD": canonicalUrl,
        "sw-CD": canonicalUrl,
        "en-US": canonicalUrl,
      },
    },
    openGraph: {
      title: resolvedTitle,
      description,
      url: canonicalUrl,
      siteName: DEFAULT_SITE_NAME,
      locale: "fr_CD",
      alternateLocale: ["sw_CD", "en_US"],
      type: ogType,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: resolvedTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

