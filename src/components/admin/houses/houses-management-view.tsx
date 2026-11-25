"use client";

import { Activity, useEffect, useRef, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Landmark, Plus, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/admin/shared/page-header";
import { HousesTable } from "./houses-table";
import { AdminReviewQueue } from "./reviews/admin-review-queue";
import { formatMoney } from "@/lib/cash-formatters";
import {
  buildAdminHousesQueryString,
  parseAdminHousesSearchParams,
  type AdminHousesQueryParams,
} from "@/lib/admin-houses-query";
import type { AdminPendingReviewRow } from "@/dal/house-review.dal";
import type { NeighborhoodRecord } from "@/dal";
import type { HouseDetailsTab } from "./details/house-details-sheet";
import type { AdminHouseRow } from "./types";

const HouseCreateDrawer = dynamic(
  () => import("./house-create-drawer").then((m) => m.HouseCreateDrawer),
  { ssr: false }
);

const HouseDetailsSheet = dynamic(
  () => import("./details/house-details-sheet").then((m) => m.HouseDetailsSheet),
  { ssr: false }
);

const HouseSuspendDialog = dynamic(
  () => import("./house-suspend-dialog").then((m) => m.HouseSuspendDialog),
  { ssr: false }
);

interface HousesManagementViewProps {
  houses: AdminHouseRow[];
  neighborhoods: NeighborhoodRecord[];
  defaultCommissionBps: number;
  totalHousesCount: number;
  activeHousesCount: number;
  totalBalanceOwedCDF: number;
  pendingReviews?: AdminPendingReviewRow[];
  initialQuery: AdminHousesQueryParams;
}

export function HousesManagementView({
  houses,
  neighborhoods,
  defaultCommissionBps,
  totalHousesCount,
  activeHousesCount,
  totalBalanceOwedCDF,
  pendingReviews = [],
  initialQuery,
}: HousesManagementViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const liveSearchParams = useSearchParams();
  const t = useTranslations("admin.houses");
  const [isPending, startTransition] = useTransition();

  const [queryState, setQueryState] = useState<AdminHousesQueryParams>(initialQuery);
  const latestQueryRef = useRef<AdminHousesQueryParams>(initialQuery);

  const searchKey = liveSearchParams.toString();
  const [trackedSearchKey, setTrackedSearchKey] = useState(searchKey);

  if (trackedSearchKey !== searchKey) {
    setTrackedSearchKey(searchKey);
    const parsed = parseAdminHousesSearchParams(
      Object.fromEntries(new URLSearchParams(searchKey).entries())
    );
    setQueryState(parsed);
  }

  useEffect(() => {
    latestQueryRef.current = queryState;
  }, [queryState]);

  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [selectedHouse, setSelectedHouse] = useState<AdminHouseRow | null>(null);
  const [activeTab, setActiveTab] = useState<HouseDetailsTab>("info");
  const [houseToSuspend, setHouseToSuspend] = useState<AdminHouseRow | null>(null);

  function updateQuery(partial: Partial<AdminHousesQueryParams>) {
    const next: AdminHousesQueryParams = {
      ...latestQueryRef.current,
      ...partial,
    };
    latestQueryRef.current = next;
    setQueryState(next);
    const qs = buildAdminHousesQueryString(next);
    startTransition(() => {
      router.replace(qs ? `${pathname}${qs}` : pathname, { scroll: false });
    });
  }

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const handleRowSelect = (house: AdminHouseRow, tab: HouseDetailsTab = "info") => {
    setSelectedHouse(house);
    setActiveTab(tab);
  };

  return (
    <div className="space-y-6 animate-enter">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <Button
            type="button"
            onClick={() => setCreateDrawerOpen(true)}
            className="min-h-10 px-3.5 text-xs font-semibold gap-1.5 press"
            aria-label={t("addHouse")}
          >
            <Plus className="size-4" />
            <span>{t("addHouse")}</span>
          </Button>
        }
      >
        <div className="flex items-center gap-2 pt-2 flex-wrap text-xs">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-muted text-foreground font-medium">
            <Store className="size-3.5 text-primary" />
            <span>{t("kpiHousesBadge", { count: totalHousesCount })}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-success-soft text-success font-medium">
            <span className="size-1.5 rounded-full bg-success" />
            <span>{t("kpiActiveBadge", { count: activeHousesCount })}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-muted text-foreground font-medium">
            <Landmark className="size-3.5 text-success" />
            <span>
              {t("kpiBalanceOwedBadge", {
                amount: formatMoney(totalBalanceOwedCDF, "CDF"),
              })}
            </span>
          </span>
        </div>
      </PageHeader>

      <div className="border-b border-border pb-3">
        <Tabs
          value={queryState.tab}
          onValueChange={(nextTab) =>
            updateQuery({ tab: nextTab as "all" | "reviews", page: 1 })
          }
        >
          <TabsList className="h-10">
            <TabsTrigger value="all" className="min-h-10 text-xs px-3">
              {t("allHousesTab", { count: houses.length })}
            </TabsTrigger>
            <TabsTrigger value="reviews" className="min-h-10 text-xs px-3 gap-1.5">
              <span>{t("pendingReviewsTab")}</span>
              {pendingReviews.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-warning text-primary-foreground">
                  {pendingReviews.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Activity mode={queryState.tab === "reviews" ? "visible" : "hidden"}>
        <div className="animate-enter-fast">
          <AdminReviewQueue pendingReviews={pendingReviews} />
        </div>
      </Activity>

      <Activity mode={queryState.tab === "all" ? "visible" : "hidden"}>
        <HousesTable
          houses={houses}
          neighborhoods={neighborhoods}
          defaultCommissionBps={defaultCommissionBps}
          search={queryState.search}
          status={queryState.status}
          neighborhoodId={queryState.neighborhoodId}
          page={queryState.page}
          pageSize={queryState.pageSize}
          isPending={isPending}
          onFiltersChange={(partial) => updateQuery({ ...partial, page: 1 })}
          onPageChange={(page) => updateQuery({ page })}
          onPageSizeChange={(pageSize) => updateQuery({ pageSize, page: 1 })}
          onSelectHouse={(h) => handleRowSelect(h, "info")}
          onToggleStatus={(h) => setHouseToSuspend(h)}
          onViewOrders={(h) => handleRowSelect(h, "orders")}
          onViewSettlements={(h) => handleRowSelect(h, "settlements")}
          onOpenCreateDrawer={() => setCreateDrawerOpen(true)}
        />
      </Activity>

      {createDrawerOpen && (
        <HouseCreateDrawer
          isOpen={createDrawerOpen}
          onClose={() => setCreateDrawerOpen(false)}
          neighborhoods={neighborhoods}
          existingHouses={houses}
          defaultCommissionBps={defaultCommissionBps}
          onSuccess={handleRefresh}
        />
      )}

      {selectedHouse && (
        <HouseDetailsSheet
          key={`${selectedHouse.id}-${activeTab}`}
          house={selectedHouse}
          onClose={() => setSelectedHouse(null)}
          defaultCommissionBps={defaultCommissionBps}
          onToggleStatus={(h) => setHouseToSuspend(h)}
          onRefresh={handleRefresh}
          initialTab={activeTab}
        />
      )}

      {houseToSuspend && (
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
      )}
    </div>
  );
}
