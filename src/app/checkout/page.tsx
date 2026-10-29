import { Suspense } from "react";
import type { Metadata } from "next";
import { SessionNavbar } from "@/components/home/header/session-navbar";
import { Footer } from "@/components/home/footer/footer";
import { getCurrentUser } from "@/services/auth";
import { getCustomerAddresses } from "@/dal";
import { getCachedNeighborhoods } from "@/lib/cached-data";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { CheckoutSkeleton } from "@/components/checkout/checkout-skeleton";

export const metadata: Metadata = {
  title: "Commander votre pressing | SafiHub Bukavu",
  description:
    "Finalisez votre commande de pressing à Bukavu avec collecte et livraison à domicile.",
};

async function CheckoutContent() {
  const user = await getCurrentUser();
  const [savedAddresses, neighborhoods] = await Promise.all([
    user ? getCustomerAddresses(user.id) : Promise.resolve([]),
    getCachedNeighborhoods(),
  ]);

  return (
    <CheckoutForm
      user={user}
      savedAddresses={savedAddresses}
      neighborhoods={neighborhoods}
    />
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SessionNavbar variant="solid" />
      <main className="flex-1 flex flex-col py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<CheckoutSkeleton />}>
          <CheckoutContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
