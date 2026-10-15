"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { EmptyState } from "@/components/admin/shared/empty-state";
import { HousesTableToolbar } from "./houses-table-toolbar";
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

  const renderSortHeader = (
    label: string,
    field: HouseFiltersState["sortBy"],
    align: "left" | "right" | "center" = "left"
  ) => {
    const isCurrent = filters.sortBy === field;
    const Icon = isCurrent
      ? filters.sortOrder === "asc"
        ? ArrowUp
        : ArrowDown
      : ArrowUpDown;

    return (
      <button
        type="button"
        onClick={() => handleSortToggle(field)}
        className={`inline-flex items-center gap-1 font-bold text-ink-700 hover:text-heading transition-colors ${
          align === "right" ? "justify-end w-full" : align === "center" ? "justify-center w-full" : ""
        }`}
      >
        <span>{label}</span>
        <Icon className={`size-3 shrink-0 ${isCurrent ? "text-primary" : "text-ink-400"}`} />
      </button>
    );
  };

  return (
    <div className="bg-card rounded-2xl border-2 border-border-strong shadow-xs overflow-hidden flex flex-col">
      <HousesTableToolbar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        neighborhoods={neighborhoods}
        totalFilteredCount={filteredAndSortedHouses.length}
      />

      <div className="overflow-x-auto relative">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b-2 border-border-strong bg-surface text-ink-800 font-bold sticky top-0 z-10 select-none">
              <th scope="col" className="py-3 px-4 min-w-[220px]">
                {renderSortHeader("Pressing", "name")}
              </th>
              <th scope="col" className="py-3 px-4 min-w-[120px]">Quartier</th>
              <th scope="col" className="py-3 px-4 min-w-[140px]">Téléphone</th>
              <th scope="col" className="py-3 px-4 min-w-[110px]">
                {renderSortHeader("Commission", "commission")}
              </th>
              <th scope="col" className="py-3 px-4 text-right min-w-[120px]">
                {renderSortHeader("Montant min.", "minOrder", "right")}
              </th>
              <th scope="col" className="py-3 px-4 min-w-[90px]">
                {renderSortHeader("Délai", "turnaround")}
              </th>
              <th scope="col" className="py-3 px-4 min-w-[140px]">Horaires</th>
              <th scope="col" className="py-3 px-4 text-center min-w-[90px]">
                {renderSortHeader("En cours", "orders", "center")}
              </th>
              <th scope="col" className="py-3 px-4 text-right min-w-[120px]">
                {renderSortHeader("Solde à régler", "balance", "right")}
              </th>
              <th scope="col" className="py-3 px-4 min-w-[120px]">Statut</th>
              <th scope="col" className="py-3 px-4 text-right min-w-[70px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-strong/80">
            {filteredAndSortedHouses.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-12 px-4 text-center">
                  <EmptyState
                    title={houses.length === 0 ? "Aucun pressing partenaire" : "Aucun résultat trouvé"}
                    description={
                      houses.length === 0
                        ? "Ajoutez votre premier pressing partenaire pour démarrer la gestion."
                        : "Aucun pressing ne correspond à vos critères de recherche ou de filtre."
                    }
                    action={
                      <button
                        type="button"
                        onClick={
                          houses.length === 0
                            ? onOpenCreateDrawer
                            : () => handleFiltersChange({ search: "", status: "all", neighborhoodId: "" })
                        }
                        className="px-4 py-2 rounded-xl text-xs font-bold border-2 border-border-strong bg-card hover:bg-surface text-heading transition-colors"
                      >
                        {houses.length === 0 ? "Ajouter un pressing" : "Effacer les filtres"}
                      </button>
                    }
                  />
                </td>
              </tr>
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
          </tbody>
        </table>
      </div>
    </div>
  );
}
