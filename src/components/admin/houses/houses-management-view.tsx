"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Plus, Store, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/shared/page-header";
import { HousesTable } from "./houses-table";
import { HouseCreateDrawer } from "./house-create-drawer";
import { HouseDetailsSheet, type HouseDetailsTab } from "./details/house-details-sheet";
import { HouseSuspendDialog } from "./house-suspend-dialog";
import { formatMoney } from "@/lib/cash-formatters";
import { AdminReviewQueue } from "./reviews/admin-review-queue";
import type { AdminPendingReviewRow } from "@/dal/house-review.dal";
import type { NeighborhoodRecord } from "@/dal";
import type { AdminHouseRow } from "./types";

interface HousesManagementViewProps {
  houses: AdminHouseRow[];
  neighborhoods: NeighborhoodRecord[];
  defaultCommissionBps: number;
  totalHousesCount: number;
  activeHousesCount: number;
  totalBalanceOwedCDF: number;
  pendingReviews?: AdminPendingReviewRow[];
}

export function HousesManagementView({
  houses,
  neighborhoods,
  defaultCommissionBps,
  totalHousesCount,
  activeHousesCount,
  totalBalanceOwedCDF,
  pendingReviews = [],
}: HousesManagementViewProps) {
  const router = useRouter();
  const t = useTranslations("admin.houses");

  const [viewMode, setViewMode] = useState<"all" | "reviews">("all");
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
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <Button
            type="button"
            onClick={() => setCreateDrawerOpen(true)}
            className="h-9 px-3.5 text-xs font-semibold gap-1.5"
            aria-label={t("addHouse")}
          >
            <Plus className="size-4" />
            <span>{t("addHouse")}</span>
          </Button>
        }
      >
        {/* Quick KPI badges */}
        <div className="flex items-center gap-2 pt-2 flex-wrap text-xs">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-muted text-foreground font-medium">
            <Store className="size-3.5 text-primary" />
            <span>{t("kpiHousesBadge", { count: totalHousesCount })}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            <span>{t("kpiActiveBadge", { count: activeHousesCount })}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-muted text-foreground font-medium">
            <Landmark className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t("kpiBalanceOwedBadge", { amount: formatMoney(totalBalanceOwedCDF, "CDF") })}</span>
          </span>
        </div>
      </PageHeader>

      {/* Navigation tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setViewMode("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            viewMode === "all"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-heading hover:bg-muted"
          }`}
        >
          Tous les pressings ({houses.length})
        </button>

        <button
          type="button"
          onClick={() => setViewMode("reviews")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            viewMode === "reviews"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-heading hover:bg-muted"
          }`}
        >
          <span>À valider</span>
          {pendingReviews.length > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                viewMode === "reviews"
                  ? "bg-white text-primary"
                  : "bg-amber-500 text-white"
              }`}
            >
              {pendingReviews.length}
            </span>
          )}
        </button>
      </div>

      {viewMode === "reviews" ? (
        <AdminReviewQueue pendingReviews={pendingReviews} />
      ) : (
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
      )}

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
        key={selectedHouse ? `${selectedHouse.id}-${activeTab}` : "none"}
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
