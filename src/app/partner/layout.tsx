import { ReactNode } from "react";
import { getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";

export default async function PartnerRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const messages = await getMessages();
  const raw = messages as Record<string, unknown>;
  const adminObj = raw.admin as Record<string, unknown> | undefined;
  const partnerMessages: Record<string, unknown> = { ...raw };

  // Strip the bulky admin namespace (~63KB) while keeping `admin.shared`
  // for shared UI primitives (e.g., ConfirmDialog, EmptyState) reused in partner screens.
  if (adminObj?.shared) {
    partnerMessages.admin = { shared: adminObj.shared };
  } else {
    delete partnerMessages.admin;
  }

  return (
    <NextIntlClientProvider messages={partnerMessages}>
      {children}
    </NextIntlClientProvider>
  );
}

