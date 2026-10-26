"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SettlementHistoryPaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function SettlementHistoryPagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
}: SettlementHistoryPaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  if (totalItems <= pageSize && currentPage === 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-muted/20 border-t border-border text-xs">
      <span className="text-muted-foreground font-medium">
        Affichage de <span className="font-bold text-foreground">{startItem}</span> à{" "}
        <span className="font-bold text-foreground">{endItem}</span> sur{" "}
        <span className="font-bold text-foreground">{totalItems}</span> écritures
      </span>

      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-9 px-3 font-semibold text-xs border-border gap-1"
        >
          <ChevronLeft className="size-4" />
          <span>Précédent</span>
        </Button>
        <span className="px-2 font-mono font-bold text-foreground text-xs">
          {currentPage} / {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-9 px-3 font-semibold text-xs border-border gap-1"
        >
          <span>Suivant</span>
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
