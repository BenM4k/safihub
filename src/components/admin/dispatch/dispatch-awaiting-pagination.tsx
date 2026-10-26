"use client";

import { Button } from "@/components/ui/button";

interface DispatchAwaitingPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export function DispatchAwaitingPagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
}: DispatchAwaitingPaginationProps) {
  if (totalPages <= 1) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="p-3.5 border-t border-border flex items-center justify-between text-xs text-muted-foreground bg-muted/20">
      <span>
        {start} – {end} / {totalItems}
      </span>
      <div className="flex items-center gap-1.5">
        <Button
          size="sm"
          variant="outline"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          className="h-8 px-2.5 text-xs"
        >
          Précédent
        </Button>
        <span className="font-semibold text-foreground px-2">
          {currentPage} / {totalPages}
        </span>
        <Button
          size="sm"
          variant="outline"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          className="h-8 px-2.5 text-xs"
        >
          Suivant
        </Button>
      </div>
    </div>
  );
}
