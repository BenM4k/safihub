import { Suspense } from "react";
import type { Metadata } from "next";
import { getCurrentUser } from "@/services/auth";
import { getCustomerOrdersList } from "@/services/order";
import { SessionNavbar } from "@/components/home/header/session-navbar";
import { Footer } from "@/components/home/footer/footer";
import { TrackLookupCard } from "@/components/track/track-lookup-card";
import { constructMetadata } from "@/lib/seo";
import { createBreadcrumbJsonLd } from "@/lib/json-ld";

export const metadata: Metadata = constructMetadata({
  title: "Suivre une Commande de Pressing en Direct",
  description:
    "Saisissez votre code de suivi unique reçu par SMS ou WhatsApp pour suivre en temps réel le traitement et la livraison de votre linge à Bukavu.",
  path: "/track",
});

async function TrackLookupContent() {
  const user = await getCurrentUser();
  const orders = user ? await getCustomerOrdersList(user.id) : [];
  return <TrackLookupCard recentOrders={orders} />;
}

export default function TrackLookupPage() {
  const breadcrumbsJsonLd = createBreadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Suivi de commande", path: "/track" },
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
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
