import type { Metadata } from "next";
import { Suspense } from "react";
import { CartView } from "@/components/cart/cart-view";

export const metadata: Metadata = {
  title: "Cart | SafiHub",
  description: "View and manage items in your laundry cart",
};

export default function CartPage() {
  return (
    <main className="min-h-screen bg-slate-50/50">
      <Suspense
        fallback={
          <div className="min-h-[50vh] flex items-center justify-center">
            <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        }
      >
        <CartView />
      </Suspense>
    </main>
  );
}
