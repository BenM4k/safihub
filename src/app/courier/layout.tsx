import { ReactNode } from "react";
import { guardCourierRoute } from "@/services/auth";
import { CourierHeader } from "@/components/courier/courier-header";
import { CourierNavTabs } from "@/components/courier/courier-nav-tabs";
import { CourierPwaRegistrar } from "@/components/courier/courier-pwa-registrar";

export default async function CourierLayout({
  children,
}: {
  children: ReactNode;
}) {
  const auth = await guardCourierRoute();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-900 pb-16">
      <CourierPwaRegistrar />
      <CourierHeader courierName={auth.user.name || "Coursier"} />
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-4">
        {children}
      </main>
      <CourierNavTabs />
    </div>
  );
}
