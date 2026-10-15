"use client";

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
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="p-3 border-t-2 border-border-strong bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-600">
      <div className="flex items-center gap-3">
        <span className="font-medium">
          Affichage de <span className="font-bold text-heading">{startItem}</span> à{" "}
          <span className="font-bold text-heading">{endItem}</span> sur{" "}
          <span className="font-bold text-heading">{totalItems}</span> clients
        </span>

        <div className="flex items-center gap-1.5 text-2xs">
          <span>Par page :</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-8 rounded-md border-2 border-border-strong bg-white px-2 font-bold text-heading"
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
          className="h-9 min-h-[36px] px-2.5 text-xs font-semibold border-2 border-border-strong bg-white hover:bg-surface disabled:opacity-40"
          aria-label="Page précédente"
        >
          <ChevronLeft className="size-4" />
        </Button>

        <span className="font-mono font-bold px-2 text-xs text-heading">
          {currentPage} / {totalPages}
        </span>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || isLoading}
          className="h-9 min-h-[36px] px-2.5 text-xs font-semibold border-2 border-border-strong bg-white hover:bg-surface disabled:opacity-40"
          aria-label="Page suivante"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
