"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Store } from "lucide-react";
import { useCartHydrated } from "@/lib/stores/use-cart-hydrated";
import { Button } from "@/components/ui/button";

export function CartView() {
  const t = useTranslations("cart");
  const router = useRouter();
  const cart = useCartHydrated();

  if (!cart.isHydrated) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const items = cart.items;
  const hasItems = items.length > 0;
  const subtotalCdf = items.reduce(
    (acc, it) => acc + (it.expectedUnitPrice || 0) * it.quantity,
    0
  );
  const subtotalUsd = (subtotalCdf / 2800).toFixed(2);

  if (!hasItems) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100dvh-14rem)] py-12 px-4 text-center">
        <div className="max-w-md w-full p-8 sm:p-10 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col items-center">
          <div className="size-16 sm:size-20 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mb-5 shadow-2xs">
            <ShoppingBag className="size-8 sm:size-10" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{t("empty")}</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 mb-6 max-w-xs">{t("emptyDesc")}</p>
          <Button asChild size="lg" className="rounded-xl font-bold shadow-sm w-full sm:w-auto px-6">
            <Link href="/houses">{t("browseHouses")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto py-8 sm:py-10 px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-5 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">{t("title")}</h1>
          {cart.houseName && (
            <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5 mt-1">
              <Store className="size-3.5 text-primary shrink-0" />
              <span>{t("houseNotice", { houseName: cart.houseName })}</span>
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => cart.clearCart()}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 w-fit cursor-pointer"
        >
          <Trash2 className="size-3.5 mr-1.5" />
          {t("clearCart")}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Cart items list */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          <div className="divide-y divide-slate-100 bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            {items.map((item) => {
              const itemTotal = (item.expectedUnitPrice || 0) * item.quantity;
              return (
                <div key={item.houseItemId} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {item.itemName || t("itemFallback")}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.fabricName || ""} {item.serviceName ? `• ${item.serviceName}` : ""}
                    </p>
                    <p className="text-xs font-mono font-medium text-primary mt-1">
                      {(item.expectedUnitPrice || 0).toLocaleString("fr-FR")} CDF
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                      <button
                        type="button"
                        onClick={() => cart.updateQuantity(item.houseItemId, -1)}
                        className="size-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 cursor-pointer"
                        aria-label={t("decreaseQuantity")}
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold font-mono text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => cart.updateQuantity(item.houseItemId, 1)}
                        className="size-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 cursor-pointer"
                        aria-label={t("increaseQuantity")}
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>

                    <div className="w-24 sm:w-28 text-right">
                      <p className="text-xs sm:text-sm font-bold font-mono text-slate-900">
                        {itemTotal.toLocaleString("fr-FR")} CDF
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order summary sidebar */}
        <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 space-y-4">
          <div className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              {t("total")}
            </h2>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{t("subtotal")}</span>
              <span className="font-mono font-bold text-slate-900">
                {subtotalCdf.toLocaleString("fr-FR")} CDF
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{t("usdEstimate")}</span>
              <span className="font-mono">${subtotalUsd}</span>
            </div>
            <Button
              onClick={() => router.push("/checkout")}
              className="w-full mt-4 h-12 rounded-xl text-sm font-bold shadow-md gap-2 cursor-pointer"
            >
              {t("proceedToCheckout")}
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
