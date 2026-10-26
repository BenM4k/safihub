"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/admin/shared/empty-state";
import { HousesTableToolbar } from "./houses-table-toolbar";
import { HousesTableHeader } from "./houses-table-header";
import { HousesTableRow } from "./houses-table-row";
import type { NeighborhoodRecord } from "@/dal";
import type { AdminHouseRow, HouseFiltersState } from "./types";

interface HousesTableProps {
  houses: AdminHouseRow[];
  neighborhoods: NeighborhoodRecord[];
  defaultCommissionBps: number;
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
  onSelectHouse,
  onToggleStatus,
  onViewOrders,
  onViewSettlements,
  onOpenCreateDrawer,
}: HousesTableProps) {
  const t = useTranslations("admin.houses");
  const [filters, setFilters] = useState<HouseFiltersState>({
    search: "",
    status: "all",
    neighborhoodId: "",
    sortBy: "name",
    sortOrder: "asc",
  });

  const handleFiltersChange = (next: Partial<HouseFiltersState>) => {
    setFilters((prev) => ({ ...prev, ...next }));
  };

  const handleSortToggle = (column: HouseFiltersState["sortBy"]) => {
    if (filters.sortBy === column) {
      handleFiltersChange({
        sortOrder: filters.sortOrder === "asc" ? "desc" : "asc",
      });
    } else {
      handleFiltersChange({ sortBy: column, sortOrder: "asc" });
    }
  };

  const filteredAndSortedHouses = useMemo(() => {
    return houses
      .filter((h) => {
        const query = filters.search.trim().toLowerCase();
        if (query) {
          const nameMatch = h.name.toLowerCase().includes(query);
          const neighMatch = (h.neighborhoodName || "").toLowerCase().includes(query);
          const phoneMatch = (h.contactPhone || "").includes(query);
          if (!nameMatch && !neighMatch && !phoneMatch) return false;
        }

        if (filters.status !== "all" && h.status !== filters.status) {
          return false;
        }

        if (filters.neighborhoodId && h.neighborhoodId !== filters.neighborhoodId) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let cmp = 0;
        switch (filters.sortBy) {
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
        return filters.sortOrder === "asc" ? cmp : -cmp;
      });
  }, [houses, filters, defaultCommissionBps]);

  return (
    <div className="rounded-xl border border-border bg-background overflow-hidden">
      <HousesTableToolbar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        neighborhoods={neighborhoods}
        totalFilteredCount={filteredAndSortedHouses.length}
      />

      <div className="overflow-x-auto">
        <Table>
          <HousesTableHeader
            sortBy={filters.sortBy}
            sortOrder={filters.sortOrder}
            onSortToggle={handleSortToggle}
          />
          <TableBody className="divide-y divide-border">
            {filteredAndSortedHouses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="py-12 px-4 text-center">
                  <EmptyState
                    title={houses.length === 0 ? t("emptyTitle") : t("emptyFilteredTitle")}
                    description={
                      houses.length === 0
                        ? t("emptyDesc")
                        : t("emptyFilteredDesc")
                    }
                    action={
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={
                          houses.length === 0
                            ? onOpenCreateDrawer
                            : () => handleFiltersChange({ search: "", status: "all", neighborhoodId: "" })
                        }
                        className="text-xs h-8 px-3"
                      >
                        {houses.length === 0 ? t("addHouse") : t("clearFilters")}
                      </Button>
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedHouses.map((house) => (
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
    </div>
  );
}
