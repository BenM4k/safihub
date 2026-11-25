import { ReactNode } from "react";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { guardAdminRoute } from "@/services/auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { constructMetadata } from "@/lib/seo";

const ADMIN_CLIENT_NAMESPACES = [
  "admin",
  "appShell",
  "auth",
  "common",
  "errors",
  "mapLocation",
  "notifications",
  "preferences",
] as const;

export const metadata: Metadata = constructMetadata({
  title: "Console Opérations Admin",
  description: "Console d'administration SafiHub Bukavu.",
  noIndex: true,
});

// instant = false: kept on purpose — authenticated admin operations console
export const instant = false;

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await guardAdminRoute();

  const [locale, messages] = await Promise.all([getLocale(), getMessages()]);
  const raw = messages as Record<string, unknown>;
  const adminMessages: Record<string, unknown> = {};
  for (const ns of ADMIN_CLIENT_NAMESPACES) {
    if (ns in raw) {
      adminMessages[ns] = raw[ns];
    }
  }

  return (
    <NextIntlClientProvider locale={locale} messages={adminMessages}>
      <div className="min-h-screen bg-surface/50 text-foreground flex font-sans">
        <div className="hidden md:block shrink-0 sticky top-0 h-screen">
          <AdminSidebar className="h-full" />
        </div>
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader />
          <main className="flex-1 min-w-0 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {children}
          </main>
        </div>
      </div>
    </NextIntlClientProvider>
  );
}
