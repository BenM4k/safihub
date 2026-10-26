"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/admin/shared/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
    <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-foreground font-display">
            {t("historyTitle")}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("historySubtitle")}
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
        <Table className="text-xs">
          <TableHeader>
            <TableRow className="border-b border-border bg-muted/40 font-semibold sticky top-0 z-10 hover:bg-muted/40">
              <TableHead className="py-3 px-4 font-semibold text-foreground">{t("accountingDate")}</TableHead>
              <TableHead className="py-3 px-4 font-semibold text-foreground">{t("courier")}</TableHead>
              <TableHead className="py-3 px-4 text-right font-semibold text-foreground">{t("expected")}</TableHead>
              <TableHead className="py-3 px-4 text-right font-semibold text-foreground">{t("received")}</TableHead>
              <TableHead className="py-3 px-4 text-right font-semibold text-foreground">{t("difference")}</TableHead>
              <TableHead className="py-3 px-4 text-center font-semibold text-foreground">{t("status")}</TableHead>
              <TableHead className="py-3 px-4 hidden md:table-cell font-semibold text-foreground">{t("reconciledBy")}</TableHead>
              <TableHead className="py-3 px-4 hidden lg:table-cell font-semibold text-foreground">{t("dateTime")}</TableHead>
              <TableHead className="py-3 px-4 min-w-[180px] hidden sm:table-cell font-semibold text-foreground">{t("noteLabel")}</TableHead>
              <TableHead className="py-3 px-4 text-right font-semibold text-foreground">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentPageLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="py-8">
                  <EmptyState
                    icon={FileText}
                    title={t("noHistory")}
                    description={t("historyEmptyFiltered")}
                  />
                </TableCell>
              </TableRow>
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
          </TableBody>
        </Table>
      </div>

      <HistoryPagination
        page={page}
        totalItems={filteredLogs.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  );
}
