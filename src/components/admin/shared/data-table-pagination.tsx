import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface DataTablePaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export function DataTablePagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
}: DataTablePaginationProps) {
  const t = useTranslations("admin.shared");
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="p-3 border-t border-border-strong bg-surface/40 flex items-center justify-between text-xs text-muted-foreground">
      <span>
        {t("paginationRange", { start, end, total: totalItems })}
      </span>

      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="h-9 min-h-[36px] sm:min-h-[40px] px-2.5 text-xs border-border-strong hover:bg-surface focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={t("prevPage")}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="font-mono font-medium px-2 text-heading">
          {page} / {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="h-9 min-h-[36px] sm:min-h-[40px] px-2.5 text-xs border-border-strong hover:bg-surface focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={t("nextPage")}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
