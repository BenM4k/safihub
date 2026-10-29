import { Suspense } from "react";
import type { Metadata } from "next";
import { SessionNavbar } from "@/components/home/header/session-navbar";
import { Footer } from "@/components/home/footer/footer";
import { CartView } from "@/components/cart/cart-view";
import { CartSkeleton } from "@/components/cart/cart-skeleton";

export const metadata: Metadata = {
  title: "Mon panier | SafiHub",
  description:
    "Vérifiez vos articles de pressing et validez votre commande à Bukavu.",
};

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
