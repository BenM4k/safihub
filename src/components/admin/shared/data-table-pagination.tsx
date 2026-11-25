"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function computePagination(page: number, pageSize: number, totalItems: number) {
  const safeSize = Math.max(1, pageSize);
  const totalPages = Math.max(1, Math.ceil(totalItems / safeSize));
  const safePage = Math.max(1, Math.min(totalPages, page));
  const start = totalItems === 0 ? 0 : (safePage - 1) * safeSize + 1;
  const end = Math.min(safePage * safeSize, totalItems);
  return {
    totalPages,
    start,
    end,
    hasPrev: safePage > 1,
    hasNext: safePage < totalPages,
  };
}

interface DataTablePaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  urlMode?: boolean;
  pageParam?: string;
  pageSizeParam?: string;
  showFirstLast?: boolean;
  hideIfSinglePage?: boolean;
  isLoading?: boolean;
  className?: string;
}

const DEFAULT_PAGE_SIZES = [10, 25, 50, 100];

export function DataTablePagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZES,
  urlMode = false,
  pageParam = "page",
  pageSizeParam = "pageSize",
  showFirstLast = false,
  hideIfSinglePage = false,
  isLoading = false,
  className,
}: DataTablePaginationProps) {
  const t = useTranslations("admin.shared");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const { totalPages, start, end, hasPrev, hasNext } = computePagination(
    page,
    pageSize,
    totalItems
  );
  const busy = isLoading || isPending;

  if (hideIfSinglePage && totalPages <= 1 && page <= 1) {
    return null;
  }

  function pushUrlParams(nextPage: number, nextSize?: number) {
    const nextParams = new URLSearchParams(searchParams.toString());
    if (nextPage <= 1) {
      nextParams.delete(pageParam);
    } else {
      nextParams.set(pageParam, String(nextPage));
    }
    if (nextSize !== undefined) {
      nextParams.set(pageSizeParam, String(nextSize));
    }
    const qs = nextParams.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  }

  function handlePage(targetPage: number) {
    const bounded = Math.max(1, Math.min(totalPages, targetPage));
    if (urlMode) pushUrlParams(bounded);
    onPageChange?.(bounded);
  }

  function handleSize(nextValue: string) {
    const parsed = Number(nextValue);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    if (urlMode) pushUrlParams(1, parsed);
    onPageSizeChange?.(parsed);
  }

  return (
    <div
      className={cn(
        "p-3 border-t border-border bg-surface/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-medium text-heading">
          {t("paginationRange", { start, end, total: totalItems })}
        </span>

        {(onPageSizeChange || urlMode) && (
          <div className="flex items-center gap-1.5">
            <span>{t("perPage")}</span>
            <Select value={String(pageSize)} onValueChange={handleSize} disabled={busy}>
              <SelectTrigger
                size="sm"
                aria-label={t("pageSizeLabel")}
                className="min-h-10 sm:min-h-8 h-10 sm:h-8 w-20 bg-card border-border text-xs font-semibold text-heading"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((opt) => (
                  <SelectItem key={opt} value={String(opt)}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        {showFirstLast && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handlePage(1)}
            disabled={!hasPrev || busy}
            className="min-h-11 min-w-11 sm:min-h-9 sm:min-w-9 sm:size-9 border-border hover:bg-surface"
            aria-label={t("firstPage")}
          >
            <ChevronsLeft className="size-4" aria-hidden="true" />
          </Button>
        )}

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => handlePage(page - 1)}
          disabled={!hasPrev || busy}
          className="min-h-11 min-w-11 sm:min-h-9 sm:min-w-9 sm:size-9 border-border hover:bg-surface"
          aria-label={t("prevPage")}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </Button>

        <span className="font-mono font-medium px-2 text-heading tabular-nums">
          {page} / {totalPages}
        </span>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => handlePage(page + 1)}
          disabled={!hasNext || busy}
          className="min-h-11 min-w-11 sm:min-h-9 sm:min-w-9 sm:size-9 border-border hover:bg-surface"
          aria-label={t("nextPage")}
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </Button>

        {showFirstLast && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handlePage(totalPages)}
            disabled={!hasNext || busy}
            className="min-h-11 min-w-11 sm:min-h-9 sm:min-w-9 sm:size-9 border-border hover:bg-surface"
            aria-label={t("lastPage")}
          >
            <ChevronsRight className="size-4" aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  );
}
