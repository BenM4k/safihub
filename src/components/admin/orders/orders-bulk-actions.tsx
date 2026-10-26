"use client";

import { ArrowRightLeft, Download, X, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface OrdersBulkActionsProps {
  selectedCount: number;
  onClearSelection: () => void;
  onExportSelected: () => void;
  onReassignSelected?: () => void;
  onCancelSelected?: () => void;
}

export function OrdersBulkActions({
  selectedCount,
  onClearSelection,
  onExportSelected,
  onReassignSelected,
  onCancelSelected,
}: OrdersBulkActionsProps) {
  const t = useTranslations("admin.orders");

  if (selectedCount === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 px-4 rounded-lg bg-foreground text-background shadow-lg border border-border animate-in fade-in slide-in-from-bottom-2 duration-150">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold bg-background/20 text-background px-2.5 py-1 rounded-full">
          {t("bulkSelected", { count: selectedCount })}
        </span>
        <button
          type="button"
          onClick={onClearSelection}
          className="text-background/70 hover:text-background p-1 rounded-md transition-colors cursor-pointer"
          aria-label={t("deselectAll")}
        >
          <X className="size-3.5" />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={onExportSelected}
          className="h-8 text-xs gap-1.5"
        >
          <Download className="size-3.5" />
          <span>{t("bulkExport")}</span>
        </Button>

        {onReassignSelected && (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={onReassignSelected}
            className="h-8 text-xs gap-1.5"
          >
            <ArrowRightLeft className="size-3.5" />
            <span>{t("bulkReassign")}</span>
          </Button>
        )}

        {onCancelSelected && (
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={onCancelSelected}
            className="h-8 text-xs gap-1.5"
          >
            <XCircle className="size-3.5" />
            <span>{t("bulkCancel")}</span>
          </Button>
        )}
      </div>
    </div>
  );
}
