import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/services/auth";
import { Navbar } from "@/components/home/header/navbar";
import { Footer } from "@/components/home/footer/footer";
import { CartView } from "@/components/cart/cart-view";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("cart");
  return {
    title: `${t("title")} | SafiHub`,
    description: t("metaDescription"),
  };
}

export default async function CartPage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Navbar variant="solid" user={user} />
      <main className="flex-1 flex flex-col">
        <Suspense
          fallback={
            <div className="flex-1 min-h-[50vh] flex items-center justify-center">
              <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          }
        >
          <CartView />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
