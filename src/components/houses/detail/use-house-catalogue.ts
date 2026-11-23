import { useMemo } from "react";
import type { NeighborhoodOption } from "./pressing-delivery-selector";
import type { CustomerHouseCatalogueItem, NeighborhoodRecord } from "@/dal";
import type { useCartHydrated } from "@/lib/stores/use-cart-hydrated";

export function useHouseCatalogue(
  houseId: string,
  houseName: string,
  neighborhoods: NeighborhoodRecord[],
  zoneFees: Record<string, number>,
  cart: ReturnType<typeof useCartHydrated>,
) {
  const neighborhoodOptions: NeighborhoodOption[] = useMemo(() => {
    return neighborhoods.map((n) => {
      const isServed = n.status === "served";
      const fee = isServed ? (zoneFees[n.zoneId] ?? 3000) : null;
      return {
        id: n.id,
        name: n.name,
        zoneId: n.zoneId,
        isServed,
        deliveryFeeCdf: fee,
      };
    });
  }, [neighborhoods, zoneFees]);

  const selectedNeighborhood = neighborhoodOptions.find(
    (n) => n.id === cart.customerNeighborhoodId,
  );

  const handleUpdateQuantity = (
    item: CustomerHouseCatalogueItem,
    delta: number,
  ) => {
    if (delta > 0) {
      cart.addItem(houseId, houseName, {
        houseItemId: item.houseItemId,
        serviceId: item.serviceId,
        itemId: item.itemId,
        fabricId: item.fabricId,
        itemName: item.itemNameFr,
        fabricName: item.fabricNameFr,
        serviceName: item.serviceNameFr,
        expectedUnitPrice: item.priceCdf,
        quantity: delta,
      });
    } else {
      cart.updateQuantity(item.houseItemId, delta);
    }
  };

  return {
    neighborhoodOptions,
    selectedNeighborhood,
    handleUpdateQuantity,
  };
}
