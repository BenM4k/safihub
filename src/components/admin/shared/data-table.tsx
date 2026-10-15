import { type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const hasPagination =
    page !== undefined &&
    pageSize !== undefined &&
    totalItems !== undefined &&
    totalItems > pageSize;

  const totalPages =
    pageSize && totalItems ? Math.ceil(totalItems / pageSize) : 1;

  return (
    <div className="bg-card rounded-xl border border-border-strong shadow-xs overflow-hidden flex flex-col">
      <div className="overflow-x-auto relative">
        <table className="w-full text-left border-collapse text-xs">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr className="border-b border-border-strong bg-surface/95 backdrop-blur-xs text-ink-700 font-semibold sticky top-0 z-10">
              {columns.map((col) => (
                <th
                  key={col.id}
                  scope="col"
                  title={col.headerTooltip}
                  className={`py-3 px-4 ${
                    col.align === "right"
                      ? "text-right"
                      : col.align === "center"
                      ? "text-center"
                      : "text-left"
                  } ${col.className ?? ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-strong/80">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <span className="size-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <span>Chargement des données...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-8">
                  {emptyState ?? (
                    <div className="text-center text-muted-foreground py-6">
                      Aucune donnée disponible
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={keyExtractor(row, idx)}
                  className="hover:bg-surface/60 transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={col.id}
                      className={`py-3 px-4 ${
                        col.align === "right"
                          ? "text-right"
                          : col.align === "center"
                          ? "text-center"
                          : "text-left"
                      } ${col.className ?? ""}`}
                    >
                      {col.render(row, idx)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {hasPagination && onPageChange && (
        <div className="p-3 border-t border-border-strong bg-surface/40 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Affichage de {(page - 1) * pageSize + 1} à{" "}
            {Math.min(page * pageSize, totalItems)} sur {totalItems} entrées
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
              aria-label="Page suivante"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
