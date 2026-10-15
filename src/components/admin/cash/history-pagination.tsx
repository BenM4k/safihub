"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HistoryPaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (newPage: number) => void;
}

export function HistoryPagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
}: HistoryPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIdx = (page - 1) * pageSize + 1;
  const endIdx = Math.min(page * pageSize, totalItems);

  if (totalItems <= pageSize) return null;

  return (
    <div className="p-3 border-t border-border-strong bg-surface/40 flex items-center justify-between text-xs text-muted-foreground">
      <span>
        Affichage de {startIdx} à {endIdx} sur {totalItems} écritures
      </span>

      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="h-9 min-h-[36px] sm:min-h-[40px] px-2.5 text-xs border-border-strong hover:bg-surface focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Page précédente"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="font-mono font-medium px-2 text-heading text-xs">
          {page} / {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="h-9 min-h-[36px] sm:min-h-[40px] px-2.5 text-xs border-border-strong hover:bg-surface focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Page suivante"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
