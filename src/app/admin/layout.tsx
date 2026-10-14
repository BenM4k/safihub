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
  );
}
