"use client";

import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UsersTablePaginationProps {
  totalItems: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function UsersTablePagination({
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: UsersTablePaginationProps) {
  const t = useTranslations("admin.users");
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-card border-t border-border text-xs text-muted-foreground">
      {/* Range and total counter */}
      <div className="font-medium text-heading">
        {t("paginationRange", {
          start: startItem,
          end: endItem,
          total: totalItems,
        })}
      </div>

      {/* Page size & Navigation */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">{t("perPage")}</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-8 px-2 rounded-lg border border-border bg-background text-xs font-semibold text-heading focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer shadow-2xs"
            aria-label={t("pageSizeLabel")}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage <= 1}
            className="size-8 p-0 border border-border rounded-lg"
            aria-label={t("firstPage")}
          >
            <ChevronsLeft className="size-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="size-8 p-0 border border-border rounded-lg"
            aria-label={t("previousPage")}
          >
            <ChevronLeft className="size-4" />
          </Button>

          <span className="px-2 font-mono font-medium text-heading">
            {currentPage} / {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="size-8 p-0 border border-border rounded-lg"
            aria-label={t("nextPage")}
          >
            <ChevronRight className="size-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages}
            className="size-8 p-0 border border-border rounded-lg"
            aria-label={t("lastPage")}
          >
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

