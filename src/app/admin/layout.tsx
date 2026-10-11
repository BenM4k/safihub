import { ReactNode } from "react";
import { guardAdminRoute } from "@/services/auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await guardAdminRoute();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <AdminHeader />
      <div className="flex-1 flex w-full">
        <div className="hidden md:block shrink-0 sticky top-16 h-[calc(100vh-4rem)]">
          <AdminSidebar className="h-full" />
        </div>
        <main className="flex-1 min-w-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
