import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { CustomerBottomNav } from "@/components/customer/customer-bottom-nav";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { Spinner } from "@/components/ui/spinner";
import { DEFAULT_LOCALE } from "@/i18n/config";
import { getAppBaseUrl } from "@/lib/app-url";
import { createOrganizationJsonLd, createWebSiteJsonLd } from "@/lib/json-ld";
import "./globals.css";

// One variable font for display + body keeps the payload small on 3G.
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const baseUrl = getAppBaseUrl();

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2824D5",
};

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "SafiHub — Pressing & Blanchisserie à la demande à Bukavu",
    template: "%s | SafiHub",
  },
  description:
    "Le pressing moderne à Bukavu avec collecte et livraison à domicile en 24h-48h. Double comptage au seuil, photos d'état et paiement Cash on Delivery en CDF et USD.",
  applicationName: "SafiHub",
  authors: [{ name: "SafiHub Team" }],
  creator: "SafiHub",
  publisher: "SafiHub",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
    languages: {
      "fr-CD": "/",
      "sw-CD": "/",
      "en-US": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_CD",
    alternateLocale: ["sw_CD", "en_US"],
    url: baseUrl,
    siteName: "SafiHub",
    title: "SafiHub — Pressing & Blanchisserie à la demande à Bukavu",
    description:
      "Le pressing moderne à Bukavu avec collecte et livraison à domicile en 24h-48h. Double comptage au seuil, photos d'état et paiement Cash on Delivery.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "SafiHub — Pressing & Blanchisserie à Bukavu",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SafiHub — Pressing & Blanchisserie à Bukavu",
    description:
      "Le pressing moderne à Bukavu avec collecte et livraison à domicile en 24h-48h.",
    images: ["/opengraph-image"],
  },
  icons: {
    icon: [
      {
        url: "/favicon-light.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/favicon-dark.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/favicon.ico",
        sizes: "any",
      },
    ],
    apple: [
      {
        url: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
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

async function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, messages] = await Promise.all([getLocale(), getMessages()]);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <TooltipProvider>
        {children}
        <Suspense fallback={null}>
          <CustomerBottomNav />
        </Suspense>
        <LanguageSwitcher />
        <Toaster position="bottom-center" />
      </TooltipProvider>
    </NextIntlClientProvider>
  );
}

function RootLoadingFallback() {
  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center p-6">
      <Spinner className="size-8 text-primary" />
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang={DEFAULT_LOCALE}
      className={`${jakarta.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(createOrganizationJsonLd()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(createWebSiteJsonLd()),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=document.cookie.match(/(?:^|; )NEXT_LOCALE=([^;]*)/);var l=m?decodeURIComponent(m[1]):"";if(l==="fr"||l==="en"||l==="sw")document.documentElement.lang=l;var p=localStorage.getItem("safihub_preferences");var j=p?JSON.parse(p):null;var t=(j&&j.theme)||localStorage.getItem("safihub_theme")||"system";var d=t==="dark"||((!t||t==="system")&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(d)document.documentElement.classList.add("dark");if(j){if(j.textSize&&j.textSize!=="default")document.documentElement.classList.add("text-size-"+j.textSize);if(j.highContrast)document.documentElement.classList.add("high-contrast");if(j.calmMotion)document.documentElement.classList.add("reduce-motion");if(j.readingFocus)document.documentElement.classList.add("reading-focus");if(j.easierToSee)document.documentElement.classList.add("easier-to-see");}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col pb-16 md:pb-0">
        <Suspense fallback={<RootLoadingFallback />}>
          <LocaleProvider>{children}</LocaleProvider>
        </Suspense>
      </body>
    </html>
  );
}
