import { ReactNode } from "react";
import { getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";

export default async function PartnerRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const messages = await getMessages();
  const houseMessages = messages.house ? { house: messages.house } : {};

  return (
    <NextIntlClientProvider messages={houseMessages}>
      {children}
    </NextIntlClientProvider>
  );
}

