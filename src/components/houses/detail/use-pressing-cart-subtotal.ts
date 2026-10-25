"use client";

import { useEffect, useMemo, useState } from "react";
import { getCartEstimateAction } from "@/actions/customer-order.actions";
import type { useCartHydrated } from "@/lib/stores/use-cart-hydrated";

export function usePressingCartSubtotal(
  houseId: string,
  cart: ReturnType<typeof useCartHydrated>
) {
  const [serverSubtotal, setServerSubtotal] = useState(0);

  const isCurrentHouse = cart.isHydrated && cart.houseId === houseId;
  const currentHouseItems = useMemo(
    () => (isCurrentHouse ? cart.items : []),
    [isCurrentHouse, cart.items]
  );

  // Cart server estimate re-calculation
  useEffect(() => {
    if (!isCurrentHouse || currentHouseItems.length === 0) {
      return;
    }
    let isMounted = true;
    getCartEstimateAction(
      houseId,
      currentHouseItems.map((i) => ({
        houseItemId: i.houseItemId,
        serviceId: i.serviceId,
        itemId: i.itemId,
        fabricId: i.fabricId,
        quantity: i.quantity,
        expectedUnitPrice: i.expectedUnitPrice,
      })),
      cart.customerNeighborhoodId || undefined
    ).then((res) => {
      if (isMounted && res.success && res.data) {
        setServerSubtotal(res.data.itemsTotal);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [houseId, currentHouseItems, isCurrentHouse, cart.customerNeighborhoodId]);

  const activeSubtotal = !isCurrentHouse || currentHouseItems.length === 0 ? 0 : serverSubtotal;
  const totalItemsCount = isCurrentHouse
    ? currentHouseItems.reduce((acc, it) => acc + it.quantity, 0)
    : 0;
  const getQuantityInCart = (hId: string) =>
    isCurrentHouse ? currentHouseItems.find((ci) => ci.houseItemId === hId)?.quantity || 0 : 0;

  return {
    isCurrentHouse,
    currentHouseItems,
    activeSubtotal,
    totalItemsCount,
    getQuantityInCart,
  };
}
