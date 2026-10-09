import type { Metadata } from "next";
import { Navbar } from "@/components/home/header/navbar";
import { Footer } from "@/components/home/footer/footer";
import { getCurrentUser } from "@/services/auth";
import { getCustomerAddresses, getNeighborhoods } from "@/dal";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata: Metadata = {
  title: "Commander votre pressing | SafiHub Bukavu",
  description:
    "Finalisez votre commande de pressing à Bukavu avec collecte et livraison à domicile.",
};

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  const [savedAddresses, neighborhoods] = await Promise.all([
    user ? getCustomerAddresses(user.id) : Promise.resolve([]),
    getNeighborhoods(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Navbar variant="solid" user={user} />
      <main className="flex-1 py-10 px-4 sm:px-6">
        <CheckoutForm
          user={user}
          savedAddresses={savedAddresses}
          neighborhoods={neighborhoods}
        />
      </main>
      <Footer />
    </div>
  );
}
