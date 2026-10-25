import { useMemo } from "react";
import type { NeighborhoodOption } from "./pressing-delivery-selector";
import type { CustomerHouseCatalogueItem } from "@/dal";
import type { useCartHydrated } from "@/lib/stores/use-cart-hydrated";

export function useHouseCatalogue(
  houseId: string,
  houseName: string,
  neighborhoods: Array<{ id: string; name: string; zoneId: string }>,
  zoneFees: Record<string, number>,
  cart: ReturnType<typeof useCartHydrated>
) {
  const neighborhoodOptions: NeighborhoodOption[] = useMemo(() => {
    return neighborhoods.map((n) => {
      const fee = zoneFees[n.zoneId] ?? 3000;
      return {
        id: n.id,
        name: n.name,
        zoneId: n.zoneId,
        isServed: true,
        deliveryFeeCdf: fee,
      };
    });
  }, [neighborhoods, zoneFees]);

  const selectedNeighborhood = neighborhoodOptions.find(
    (n) => n.id === cart.customerNeighborhoodId
  );

  const handleUpdateQuantity = (item: CustomerHouseCatalogueItem, delta: number) => {
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
