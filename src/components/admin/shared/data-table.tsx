import { type ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { DataTablePagination } from "./data-table-pagination";

export interface DataTableColumn<T> {
  id: string;
  header: ReactNode;
  headerTooltip?: string;
  align?: "left" | "center" | "right";
  className?: string;
  render: (row: T, index: number) => ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string;
  emptyState?: ReactNode;
  caption?: string;
  page?: number;
  pageSize?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyState,
  caption,
  page,
  pageSize,
  totalItems,
  onPageChange,
  isLoading,
}: DataTableProps<T>) {
  const t = useTranslations("admin.shared");

  const hasPagination =
    page !== undefined &&
    pageSize !== undefined &&
    totalItems !== undefined &&
    totalItems > pageSize;

  return (
    <div className="bg-card rounded-xl border border-border-strong shadow-xs overflow-hidden flex flex-col">
      <div className="overflow-x-auto relative">
        <Table className="w-full text-left border-collapse text-xs">
          {caption && <caption className="sr-only">{caption}</caption>}
          <TableHeader>
            <TableRow className="border-b border-border-strong bg-surface/95 backdrop-blur-xs text-ink-700 font-semibold sticky top-0 z-10 hover:bg-surface/95">
              {columns.map((col) => (
                <TableHead
                  key={col.id}
                  scope="col"
                  title={col.headerTooltip}
                  className={cn(
                    "py-3 px-4 text-xs font-semibold text-ink-700",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                    col.align === "left" && "text-left",
                    col.className
                  )}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border-strong/80">
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="py-12 text-center text-muted-foreground"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Spinner className="size-4 text-primary" />
                    <span>{t("loadingData")}</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-8">
                  {emptyState ?? (
                    <div className="text-center text-muted-foreground py-6">
                      {t("noData")}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, idx) => (
                <TableRow
                  key={keyExtractor(row, idx)}
                  className="hover:bg-surface/60 transition-colors border-b border-border-strong/80"
                >
                  {columns.map((col) => (
                    <TableCell
                      key={col.id}
                      className={cn(
                        "py-3 px-4 text-xs",
                        col.align === "right" && "text-right",
                        col.align === "center" && "text-center",
                        col.align === "left" && "text-left",
                        col.className
                      )}
                    >
                      {col.render(row, idx)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {hasPagination && onPageChange && (
        <DataTablePagination
          page={page}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
