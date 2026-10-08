import { ReactNode } from "react";
import { guardAdminRoute } from "@/services/auth";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await guardAdminRoute();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
