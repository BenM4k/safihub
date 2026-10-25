import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { CustomerBottomNav } from "@/components/customer/customer-bottom-nav";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// One variable font for display + body keeps the payload small on 3G.
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SafiHub — Pressing & Blanchisserie à la demande à Bukavu",
  description:
    "Le pressing moderne à Bukavu avec collecte et livraison à domicile en 24h-48h. Double comptage au seuil, photos d'état et paiement Cash on Delivery en CDF et USD.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${jakarta.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=localStorage.getItem("safihub_preferences");var j=p?JSON.parse(p):null;var t=(j&&j.theme)||localStorage.getItem("safihub_theme")||"system";var d=t==="dark"||((!t||t==="system")&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(d)document.documentElement.classList.add("dark");if(j){if(j.textSize&&j.textSize!=="default")document.documentElement.classList.add("text-size-"+j.textSize);if(j.highContrast)document.documentElement.classList.add("high-contrast");if(j.calmMotion)document.documentElement.classList.add("reduce-motion");if(j.readingFocus)document.documentElement.classList.add("reading-focus");if(j.easierToSee)document.documentElement.classList.add("easier-to-see");}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col pb-16 md:pb-0">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <TooltipProvider>
            {children}
            <CustomerBottomNav />
            <LanguageSwitcher />
            <Toaster position="bottom-center" />
          </TooltipProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}


