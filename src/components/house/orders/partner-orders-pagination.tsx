"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface PartnerOrdersPaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function PartnerOrdersPagination({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: PartnerOrdersPaginationProps) {
  const t = useTranslations("house.orders");

  if (totalItems <= 0) return null;

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const from = Math.min(totalItems, (currentPage - 1) * pageSize + 1);
  const to = Math.min(totalItems, currentPage * pageSize);

  return (
    <nav
      aria-label={t("paginationAria")}
      className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border text-xs text-muted-foreground font-sans"
    >
      {/* Range and page size */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
        <span className="font-medium text-foreground">
          {t("paginationRange", { from, to, total: totalItems })}
        </span>

        <div className="flex items-center gap-1.5">
          <label htmlFor="partnerPageSizeSelect" className="text-[11px] text-muted-foreground">
            {t("rowsPerPage")}
          </label>
          <select
            id="partnerPageSizeSelect"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-8 rounded-lg border border-border bg-card shadow-xs px-2 text-xs text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center gap-2 self-end sm:self-auto">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label={t("previousPage")}
          className="min-h-[44px] sm:min-h-[36px] px-3 text-xs font-semibold border-border bg-card hover:bg-surface text-foreground gap-1 cursor-pointer disabled:opacity-40"
        >
          <ChevronLeft className="size-4" />
          <span className="hidden sm:inline">{t("previous")}</span>
        </Button>

        <span className="px-2 font-mono text-xs font-bold text-heading">
          {currentPage} / {totalPages}
        </span>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label={t("nextPage")}
          className="min-h-[44px] sm:min-h-[36px] px-3 text-xs font-semibold border-border bg-card hover:bg-surface text-foreground gap-1 cursor-pointer disabled:opacity-40"
        >
          <span className="hidden sm:inline">{t("next")}</span>
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </nav>
  );
}
