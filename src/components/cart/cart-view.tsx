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
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="size-16 mx-auto rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
          <ShoppingBag className="size-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">{t("empty")}</h1>
        <p className="text-sm text-slate-500 mt-1 mb-6">{t("emptyDesc")}</p>
        <Button asChild className="rounded-xl font-semibold">
          <Link href="/houses">{t("browseHouses")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t("title")}</h1>
          {cart.houseName && (
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
              <Store className="size-3.5 text-primary" />
              <span>{t("houseNotice", { houseName: cart.houseName })}</span>
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => cart.clearCart()}
          className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
        >
          <Trash2 className="size-3.5 mr-1" />
          {t("clearCart")}
        </Button>
      </div>

      <div className="divide-y divide-slate-100 bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {items.map((item) => {
          const itemTotal = (item.expectedUnitPrice || 0) * item.quantity;
          return (
            <div key={item.houseItemId} className="p-4 flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {item.itemName || "Item"}
                </p>
                <p className="text-xs text-slate-500">
                  {item.fabricName || ""} {item.serviceName ? `• ${item.serviceName}` : ""}
                </p>
                <p className="text-xs font-mono font-medium text-primary mt-1">
                  {(item.expectedUnitPrice || 0).toLocaleString("fr-FR")} CDF
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                  <button
                    type="button"
                    onClick={() => cart.updateQuantity(item.houseItemId, -1)}
                    className="size-7 flex items-center justify-center text-slate-600 hover:bg-slate-200"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="size-3" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold font-mono text-slate-800">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => cart.updateQuantity(item.houseItemId, 1)}
                    className="size-7 flex items-center justify-center text-slate-600 hover:bg-slate-200"
                    aria-label="Increase quantity"
                  >
                    <Plus className="size-3" />
                  </button>
                </div>

                <div className="w-24 text-right">
                  <p className="text-xs font-bold font-mono text-slate-900">
                    {itemTotal.toLocaleString("fr-FR")} CDF
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">{t("subtotal")}</span>
          <span className="font-mono font-bold text-slate-900">
            {subtotalCdf.toLocaleString("fr-FR")} CDF
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>~ USD (1$ = 2 800 CDF)</span>
          <span className="font-mono">${subtotalUsd}</span>
        </div>
        <Button
          onClick={() => router.push("/checkout")}
          className="w-full mt-4 h-12 rounded-xl text-sm font-bold shadow-md gap-2"
        >
          {t("proceedToCheckout")}
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
