"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/admin/shared/empty-state";
import { DataTablePagination } from "@/components/admin/shared/data-table-pagination";
import { HousesTableToolbar } from "./houses-table-toolbar";
import { HousesTableHeader } from "./houses-table-header";
import { HousesTableRow } from "./houses-table-row";
import type { NeighborhoodRecord } from "@/dal";
import type { AdminHouseRow, HouseFiltersState } from "./types";

interface HousesTableProps {
  houses: AdminHouseRow[];
  neighborhoods: NeighborhoodRecord[];
  defaultCommissionBps: number;
  search: string;
  status: HouseFiltersState["status"];
  neighborhoodId: string;
  page: number;
  pageSize: number;
  isPending?: boolean;
  onFiltersChange: (next: {
    search?: string;
    status?: HouseFiltersState["status"];
    neighborhoodId?: string;
  }) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSelectHouse: (house: AdminHouseRow) => void;
  onToggleStatus: (house: AdminHouseRow) => void;
  onViewOrders: (house: AdminHouseRow) => void;
  onViewSettlements: (house: AdminHouseRow) => void;
  onOpenCreateDrawer: () => void;
}

export function HousesTable({
  houses,
  neighborhoods,
  defaultCommissionBps,
  search,
  status,
  neighborhoodId,
  page,
  pageSize,
  isPending = false,
  onFiltersChange,
  onPageChange,
  onPageSizeChange,
  onSelectHouse,
  onToggleStatus,
  onViewOrders,
  onViewSettlements,
  onOpenCreateDrawer,
}: HousesTableProps) {
  const t = useTranslations("admin.houses");
  const [sortBy, setSortBy] = useState<HouseFiltersState["sortBy"]>("name");
  const [sortOrder, setSortOrder] = useState<HouseFiltersState["sortOrder"]>("asc");

  const handleSortToggle = (column: HouseFiltersState["sortBy"]) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const filteredAndSortedHouses = useMemo(() => {
    return houses
      .filter((h) => {
        const query = search.trim().toLowerCase();
        if (query) {
          const nameMatch = h.name.toLowerCase().includes(query);
          const neighMatch = (h.neighborhoodName || "")
            .toLowerCase()
            .includes(query);
          const phoneMatch = (h.contactPhone || "").includes(query);
          if (!nameMatch && !neighMatch && !phoneMatch) return false;
        }

        if (status !== "all" && h.status !== status) {
          return false;
        }

        if (neighborhoodId && h.neighborhoodId !== neighborhoodId) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let cmp = 0;
        switch (sortBy) {
          case "name":
            cmp = a.name.localeCompare(b.name, "fr");
            break;
          case "commission": {
            const commA = a.commissionBps ?? defaultCommissionBps;
            const commB = b.commissionBps ?? defaultCommissionBps;
            cmp = commA - commB;
            break;
          }
          case "minOrder":
            cmp = a.minimumOrderAmount - b.minimumOrderAmount;
            break;
          case "turnaround":
            cmp = a.turnaroundHours - b.turnaroundHours;
            break;
          case "orders":
            cmp = a.activeOrdersCount - b.activeOrdersCount;
            break;
          case "balance":
            cmp = a.balanceOwedCDF - b.balanceOwedCDF;
            break;
        }
        return sortOrder === "asc" ? cmp : -cmp;
      });
  }, [houses, search, status, neighborhoodId, sortBy, sortOrder, defaultCommissionBps]);

  const totalItems = filteredAndSortedHouses.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const pagedHouses = filteredAndSortedHouses.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  return (
    <div className="rounded-xl border border-border bg-background overflow-hidden animate-enter-fast">
      <HousesTableToolbar
        filters={{ search, status, neighborhoodId, sortBy, sortOrder }}
        onFiltersChange={onFiltersChange}
        neighborhoods={neighborhoods}
        totalFilteredCount={totalItems}
        isPending={isPending}
      />

      <div className="overflow-x-auto">
        <Table>
          <HousesTableHeader
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortToggle={handleSortToggle}
          />
          <TableBody className="divide-y divide-border">
            {pagedHouses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="py-12 px-4 text-center">
                  <EmptyState
                    title={houses.length === 0 ? t("emptyTitle") : t("emptyFilteredTitle")}
                    description={
                      houses.length === 0 ? t("emptyDesc") : t("emptyFilteredDesc")
                    }
                    action={
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={
                          houses.length === 0
                            ? onOpenCreateDrawer
                            : () =>
                                onFiltersChange({
                                  search: "",
                                  status: "all",
                                  neighborhoodId: "",
                                })
                        }
                        className="text-xs min-h-10 px-3 press"
                      >
                        {houses.length === 0 ? t("addHouse") : t("clearFilters")}
                      </Button>
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              pagedHouses.map((house) => (
                <HousesTableRow
                  key={house.id}
                  house={house}
                  defaultCommissionBps={defaultCommissionBps}
                  onSelectHouse={onSelectHouse}
                  onToggleStatus={onToggleStatus}
                  onViewOrders={onViewOrders}
                  onViewSettlements={onViewSettlements}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination
        page={safePage}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        hideIfSinglePage
      />
    </div>
  );
}
