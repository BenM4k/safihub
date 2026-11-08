import { ReactNode } from "react";
import type { Metadata } from "next";
import { guardCourierRoute } from "@/services/auth";
import { CourierHeader } from "@/components/courier/courier-header";
import { CourierNavTabs } from "@/components/courier/courier-nav-tabs";
import { CourierPwaRegistrar } from "@/components/courier/courier-pwa-registrar";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "Espace Coursier",
  description: "Application mobile de collecte et livraison SafiHub pour coursiers.",
  noIndex: true,
});

// instant = false: kept on purpose — authenticated courier workspace
export const instant = false;

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
