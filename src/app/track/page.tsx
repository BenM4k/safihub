import { Suspense } from "react";
import type { Metadata } from "next";
import { getCurrentUser } from "@/services/auth";
import { getCustomerOrdersList } from "@/services/order";
import { SessionNavbar } from "@/components/home/header/session-navbar";
import { Footer } from "@/components/home/footer/footer";
import { TrackLookupCard } from "@/components/track/track-lookup-card";

export const metadata: Metadata = {
  title: "Suivre une commande | SafiHub Bukavu",
  description:
    "Saisissez votre code de suivi unique (envoyé par SMS/WhatsApp) ou collez votre lien pour voir l'avancement en direct.",
};

async function TrackLookupContent() {
  const user = await getCurrentUser();
  const orders = user ? await getCustomerOrdersList(user.id) : [];
  return <TrackLookupCard recentOrders={orders} />;
}

export default function TrackLookupPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SessionNavbar variant="solid" />
      <main className="flex-1 flex flex-col">
        <Suspense fallback={<TrackLookupCard recentOrders={[]} />}>
          <TrackLookupContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
