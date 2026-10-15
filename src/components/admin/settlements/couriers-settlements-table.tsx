"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Bike, Search, ArrowUpDown, AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SettlementStatusBadge } from "./settlement-status-badge";
import { MoneyCell } from "@/components/admin/shared/money-cell";
import { PhoneCell } from "@/components/admin/shared/phone-cell";
import { EmptyState } from "@/components/admin/shared/empty-state";
import { formatMoney, formatFrenchDateLong } from "@/lib/cash-formatters";
import { calculateDaysOverdue, SETTLEMENT_OVERDUE_DAYS_THRESHOLD } from "./period-utils";
import type { CourierSettlementRow, PayeeSettlementTarget, DeliveredOrderBreakdown } from "./types";

interface CouriersSettlementsTableProps {
  couriers: CourierSettlementRow[];
  onSettle: (target: PayeeSettlementTarget) => void;
  onViewOrders: (name: string, orders: DeliveredOrderBreakdown[]) => void;
}

export function CouriersSettlementsTable({
  couriers,
  onSettle,
  onViewOrders,
}: CouriersSettlementsTableProps) {
  const t = useTranslations("admin.settlements");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "to_settle" | "settled" | "overdue">("all");
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = useMemo(() => {
    return couriers
      .filter((c) => {
        const matches = (c.name && c.name.toLowerCase().includes(search.toLowerCase())) || (c.phone && c.phone.includes(search));
        if (!matches) return false;
        if (statusFilter === "all") return true;
        if (statusFilter === "settled") return c.balanceOwedCDF === 0;
        const isOverdue = calculateDaysOverdue(c.oldestUnpaidDate) > SETTLEMENT_OVERDUE_DAYS_THRESHOLD;
        if (statusFilter === "overdue") return c.balanceOwedCDF > 0 && isOverdue;
        if (statusFilter === "to_settle") return c.balanceOwedCDF > 0 && !isOverdue;
        return true;
      })
      .sort((a, b) => (sortAsc ? a.balanceOwedCDF - b.balanceOwedCDF : b.balanceOwedCDF - a.balanceOwedCDF));
  }, [couriers, search, statusFilter, sortAsc]);

  return (
    <div className="bg-card rounded-xl border-2 border-border-strong shadow-xs overflow-hidden">
      {/* Controls bar */}
      <div className="p-3 border-b-2 border-border-strong bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="relative w-full sm:w-64">
          <Search className="size-4 text-ink-400 absolute left-2.5 top-2.5 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un coursier..."
            className="pl-8 h-9 text-xs border-border-strong bg-card"
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
              className="h-8 px-2.5 text-xs font-semibold border-border-strong"
            >
              {filter.label}
            </Button>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSortAsc(!sortAsc)}
            className="h-8 px-2 text-xs border-border-strong gap-1"
            title="Trier par solde"
          >
            <ArrowUpDown className="size-3.5" />
            <span className="hidden sm:inline">Solde</span>
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b-2 border-border-strong bg-slate-50 text-ink-700 font-bold uppercase tracking-wider text-2xs">
              <th className="py-3 px-4">{t("courier")}</th>
              <th className="py-3 px-3 text-center">{t("missionsDelivered")}</th>
              <th className="py-3 px-3 text-right hidden sm:table-cell">{t("totalEarned")}</th>
              <th className="py-3 px-3 text-right hidden md:table-cell">{t("totalSettled")}</th>
              <th className="py-3 px-4 text-right">{t("balanceOwed")}</th>
              <th className="py-3 px-3 hidden lg:table-cell">{t("lastSettlement")}</th>
              <th className="py-3 px-4 text-right">{t("actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-strong">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6">
                  <EmptyState
                    icon={Bike}
                    title="Aucun coursier trouvé"
                    description="Aucun coursier ne correspond aux critères sélectionnés."
                  />
                </td>
              </tr>
            ) : (
              filtered.map((c) => {
                const isZero = c.balanceOwedCDF <= 0;
                const lastFormatted =
                  c.lastPaymentAmount && c.lastPaymentAt
                    ? `${formatMoney(c.lastPaymentAmount, "CDF")} · ${formatFrenchDateLong(c.lastPaymentAt)}`
                    : "—";

                const hasDiscrepancy = c.cashDiscrepancyCDF !== 0;

                return (
                  <tr key={c.courierId} className="hover:bg-surface/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-heading text-sm">{c.name ?? c.courierId}</div>
                      {c.phone && <PhoneCell phone={c.phone} />}
                      {hasDiscrepancy && (
                        <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-warning-light border border-warning-base/40 text-2xs font-bold text-warning-base">
                          <AlertCircle className="size-3" />
                          <span>Écart de caisse : {formatMoney(c.cashDiscrepancyCDF, "CDF")}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => onViewOrders(c.name ?? "Coursier", c.deliveredOrders)}
                        className="font-mono font-bold text-primary hover:underline hover:text-primary-dark cursor-pointer text-xs"
                        title="Voir le détail des missions"
                      >
                        {c.missionsCount}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-right hidden sm:table-cell">
                      <MoneyCell amount={c.totalEarnedCDF} />
                    </td>
                    <td className="py-3 px-3 text-right hidden md:table-cell">
                      <MoneyCell amount={c.totalPaidCDF} className="text-ink-600 font-semibold" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <MoneyCell
                          amount={c.balanceOwedCDF}
                          className={isZero ? "text-ink-600 font-semibold" : "font-black text-sm text-heading"}
                        />
                        <SettlementStatusBadge
                          balanceOwedCDF={c.balanceOwedCDF}
                          oldestUnpaidDate={c.oldestUnpaidDate}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-3 hidden lg:table-cell font-mono text-2xs text-ink-600">
                      {lastFormatted}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isZero ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface text-ink-600 font-semibold text-xs border border-border-strong">
                          <Check className="size-3.5 text-success-base" />
                          <span>À jour</span>
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() =>
                            onSettle({
                              id: c.courierId,
                              type: "courier",
                              name: c.name ?? "Coursier",
                              subtitle: c.phone ?? "Coursier indépendant",
                              balanceOwedCDF: c.balanceOwedCDF,
                              cashDiscrepancyCDF: c.cashDiscrepancyCDF,
                              deliveredOrders: c.deliveredOrders,
                            })
                          }
                          className="min-h-[40px] px-3 text-xs font-bold shadow-2xs"
                        >
                          {t("settleCourierBtn")}
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
