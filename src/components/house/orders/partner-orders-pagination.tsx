"use client";

import { useTranslations } from "next-intl";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PartnerOrdersPaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

/**
 * Accessible orders pagination using shadcn Pagination and Select primitives.
 */
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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border text-xs text-muted-foreground font-sans">
      {/* Range and page size */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
        <span className="font-medium text-foreground">
          {t("paginationRange", { from, to, total: totalItems })}
        </span>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-muted-foreground">
            {t("rowsPerPage")}
          </span>
          <Select
            value={String(pageSize)}
            onValueChange={(val) => onPageSizeChange(Number(val))}
          >
            <SelectTrigger
              aria-label={t("rowsPerPage")}
              className="h-8 w-[70px] text-xs font-semibold rounded-lg border-border bg-card"
            >
              <SelectValue placeholder={String(pageSize)} />
            </SelectTrigger>
            <SelectContent className="rounded-xl bg-card border-border shadow-lift">
              <SelectItem value="10" className="text-xs cursor-pointer">
                10
              </SelectItem>
              <SelectItem value="20" className="text-xs cursor-pointer">
                20
              </SelectItem>
              <SelectItem value="50" className="text-xs cursor-pointer">
                50
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Navigation buttons */}
      <Pagination className="w-auto mx-0 self-end sm:self-auto">
        <PaginationContent className="gap-1.5">
          <PaginationItem>
            <PaginationPrevious
              onClick={() => {
                if (currentPage > 1) onPageChange(currentPage - 1);
              }}
              className={`min-h-[36px] px-3 text-xs font-semibold cursor-pointer ${
                currentPage <= 1 ? "pointer-events-none opacity-40" : ""
              }`}
            />
          </PaginationItem>

          <PaginationItem>
            <span className="px-2 font-mono text-xs font-bold text-heading">
              {currentPage} / {totalPages}
            </span>
          </PaginationItem>

          <PaginationItem>
            <PaginationNext
              onClick={() => {
                if (currentPage < totalPages) onPageChange(currentPage + 1);
              }}
              className={`min-h-[36px] px-3 text-xs font-semibold cursor-pointer ${
                currentPage >= totalPages ? "pointer-events-none opacity-40" : ""
              }`}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
