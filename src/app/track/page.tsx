import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/services/auth";
import { getCustomerOrdersList } from "@/services/order";
import { Navbar } from "@/components/home/header/navbar";
import { Footer } from "@/components/home/footer/footer";
import { TrackLookupCard } from "@/components/track/track-lookup-card";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("track");
  return {
    title: `${t("searchTitle")} | SafiHub Bukavu`,
    description: t("searchSubtitle"),
  };
}

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
