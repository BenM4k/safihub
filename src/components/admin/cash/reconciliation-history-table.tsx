"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/admin/shared/empty-state";
import { HistoryFilters, type HistoryFilterState } from "./history-filters";
import { HistoryTableRow } from "./history-table-row";
import { HistoryPagination } from "./history-pagination";
import { exportReconciliationHistoryCsv } from "./history-export";
import { FileText } from "lucide-react";

export interface ReconciliationLogRow {
  id: string;
  courierId: string;
  courierName: string | null;
  courierPhone?: string | null;
  businessDate: string;
  currency: "CDF" | "USD";
  expectedAmount: number;
  receivedAmount: number;
  difference: number;
  status: string;
  note: string | null;
  reconciledBy: string | null;
  reconcilerName?: string | null;
  createdAt: Date | string;
}

interface ReconciliationHistoryTableProps {
  logs: ReconciliationLogRow[];
}

const PAGE_SIZE = 10;

export function ReconciliationHistoryTable({ logs }: ReconciliationHistoryTableProps) {
  const t = useTranslations("admin.cash");

  const [page, setPage] = useState(1);
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const [filters, setFilters] = useState<HistoryFilterState>({
    search: "",
    courierId: "all",
    status: "all",
    period: "30_days",
  });

  const courierOptions = useMemo(() => {
    const map = new Map<string, string>();
    logs.forEach((l) => {
      if (l.courierId && !map.has(l.courierId)) {
        map.set(l.courierId, l.courierName || l.courierId);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const now = new Date();

    return logs.filter((log) => {
      const isCancelled = log.note?.includes("[ANNULÉE") || false;

      if (filters.status === "cancelled" && !isCancelled) return false;
      if (filters.status === "discrepancy" && (isCancelled || log.difference === 0)) return false;
      if (filters.status === "reconciled" && (isCancelled || log.difference !== 0)) return false;

      if (filters.courierId !== "all" && log.courierId !== filters.courierId) return false;

      if (filters.period !== "all") {
        const days = filters.period === "7_days" ? 7 : 30;
        const logDate = new Date(`${log.businessDate}T00:00:00Z`);
        const diffDays = (now.getTime() - logDate.getTime()) / (1000 * 3600 * 24);
        if (diffDays > days) return false;
      }

      if (filters.search.trim()) {
        const query = filters.search.toLowerCase();
        const matchesName = (log.courierName || "").toLowerCase().includes(query);
        const matchesPhone = (log.courierPhone || "").toLowerCase().includes(query);
        const matchesNote = (log.note || "").toLowerCase().includes(query);
        if (!matchesName && !matchesPhone && !matchesNote) return false;
      }

      return true;
    });
  }, [logs, filters]);

  const currentPageLogs = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredLogs.slice(start, start + PAGE_SIZE);
  }, [filteredLogs, page]);

  const handleExportCsv = () => {
    exportReconciliationHistoryCsv(filteredLogs, filters.period);
  };

  const toggleNote = (id: string) => {
    setExpandedNotes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-card rounded-xl border border-border-strong shadow-xs overflow-hidden flex flex-col">
      <div className="p-4 border-b border-border-strong flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-heading font-display">
            {t("historyTitle")}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Historique auditable de tous les versements et contre-passations
          </p>
        </div>
      </div>

      <HistoryFilters
        filters={filters}
        onFilterChange={(f) => {
          setFilters(f);
          setPage(1);
        }}
        courierOptions={courierOptions}
        onExportCsv={handleExportCsv}
        filteredCount={filteredLogs.length}
      />

      <div className="overflow-x-auto relative">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border-strong bg-surface/95 backdrop-blur-xs text-ink-700 font-semibold sticky top-0 z-10">
              <th scope="col" className="py-3 px-4">{t("accountingDate")}</th>
              <th scope="col" className="py-3 px-4">{t("courier")}</th>
              <th scope="col" className="py-3 px-4 text-right">{t("expected")}</th>
              <th scope="col" className="py-3 px-4 text-right">{t("received")}</th>
              <th scope="col" className="py-3 px-4 text-right">{t("difference")}</th>
              <th scope="col" className="py-3 px-4 text-center">{t("status")}</th>
              <th scope="col" className="py-3 px-4 hidden md:table-cell">{t("reconciledBy")}</th>
              <th scope="col" className="py-3 px-4 hidden lg:table-cell">{t("dateTime")}</th>
              <th scope="col" className="py-3 px-4 min-w-[180px] hidden sm:table-cell">{t("noteLabel")}</th>
              <th scope="col" className="py-3 px-4 text-right">{t("actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-strong/80">
            {currentPageLogs.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8">
                  <EmptyState
                    icon={FileText}
                    title={t("noHistory")}
                    description="Aucune écriture de réconciliation ne correspond aux filtres appliqués."
                  />
                </td>
              </tr>
            ) : (
              currentPageLogs.map((log) => (
                <HistoryTableRow
                  key={log.id}
                  log={log}
                  isExpanded={!!expandedNotes[log.id]}
                  onToggleNote={toggleNote}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <HistoryPagination
        page={page}
        pageSize={PAGE_SIZE}
        totalItems={filteredLogs.length}
        onPageChange={setPage}
      />
    </div>
  );
}
