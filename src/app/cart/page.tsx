import { Suspense } from "react";
import type { Metadata } from "next";
import { SessionNavbar } from "@/components/home/header/session-navbar";
import { Footer } from "@/components/home/footer/footer";
import { CartView } from "@/components/cart/cart-view";
import { CartSkeleton } from "@/components/cart/cart-skeleton";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "Mon Panier",
  description:
    "Vérifiez vos articles de pressing et validez votre commande à Bukavu.",
  noIndex: true,
});

export default function CartPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SessionNavbar variant="solid" />
      <main className="flex-1 flex flex-col">
        <Suspense fallback={<CartSkeleton />}>
          <CartView />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
