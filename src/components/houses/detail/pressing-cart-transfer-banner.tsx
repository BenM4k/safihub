"use client";

import { Button } from "@/components/ui/button";
import type { CustomerHouseCatalogueItem } from "@/dal";

interface PressingCartTransferBannerProps {
  houseId: string;
  houseName: string;
  items: CustomerHouseCatalogueItem[];
  cartHouseId: string | null;
  cartItemsCount: number;
  isHydrated: boolean;
  onTransfer: (houseId: string, houseName: string, items: CustomerHouseCatalogueItem[]) => void;
}

export function PressingCartTransferBanner({
  houseId,
  houseName,
  items,
  cartHouseId,
  cartItemsCount,
  isHydrated,
  onTransfer,
}: PressingCartTransferBannerProps) {
  if (!isHydrated || !cartHouseId || cartHouseId === houseId || cartItemsCount === 0) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
      <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-foreground">
        <div className="text-xs sm:text-sm">
          <span className="font-bold text-heading">Panier conservé ({cartItemsCount} article(s)) :</span>{" "}
          Transférez les articles vers {houseName} en recalculant les tarifs.
        </div>
        <Button
          type="button"
          size="sm"
          className="font-bold bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 rounded-lg"
          onClick={() => onTransfer(houseId, houseName, items)}
        >
          Transférer mon panier
        </Button>
      </div>
    </div>
  );
}
