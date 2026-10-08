"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore, type CartItem } from "@/lib/stores/cart-store";
import type { OrderDetailRecord, OrderItemRecord } from "@/dal";

interface ExpiredSwitchCardProps {
  order: OrderDetailRecord;
  items: OrderItemRecord[];
}

export function ExpiredSwitchCard({ order, items }: ExpiredSwitchCardProps) {
  const router = useRouter();
  const t = useTranslations("orders");
  const restoreCartFromOrder = useCartStore((s) => s.restoreCartFromOrder);

  if (order.status !== "expired") return null;

  const handleSwitchHouse = () => {
    const cartItems: CartItem[] = items.map((i) => ({
      houseItemId: i.houseItemId || i.id,
      serviceId: i.serviceId || "",
      itemId: i.itemId || "",
      fabricId: i.fabricId || "",
      itemName: i.itemNameFr || undefined,
      fabricName: i.fabricNameFr || undefined,
      serviceName: i.serviceNameFr || undefined,
      quantity: i.declaredQuantity,
      expectedUnitPrice: i.unitPrice,
    }));

    restoreCartFromOrder(order.houseId, order.houseName || "Pressing", cartItems);
    router.push(`/houses?neighborhoodId=${order.neighborhoodId}`);
  };

  return (
    <div className="bg-amber-50/80 rounded-3xl border border-amber-200 p-5 sm:p-6 text-amber-950 space-y-4">
      <div className="flex items-start gap-3">
        <Clock className="size-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm">
          <p className="font-bold text-amber-900">{t("expiredTitle")}</p>
          <p className="text-amber-800/90 mt-1 leading-relaxed">
            {t("expiredDesc")}
          </p>
        </div>
      </div>

      <Button
        type="button"
        onClick={handleSwitchHouse}
        className="w-full sm:w-auto font-black bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm"
      >
        <span>{t("switchHouseButton")}</span>
        <ArrowRight className="size-4 ml-2" />
      </Button>
    </div>
  );
}
