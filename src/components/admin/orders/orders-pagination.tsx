"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface OrdersPaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function OrdersPagination({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: OrdersPaginationProps) {
  const t = useTranslations("admin.orders");

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const from = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(totalItems, currentPage * pageSize);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground pt-1">
      {/* Total count and page size selector */}
      <div className="flex items-center gap-3">
        <span className="font-medium text-foreground">
          {t("paginationRange", { from, to, total: totalItems })}
        </span>

        <div className="flex items-center gap-1.5">
          <label htmlFor="pageSizeSelect" className="text-[11px]">
            {t("rowsPerPage")}:
          </label>
          <select
            id="pageSizeSelect"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-8 rounded-md border border-border-strong bg-card shadow-xs px-2 text-xs text-heading font-medium hover:border-ink-400 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-1.5 self-end sm:self-auto">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="h-8 px-2.5 text-xs font-semibold border-border-strong bg-card shadow-xs hover:shadow-sm hover:bg-surface text-heading gap-1 cursor-pointer disabled:opacity-50"
          aria-label="Page précédente"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Précédent</span>
        </Button>

        <span className="px-2 font-mono text-xs text-heading">
          {currentPage} / {totalPages}
        </span>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="h-8 px-2.5 text-xs font-semibold border-border-strong bg-card shadow-xs hover:shadow-sm hover:bg-surface text-heading gap-1 cursor-pointer disabled:opacity-50"
          aria-label="Page suivante"
        >
          <span>Suivant</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
