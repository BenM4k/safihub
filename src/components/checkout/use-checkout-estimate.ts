"use client";

import { useEffect, useState } from "react";
import { getCartEstimateAction } from "@/actions/customer-order.actions";
import type { CartLineItemInput } from "@/services/order/validation";

interface UseCheckoutEstimateParams {
  isHydrated: boolean;
  houseId: string | null | undefined;
  items: CartLineItemInput[];
  neighborhoodId: string | null | undefined;
}

export function useCheckoutEstimate({
  isHydrated,
  houseId,
  items,
  neighborhoodId,
}: UseCheckoutEstimateParams) {
  const [estimate, setEstimate] = useState<{ subtotalCdf: number; deliveryFeeCdf: number }>({
    subtotalCdf: 0,
    deliveryFeeCdf: 0,
  });

  useEffect(() => {
    if (!isHydrated || !houseId || items.length === 0) return;

    let isMounted = true;

    getCartEstimateAction(
      houseId,
      items.map((i) => ({
        houseItemId: i.houseItemId,
        serviceId: i.serviceId,
        itemId: i.itemId,
        fabricId: i.fabricId,
        quantity: i.quantity,
        expectedUnitPrice: i.expectedUnitPrice,
      })),
      neighborhoodId || undefined
    ).then((res) => {
      if (isMounted && res.success && res.data) {
        setEstimate({
          subtotalCdf: res.data.itemsTotal,
          deliveryFeeCdf: res.data.deliveryFee,
        });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isHydrated, houseId, items, neighborhoodId]);

  return {
    subtotalCdf: estimate.subtotalCdf,
    deliveryFeeCdf: estimate.deliveryFeeCdf,
    totalDue: estimate.subtotalCdf + estimate.deliveryFeeCdf,
  };
}
