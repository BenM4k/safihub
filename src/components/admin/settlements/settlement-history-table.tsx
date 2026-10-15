"use client";

import { useState, useMemo } from "react";
import { History } from "lucide-react";
import { EmptyState } from "@/components/admin/shared/empty-state";
import { SettlementHistoryFilters, type SettlementHistoryFiltersState } from "./settlement-history-filters";
import { SettlementHistoryRowItem } from "./settlement-history-row";
import { SettlementHistoryPagination } from "./settlement-history-pagination";
import { exportSettlementHistoryCsv } from "./settlement-history-export";
import type { SettlementHistoryRow } from "./types";

interface SettlementHistoryTableProps {
  logs: SettlementHistoryRow[];
}

const PAGE_SIZE = 10;

export function SettlementHistoryTable({ logs }: SettlementHistoryTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<SettlementHistoryFiltersState>({
    search: "",
    payeeType: "all",
    status: "all",
    period: "30_days",
  });

  const filteredLogs = useMemo(() => {
    const now = new Date();

    return logs.filter((log) => {
      if (filters.payeeType !== "all" && log.payeeType !== filters.payeeType) return false;
      if (filters.status === "valid" && log.isReversed) return false;
      if (filters.status === "reversed" && !log.isReversed) return false;

      if (filters.period !== "all") {
        const days = filters.period === "7_days" ? 7 : 30;
        const logDate = new Date(log.createdAt);
        const diffDays = (now.getTime() - logDate.getTime()) / (1000 * 3600 * 24);
        if (diffDays > days) return false;
      }

      if (filters.search.trim()) {
        const query = filters.search.toLowerCase();
        const matchesName = (log.payeeName || "").toLowerCase().includes(query);
        const matchesPhone = (log.payeePhone || "").toLowerCase().includes(query);
        const matchesRef = (log.reference || "").toLowerCase().includes(query);
        const matchesNote = (log.note || "").toLowerCase().includes(query);
        if (!matchesName && !matchesPhone && !matchesRef && !matchesNote) return false;
      }

      return true;
    });
  }, [logs, filters]);

  const pagedLogs = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredLogs.slice(start, start + PAGE_SIZE);
  }, [filteredLogs, currentPage]);

  const handleExportCsv = () => {
    exportSettlementHistoryCsv(filteredLogs, filters.period);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-heading flex items-center gap-2">
          <History className="size-4 text-primary" />
          <span>Historique des règlements ({filteredLogs.length})</span>
        </h2>
      </div>

      <div className="bg-card rounded-xl border-2 border-border-strong shadow-xs overflow-hidden">
        <SettlementHistoryFilters
          filters={filters}
          onChange={(next) => {
            setFilters(next);
            setCurrentPage(1);
          }}
          onReset={() => {
            setFilters({ search: "", payeeType: "all", status: "all", period: "30_days" });
            setCurrentPage(1);
          }}
          onExportCsv={handleExportCsv}
        />

        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 z-10">
              <tr className="border-b-2 border-border-strong bg-slate-50 text-ink-700 font-bold uppercase tracking-wider text-2xs shadow-2xs">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Bénéficiaire</th>
                <th className="py-2.5 px-2 text-center">Type</th>
                <th className="py-2.5 px-2 hidden sm:table-cell">Période</th>
                <th className="py-2.5 px-3 text-right">Montant</th>
                <th className="py-2.5 px-2 hidden md:table-cell">Mode</th>
                <th className="py-2.5 px-2 hidden lg:table-cell">Référence</th>
                <th className="py-2.5 px-2 hidden md:table-cell">Opérateur</th>
                <th className="py-2.5 px-3 text-center">Statut</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-strong">
              {pagedLogs.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-6">
                    <EmptyState
                      icon={History}
                      title="Aucun règlement trouvé"
                      description="Aucun règlement n'a été enregistré pour les filtres sélectionnés."
                    />
                  </td>
                </tr>
              ) : (
                pagedLogs.map((log) => <SettlementHistoryRowItem key={log.id} log={log} />)
              )}
            </tbody>
          </table>
        </div>

        <SettlementHistoryPagination
          currentPage={currentPage}
          totalItems={filteredLogs.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
