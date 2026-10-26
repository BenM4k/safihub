"use client";

import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CustomersTablePaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function CustomersTablePagination({
  currentPage,
  pageSize,
  totalItems,
  isLoading = false,
  onPageChange,
  onPageSizeChange,
}: CustomersTablePaginationProps) {
  const t = useTranslations("admin.customers");
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="p-3 border-t border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
      <div className="flex items-center gap-3">
        <span className="font-medium text-foreground">
          {t("paginationRange", {
            start: startItem,
            end: endItem,
            total: totalItems,
          })}
        </span>

        <div className="flex items-center gap-1.5 text-2xs">
          <span>{t("perPage")}</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-8 rounded-md border border-border bg-background px-2 font-semibold text-foreground"
            aria-label={t("pageSizeLabel")}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || isLoading}
          className="h-8 px-2 text-xs"
          aria-label={t("previousPage")}
        >
          <ChevronLeft className="size-4" />
        </Button>

        <span className="font-mono font-medium px-2 text-xs text-foreground">
          {currentPage} / {totalPages}
        </span>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || isLoading}
          className="h-8 px-2 text-xs"
          aria-label={t("nextPage")}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
