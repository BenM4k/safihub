"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { HouseDetailsHeader } from "./house-details-header";
import { HouseTabInfo } from "./house-tab-info";
import { HouseTabSettings } from "./house-tab-settings";
import { HouseTabOrders } from "./house-tab-orders";
import { HouseTabSettlements } from "./house-tab-settlements";
import { HouseTabHistory } from "./house-tab-history";
import { cn } from "@/lib/utils";
import type { AdminHouseRow } from "../types";

export type HouseDetailsTab = "info" | "settings" | "orders" | "settlements" | "history";

interface HouseDetailsSheetProps {
  house: AdminHouseRow | null;
  onClose: () => void;
  defaultCommissionBps: number;
  onToggleStatus: (house: AdminHouseRow) => void;
  onRefresh: () => void;
  initialTab?: HouseDetailsTab;
}

const TABS: { id: HouseDetailsTab; label: string }[] = [
  { id: "info", label: "Informations" },
  { id: "settings", label: "Paramètres" },
  { id: "orders", label: "Commandes" },
  { id: "settlements", label: "Règlements" },
  { id: "history", label: "Historique" },
];

export function HouseDetailsSheet({
  house,
  onClose,
  defaultCommissionBps,
  onToggleStatus,
  onRefresh,
  initialTab = "info",
}: HouseDetailsSheetProps) {
  const [activeTab, setActiveTab] = useState<HouseDetailsTab>(initialTab);

  if (!house) return null;

  return (
    <Sheet open={!!house} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg p-0 flex flex-col gap-0 border-l border-border bg-background"
      >
        <SheetTitle className="sr-only">{house.name}</SheetTitle>
        <HouseDetailsHeader house={house} onClose={onClose} />

        {/* Navigation Tabs - Borderless, text-primary active tab */}
        <div className="flex items-center gap-4 px-5 pt-3 overflow-x-auto scrollbar-none">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "py-2 text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5",
                  isActive
                    ? "text-primary font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span>{tab.label}</span>
                {tab.id === "orders" && house.activeOrdersCount > 0 && (
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {house.activeOrdersCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === "info" && (
            <HouseTabInfo
              house={house}
              onToggleStatus={() => onToggleStatus(house)}
            />
          )}

          {activeTab === "settings" && (
            <HouseTabSettings
              house={house}
              defaultCommissionBps={defaultCommissionBps}
              onSuccess={onRefresh}
            />
          )}

          {activeTab === "orders" && <HouseTabOrders house={house} />}

          {activeTab === "settlements" && <HouseTabSettlements house={house} />}

          {activeTab === "history" && <HouseTabHistory house={house} />}
        </div>
      </SheetContent>
    </Sheet>
  );
}
