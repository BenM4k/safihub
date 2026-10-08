import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { LanguageSwitcher } from "@/components/common/language-switcher";
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
    <html lang={locale} className={`${jakarta.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
          <LanguageSwitcher />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}


