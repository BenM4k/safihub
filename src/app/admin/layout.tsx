import { ReactNode } from "react";
import { guardAdminRoute } from "@/services/auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminNavTabs } from "@/components/admin/admin-nav-tabs";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await guardAdminRoute();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <AdminHeader />
      <AdminNavTabs />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
