"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Store, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/shared/page-header";
import { HousesTable } from "./houses-table";
import { HouseCreateDrawer } from "./house-create-drawer";
import { HouseDetailsSheet, type HouseDetailsTab } from "./details/house-details-sheet";
import { HouseSuspendDialog } from "./house-suspend-dialog";
import { formatMoney } from "@/lib/cash-formatters";
import type { NeighborhoodRecord } from "@/dal";
import type { AdminHouseRow } from "./types";

interface HousesManagementViewProps {
  houses: AdminHouseRow[];
  neighborhoods: NeighborhoodRecord[];
  defaultCommissionBps: number;
  totalHousesCount: number;
  activeHousesCount: number;
  totalBalanceOwedCDF: number;
}

export function HousesManagementView({
  houses,
  neighborhoods,
  defaultCommissionBps,
  totalHousesCount,
  activeHousesCount,
  totalBalanceOwedCDF,
}: HousesManagementViewProps) {
  const router = useRouter();

  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [selectedHouse, setSelectedHouse] = useState<AdminHouseRow | null>(null);
  const [activeTab, setActiveTab] = useState<HouseDetailsTab>("info");
  const [houseToSuspend, setHouseToSuspend] = useState<AdminHouseRow | null>(null);

  const handleRefresh = () => {
    router.refresh();
  };

  const handleRowSelect = (house: AdminHouseRow, tab: HouseDetailsTab = "info") => {
    setSelectedHouse(house);
    setActiveTab(tab);
  };

  return (
    <div className="space-y-6">
      {/* Page Header with primary action & KPI tags */}
      <PageHeader
        title="Pressings partenaires"
        subtitle="Paramètres des partenaires, commissions, horaires d'ouverture et capacités"
        actions={
          <Button
            type="button"
            onClick={() => setCreateDrawerOpen(true)}
            className="min-h-[40px] px-4 text-xs font-bold bg-primary hover:bg-primary-hover text-white shadow-xs inline-flex items-center gap-2 border-2 border-primary"
            aria-label="Ajouter un pressing"
          >
            <Plus className="size-4" />
            <span>Ajouter un pressing</span>
          </Button>
        }
      >
        {/* Quick KPI badges */}
        <div className="flex items-center gap-2 pt-2 flex-wrap text-xs font-semibold">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-card border-2 border-border-strong text-ink-700">
            <Store className="size-3.5 text-primary" />
            <span>{totalHousesCount} {totalHousesCount <= 1 ? "pressing" : "pressings"}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-success-light border-2 border-success-base/30 text-success-base">
            <span className="size-2 rounded-full bg-success-base" />
            <span>{activeHousesCount} actif(s)</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-card border-2 border-border-strong text-ink-700">
            <Landmark className="size-3.5 text-emerald-600" />
            <span>Solde global dû : {formatMoney(totalBalanceOwedCDF, "CDF")}</span>
          </span>
        </div>
      </PageHeader>

      {/* Main content: list first */}
      <HousesTable
        houses={houses}
        neighborhoods={neighborhoods}
        defaultCommissionBps={defaultCommissionBps}
        onSelectHouse={(h) => handleRowSelect(h, "info")}
        onToggleStatus={(h) => setHouseToSuspend(h)}
        onViewOrders={(h) => handleRowSelect(h, "orders")}
        onViewSettlements={(h) => handleRowSelect(h, "settlements")}
        onOpenCreateDrawer={() => setCreateDrawerOpen(true)}
      />

      {/* Slide-over Create Drawer */}
      <HouseCreateDrawer
        isOpen={createDrawerOpen}
        onClose={() => setCreateDrawerOpen(false)}
        neighborhoods={neighborhoods}
        existingHouses={houses}
        defaultCommissionBps={defaultCommissionBps}
        onSuccess={handleRefresh}
      />

      {/* Slide-over Details / Edit Sheet */}
      <HouseDetailsSheet
        house={selectedHouse}
        onClose={() => setSelectedHouse(null)}
        defaultCommissionBps={defaultCommissionBps}
        onToggleStatus={(h) => setHouseToSuspend(h)}
        onRefresh={handleRefresh}
        initialTab={activeTab}
      />

      {/* Suspend / Reactivate Confirmation Dialog */}
      <HouseSuspendDialog
        house={houseToSuspend}
        isOpen={Boolean(houseToSuspend)}
        onClose={() => setHouseToSuspend(null)}
        onSuccess={() => {
          setHouseToSuspend(null);
          setSelectedHouse(null);
          handleRefresh();
        }}
      />
    </div>
  );
}
