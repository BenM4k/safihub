"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Building2, Search, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/admin/shared/empty-state";
import { HouseSettlementRowItem } from "./house-settlement-row";
import { calculateDaysOverdue, SETTLEMENT_OVERDUE_DAYS_THRESHOLD } from "./period-utils";
import type { HouseSettlementRow, PayeeSettlementTarget, DeliveredOrderBreakdown } from "./types";

interface HousesSettlementsTableProps {
  houses: HouseSettlementRow[];
  onSettle: (target: PayeeSettlementTarget) => void;
  onViewOrders: (name: string, orders: DeliveredOrderBreakdown[]) => void;
}

export function HousesSettlementsTable({
  houses,
  onSettle,
  onViewOrders,
}: HousesSettlementsTableProps) {
  const t = useTranslations("admin.settlements");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "to_settle" | "settled" | "overdue">("all");
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = useMemo(() => {
    return houses
      .filter((h) => {
        const matchesSearch =
          h.name.toLowerCase().includes(search.toLowerCase()) ||
          (h.neighborhoodName && h.neighborhoodName.toLowerCase().includes(search.toLowerCase()));

        if (!matchesSearch) return false;
        if (statusFilter === "all") return true;
        if (statusFilter === "settled") return h.balanceOwedCDF === 0;

        const isOverdue =
          calculateDaysOverdue(h.oldestUnpaidDate) > SETTLEMENT_OVERDUE_DAYS_THRESHOLD;
        if (statusFilter === "overdue") return h.balanceOwedCDF > 0 && isOverdue;
        if (statusFilter === "to_settle") return h.balanceOwedCDF > 0 && !isOverdue;
        return true;
      })
      .sort((a, b) => (sortAsc ? a.balanceOwedCDF - b.balanceOwedCDF : b.balanceOwedCDF - a.balanceOwedCDF));
  }, [houses, search, statusFilter, sortAsc]);

  return (
    <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
      {/* Controls bar */}
      <div className="p-3 border-b border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="relative w-full sm:w-64">
          <Search className="size-4 text-muted-foreground absolute left-2.5 top-2.5 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un pressing..."
            className="pl-8 h-9 text-xs border-border bg-card"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {(
            [
              { id: "all", label: "Tous" },
              { id: "to_settle", label: "À régler" },
              { id: "overdue", label: "En retard" },
              { id: "settled", label: "À jour" },
            ] as const
          ).map((filter) => (
            <Button
              key={filter.id}
              type="button"
              variant={statusFilter === filter.id ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(filter.id)}
              className="h-8 px-2.5 text-xs font-semibold"
            >
              {filter.label}
            </Button>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSortAsc(!sortAsc)}
            className="h-8 px-2 text-xs gap-1"
            title="Trier par solde"
          >
            <ArrowUpDown className="size-3.5" />
            <span className="hidden sm:inline">Solde</span>
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table className="text-xs">
          <TableHeader>
            <TableRow className="border-b border-border bg-muted/40 font-semibold text-foreground text-2xs uppercase tracking-wider hover:bg-muted/40">
              <TableHead className="py-3 px-4 font-semibold text-foreground">{t("houseName")}</TableHead>
              <TableHead className="py-3 px-3 text-center font-semibold text-foreground">{t("deliveredOrders")}</TableHead>
              <TableHead className="py-3 px-3 text-right hidden sm:table-cell font-semibold text-foreground">{t("totalEarned")}</TableHead>
              <TableHead className="py-3 px-3 text-right hidden md:table-cell font-semibold text-foreground">{t("totalSettled")}</TableHead>
              <TableHead className="py-3 px-4 text-right font-semibold text-foreground">{t("balanceOwed")}</TableHead>
              <TableHead className="py-3 px-3 hidden lg:table-cell font-semibold text-foreground">{t("lastSettlement")}</TableHead>
              <TableHead className="py-3 px-4 text-right font-semibold text-foreground">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="p-6">
                  <EmptyState
                    icon={Building2}
                    title="Aucun pressing trouvé"
                    description="Aucun pressing ne correspond aux critères sélectionnés."
                  />
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((h) => (
                <HouseSettlementRowItem
                  key={h.houseId}
                  house={h}
                  onSettle={onSettle}
                  onViewOrders={onViewOrders}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
