"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { HouseProfileHeader } from "./house-profile-header";
import { HouseExclusionsBanner } from "./house-exclusions-banner";
import { ServiceTabsNav } from "./service-tabs-nav";
import { CatalogueItemCard } from "./catalogue-item-card";
import { HouseCartDrawer } from "./house-cart-drawer";
import { SwitchHouseDialog } from "@/components/cart/switch-house-dialog";
import { useCartHydrated } from "@/lib/stores/use-cart-hydrated";
import { Button } from "@/components/ui/button";
import { getCartEstimateAction } from "@/actions/customer-order.actions";
import type { CustomerHouseDetailData, CustomerHouseCatalogueItem } from "@/dal";

interface HouseCatalogueViewProps {
  data: CustomerHouseDetailData;
}

export function HouseCatalogueView({ data }: HouseCatalogueViewProps) {
  const router = useRouter();
  const cart = useCartHydrated();
  const [activeServiceSlug, setActiveServiceSlug] = useState<string | null>(null);
  const [serverSubtotal, setServerSubtotal] = useState<number>(0);
  const [priceWarning, setPriceWarning] = useState<string | null>(null);

  const isCurrentHouse = cart.isHydrated && cart.houseId === data.house.id;

  const currentHouseItems = useMemo(
    () => (isCurrentHouse ? cart.items : []),
    [isCurrentHouse, cart.items]
  );

  // Re-estimate on cart changes from server (Task 5.5: server-calculated estimate)
  useEffect(() => {
    if (!isCurrentHouse || currentHouseItems.length === 0) {
      return;
    }

    let isMounted = true;
    getCartEstimateAction(
      data.house.id,
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
        if (res.data.priceChanges.length > 0) {
          setPriceWarning("Certains prix d'articles ont été mis à jour par l'atelier.");
        } else {
          setPriceWarning(null);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [data.house.id, currentHouseItems, isCurrentHouse, cart.customerNeighborhoodId]);

  const activeSubtotal = !isCurrentHouse || currentHouseItems.length === 0 ? 0 : serverSubtotal;

  const handleUpdateQuantity = (item: CustomerHouseCatalogueItem, delta: number) => {
    if (delta > 0) {
      cart.addItem(data.house.id, data.house.name, {
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

  const displayedItems = useMemo(() => {
    if (!activeServiceSlug) return data.items;
    return data.items.filter((item) => item.serviceSlug === activeServiceSlug);
  }, [data.items, activeServiceSlug]);

  const groupedByCategory = useMemo(() => {
    const groups = new Map<string, typeof displayedItems>();
    for (const it of displayedItems) {
      const cat = it.itemCategory || "Général";
      const list = groups.get(cat) || [];
      list.push(it);
      groups.set(cat, list);
    }
    return Array.from(groups.entries());
  }, [displayedItems]);

  const totalItemsCount = isCurrentHouse
    ? currentHouseItems.reduce((acc, it) => acc + it.quantity, 0)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-28">
      <SwitchHouseDialog />
      <HouseProfileHeader house={data.house} />
      <HouseExclusionsBanner exclusions={data.exclusions} />
      <ServiceTabsNav
        services={data.services}
        activeServiceSlug={activeServiceSlug}
        onSelectService={setActiveServiceSlug}
      />

      {cart.isHydrated && cart.houseId && cart.houseId !== data.house.id && cart.items.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-indigo-950">
            <div className="text-xs sm:text-sm">
              <span className="font-bold">Panier conservé ({cart.items.length} article(s)) :</span>{" "}
              Transférez directement les articles de votre panier vers {data.house.name} sans devoir les re-sélectionner.
            </div>
            <Button
              type="button"
              size="sm"
              className="font-bold bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
              onClick={() => {
                cart.transferCartToHouse(data.house.id, data.house.name, data.items);
              }}
            >
              Transférer mon panier vers ce pressing
            </Button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Tarifs & Articles disponibles
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Sélectionnez les vêtements et linges à confier à {data.house.name}.
            </p>
          </div>
          {priceWarning && (
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
              {priceWarning}
            </div>
          )}
        </div>

        {displayedItems.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-200">
            <p className="text-sm text-slate-500 font-medium">
              Aucun article configuré pour ce service dans cet établissement.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedByCategory.map(([category, items]) => (
              <section key={category}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 pl-1">
                  Catégorie : {category}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {items.map((item) => {
                    const inCartQty = isCurrentHouse
                      ? currentHouseItems.find((ci) => ci.houseItemId === item.houseItemId)?.quantity || 0
                      : 0;
                    return (
                      <CatalogueItemCard
                        key={item.houseItemId}
                        item={item}
                        quantityInCart={inCartQty}
                        onUpdateQuantity={(delta) => handleUpdateQuantity(item, delta)}
                      />
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      <HouseCartDrawer
        totalItemsCount={totalItemsCount}
        subtotalCdf={activeSubtotal}
        minimumOrderAmount={data.house.minimumOrderAmount}
        onProceedOrder={() => router.push("/checkout")}
        houseName={data.house.name}
      />
    </div>
  );
}
