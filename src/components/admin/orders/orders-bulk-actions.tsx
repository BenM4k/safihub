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
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 px-4 rounded-xl bg-ink-900 text-white shadow-2xl ring-1 ring-white/10 border border-ink-800 animate-in fade-in slide-in-from-bottom-2 duration-150">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold bg-white/10 px-2.5 py-1 rounded-full">
          {t("bulkSelected", { count: selectedCount })}
        </span>
        <button
          type="button"
          onClick={onClearSelection}
          className="text-white/70 hover:text-white p-1 rounded-md transition-colors"
          aria-label="Désélectionner tout"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          onClick={onExportSelected}
          className="h-8 bg-white/15 hover:bg-white/25 text-white border-none text-xs gap-1.5 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{t("bulkExport")}</span>
        </Button>

        {onReassignSelected && (
          <Button
            type="button"
            size="sm"
            onClick={onReassignSelected}
            className="h-8 bg-white/15 hover:bg-white/25 text-white border-none text-xs gap-1.5 cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>{t("bulkReassign")}</span>
          </Button>
        )}

        {onCancelSelected && (
          <Button
            type="button"
            size="sm"
            onClick={onCancelSelected}
            className="h-8 bg-destructive hover:bg-destructive/90 text-white border-none text-xs gap-1.5 cursor-pointer"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>{t("bulkCancel")}</span>
          </Button>
        )}
      </div>
    </div>
  );
}
