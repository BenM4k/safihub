"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { HouseProfileHeader } from "./house-profile-header";
import { HouseExclusionsBanner } from "./house-exclusions-banner";
import { ServiceTabsNav } from "./service-tabs-nav";
import { CatalogueItemCard } from "./catalogue-item-card";
import { HouseCartDrawer } from "./house-cart-drawer";
import type { CustomerHouseDetailData } from "@/dal";

interface HouseCatalogueViewProps {
  data: CustomerHouseDetailData;
}

export function HouseCatalogueView({ data }: HouseCatalogueViewProps) {
  const router = useRouter();
  const [activeServiceSlug, setActiveServiceSlug] = useState<string | null>(null);
  const [cartQuantities, setCartQuantities] = useState<Record<string, number>>({});

  const handleUpdateQuantity = (houseItemId: string, delta: number) => {
    setCartQuantities((prev) => {
      const current = prev[houseItemId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[houseItemId];
        return copy;
      }
      return { ...prev, [houseItemId]: next };
    });
  };

  // Filter catalogue items by active service slug
  const displayedItems = useMemo(() => {
    if (!activeServiceSlug) return data.items;
    return data.items.filter((item) => item.serviceSlug === activeServiceSlug);
  }, [data.items, activeServiceSlug]);

  // Group items by category (tops, bottoms, suits, bedding, etc.)
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

  // Cart summary calculations
  const { totalItemsCount, subtotalCdf } = useMemo(() => {
    let count = 0;
    let total = 0;

    for (const [houseItemId, qty] of Object.entries(cartQuantities)) {
      if (qty <= 0) continue;
      count += qty;
      const found = data.items.find((it) => it.houseItemId === houseItemId);
      if (found) {
        total += found.priceCdf * qty;
      }
    }

    return { totalItemsCount: count, subtotalCdf: total };
  }, [cartQuantities, data.items]);

  const handleProceedOrder = () => {
    // Save to local session cart or navigate to checkout
    if (typeof window !== "undefined") {
      const cartPayload = {
        houseId: data.house.id,
        houseName: data.house.name,
        subtotalCdf,
        items: Object.entries(cartQuantities).map(([houseItemId, quantity]) => {
          const it = data.items.find((i) => i.houseItemId === houseItemId);
          return {
            houseItemId,
            serviceId: it?.serviceId,
            itemId: it?.itemId,
            fabricId: it?.fabricId,
            itemName: it?.itemNameFr,
            fabricName: it?.fabricNameFr,
            serviceName: it?.serviceNameFr,
            priceCdf: it?.priceCdf,
            quantity,
          };
        }),
      };
      sessionStorage.setItem("safihub_cart", JSON.stringify(cartPayload));
    }
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-28">
      {/* House Profile Header */}
      <HouseProfileHeader house={data.house} />

      {/* House Exclusions Banner */}
      <HouseExclusionsBanner exclusions={data.exclusions} />

      {/* Service Tabs Navigation */}
      <ServiceTabsNav
        services={data.services}
        activeServiceSlug={activeServiceSlug}
        onSelectService={setActiveServiceSlug}
      />

      {/* Main Catalogue Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Tarifs & Articles disponibles
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Sélectionnez les vêtements et linges à confier à {data.house.name}.
          </p>
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
                  {items.map((item) => (
                    <CatalogueItemCard
                      key={item.houseItemId}
                      item={item}
                      quantityInCart={cartQuantities[item.houseItemId] || 0}
                      onUpdateQuantity={(delta) =>
                        handleUpdateQuantity(item.houseItemId, delta)
                      }
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {/* Sticky Bottom Cart Drawer */}
      <HouseCartDrawer
        totalItemsCount={totalItemsCount}
        subtotalCdf={subtotalCdf}
        minimumOrderAmount={data.house.minimumOrderAmount}
        onProceedOrder={handleProceedOrder}
        houseName={data.house.name}
      />
    </div>
  );
}
