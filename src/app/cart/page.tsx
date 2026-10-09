import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { CartView } from "@/components/cart/cart-view";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("cart");
  return {
    title: `${t("title")} | SafiHub`,
    description: t("metaDescription"),
  };
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
