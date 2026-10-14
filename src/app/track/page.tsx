import type { Metadata } from "next";
import { getCurrentUser } from "@/services/auth";
import { getCustomerOrdersList } from "@/services/order";
import { Navbar } from "@/components/home/header/navbar";
import { Footer } from "@/components/home/footer/footer";
import { TrackLookupCard } from "@/components/track/track-lookup-card";

export const metadata: Metadata = {
  title: "Suivre une commande | SafiHub Bukavu",
  description:
    "Suivez l'état de votre commande de pressing en temps réel à Bukavu grâce à votre lien ou jeton de suivi.",
};

export default async function TrackLookupPage() {
  const user = await getCurrentUser();
  const orders = user ? await getCustomerOrdersList(user.id) : [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Navbar variant="solid" user={user} />
      <main className="flex-1 flex flex-col">
        <TrackLookupCard recentOrders={orders} />
      </main>
      <Footer />
    </div>
  );
}
