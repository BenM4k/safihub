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

interface StaffPaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function StaffPagination({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: StaffPaginationProps) {
  const t = useTranslations("house.settings");

  if (totalItems <= 0) return null;

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const from = Math.min(totalItems, (currentPage - 1) * pageSize + 1);
  const to = Math.min(totalItems, currentPage * pageSize);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border/60 text-xs text-muted-foreground">
      {/* Range and page size */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
        <span className="font-medium text-foreground">
          {t("staffPaginationRange", { from, to, total: totalItems })}
        </span>

        <div className="flex items-center gap-1.5">
          <Select
            value={String(pageSize)}
            onValueChange={(val) => {
              onPageSizeChange(Number(val));
              onPageChange(1);
            }}
          >
            <SelectTrigger
              aria-label="Nombre par page"
              className="h-8 w-[65px] text-xs font-semibold rounded-lg border-border bg-background"
            >
              <SelectValue placeholder={String(pageSize)} />
            </SelectTrigger>
            <SelectContent className="rounded-xl bg-card border-border shadow-md">
              <SelectItem value="5" className="text-xs cursor-pointer">
                5
              </SelectItem>
              <SelectItem value="10" className="text-xs cursor-pointer">
                10
              </SelectItem>
              <SelectItem value="25" className="text-xs cursor-pointer">
                25
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
            <span className="px-2 font-mono text-xs font-bold text-foreground">
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
